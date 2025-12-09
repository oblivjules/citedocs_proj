package citedocs.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import citedocs.Entity.DocumentsEntity;
import citedocs.Entity.RequestsEntity;
import citedocs.Controller.StatusUpdateRequest;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.Year;
import citedocs.Entity.RequestStatusLogEntity;
import citedocs.Entity.ClaimSlipEntity;
import citedocs.Exception.ResourceNotFoundException;
import citedocs.Repository.DocumentsRepository;
import citedocs.Repository.RequestsRepository;
import citedocs.Repository.RequestStatusLogRepository;
import citedocs.Repository.UserRepository;
import citedocs.Repository.PaymentRepository;
import citedocs.Repository.ClaimSlipRepository;
import citedocs.Entity.UserEntity;
import citedocs.Service.NotificationService;

@Service
@Transactional
public class RequestsService {

    private final RequestsRepository requestsRepository;
    private final DocumentsRepository documentsRepository;
    private final RequestStatusLogRepository requestStatusLogRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final ClaimSlipRepository claimSlipRepository;
    private final NotificationService notificationService;

    public RequestsService(RequestsRepository requestsRepository,
                           DocumentsRepository documentsRepository,
                           RequestStatusLogRepository requestStatusLogRepository,
                           UserRepository userRepository,
                           PaymentRepository paymentRepository,
                           ClaimSlipRepository claimSlipRepository,
                           NotificationService notificationService) {
        this.requestsRepository = requestsRepository;
        this.documentsRepository = documentsRepository;
        this.requestStatusLogRepository = requestStatusLogRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.claimSlipRepository = claimSlipRepository;
        this.notificationService = notificationService;
    }

    // CREATE REQUEST (Notify Registrar)
    public RequestsEntity create(RequestsEntity request) {

        request.setDocument(resolveDocument(request.getDocument()));
        RequestsEntity saved = requestsRepository.save(request);

        // Fetch student info for message
        String studentName = "A student";
        String studentSid = null;

        if (saved.getUserId() != null) {
            Optional<UserEntity> maybeUser = userRepository.findById(saved.getUserId().intValue());
            if (maybeUser.isPresent()) {
                UserEntity user = maybeUser.get();
                studentName = user.getName() != null ? user.getName() : studentName;
                studentSid = user.getSid();
            }
        }

        // Notify all registrars
        List<UserEntity> registrars = userRepository.findByRole(UserEntity.Role.REGISTRAR);
        String docName = saved.getDocument() != null ? saved.getDocument().getName() : "a document";

        String message = String.format(
                "New request submitted by %s%s for %s.",
                studentName,
                (studentSid != null ? " (SID: " + studentSid + ")" : ""),
                docName
        );

        for (UserEntity reg : registrars) {
            notificationService.sendNotification(
                    reg.getUserId(),                  // ⭐ FIXED getUserId()
                    saved.getRequestId(),
                    message
            );
        }

        return saved;
    }

    @Transactional(readOnly = true)
    public List<RequestsEntity> findAll() {
        List<RequestsEntity> requests = requestsRepository.findAll();
        return enrichRequests(requests);
    }

    @Transactional(readOnly = true)
    public List<RequestsEntity> findByUserId(Long userId) {
        List<RequestsEntity> requests = requestsRepository.findByUserId(userId);
        return enrichRequests(requests);
    }

    @Transactional(readOnly = true)
    public RequestsEntity findById(Long id) {
        return requestsRepository.findById(id)
                .map(this::enrichRequest)
                .orElseThrow(() -> new ResourceNotFoundException("Request", "id", id));
    }

    public RequestsEntity update(Long id, RequestsEntity payload) {
        RequestsEntity existing = findById(id);
        existing.setUserId(payload.getUserId());
        existing.setStatus(payload.getStatus());
        existing.setCopies(payload.getCopies());
        existing.setDateNeeded(payload.getDateNeeded());

        if (payload.getDateReady() != null)
            existing.setDateReady(payload.getDateReady());

        if (payload.getDocument() != null)
            existing.setDocument(resolveDocument(payload.getDocument()));

        return requestsRepository.save(existing);
    }

    public void delete(Long id) {
        RequestsEntity existing = findById(id);
        requestsRepository.delete(existing);
    }

    // UPDATE STATUS (Notify Student)
    public RequestsEntity updateStatus(Long id, StatusUpdateRequest payload, Integer registrarUserId) {

        RequestsEntity existing = findById(id);
        RequestsEntity.Status oldStatus = existing.getStatus();

        RequestsEntity.Status newStatus = RequestsEntity.Status.fromString(payload.getStatus());
        if (newStatus == null)
            throw new IllegalArgumentException("Invalid status: " + payload.getStatus());

        // Check if status is already the same
        if (oldStatus == newStatus) {
            throw new IllegalArgumentException("Request is already " + newStatus);
        }

        existing.setStatus(newStatus);

        // --------------------------------------------------------
        // APPROVED LOGIC: Set date_ready ONCE when first approved
        // --------------------------------------------------------
        boolean isFirstTimeApproved = (oldStatus != RequestsEntity.Status.APPROVED 
                                        && newStatus == RequestsEntity.Status.APPROVED);

        if (isFirstTimeApproved && existing.getDateReady() == null) {
            // Only set date_ready if it's the first time being approved AND it's not already set
            LocalDate parsedDateReady = null;
            
            if (payload.getDateReady() != null && !payload.getDateReady().trim().isEmpty()) {
                try {
                    String dateStr = payload.getDateReady().trim();
                    // Handle ISO format with time (e.g., "2025-12-11T00:00:00" or "2025-12-11")
                    if (dateStr.contains("T")) {
                        dateStr = dateStr.split("T")[0];
                    }
                    // Try parsing as LocalDate (YYYY-MM-DD format)
                    parsedDateReady = LocalDate.parse(dateStr);
                } catch (Exception e) {
                    // If parsing fails, will use today's date as fallback
                }
            }
            
            // Set date_ready: use parsed date or fallback to today
            // Use noon (12:00:00) instead of midnight to avoid timezone conversion issues
            if (parsedDateReady != null) {
                existing.setDateReady(parsedDateReady.atTime(12, 0, 0));
            } else {
                existing.setDateReady(LocalDate.now().atTime(12, 0, 0));
            }
        }
        // If not first time approved, don't touch date_ready

        RequestsEntity updated = requestsRepository.save(existing);

        // STATUS LOG
        RequestStatusLogEntity log = new RequestStatusLogEntity();
        log.setRequestId(id);
        log.setOldStatus(oldStatus != null ? oldStatus.toString() : null);
        log.setNewStatus(newStatus.toString());
        // Use registrar's user ID (the one updating the status), not the student's
        log.setChangedBy(registrarUserId != null ? registrarUserId : 0);
        log.setRemarks(payload.getRemarks());

        requestStatusLogRepository.save(log);

        // GENERATE CLAIM SLIP IF STATUS IS APPROVED
        if (newStatus == RequestsEntity.Status.APPROVED) {
            // Check if claim slip already exists
            Optional<ClaimSlipEntity> existingClaim = claimSlipRepository.findByRequestId(id);

            if (existingClaim.isEmpty()) {
                // Create claim slip only once when first approved
                ClaimSlipEntity claimSlip = new ClaimSlipEntity();
                claimSlip.setRequestId(id);
                
                // Generate claim number: REQ-YYYY-XXX format
                int year = Year.now().getValue();
                // Use request ID as sequence number, padded to 3 digits
                String claimNumber = String.format("REQ-%d-%03d", year, id.intValue());
                claimSlip.setClaimNumber(claimNumber);
                
                // Set date ready: use request's date_ready or fallback to today
                LocalDate claimDate = (updated.getDateReady() != null) 
                    ? updated.getDateReady().toLocalDate() 
                    : LocalDate.now();
                claimSlip.setDateReady(claimDate);
                
                // Set issued by to the registrar who approved it
                claimSlip.setIssuedBy(registrarUserId != null ? registrarUserId : 0);
                
                claimSlipRepository.save(claimSlip);
            }
            // If claim slip already exists, don't modify it
        }

        // SEND NOTIFICATION TO STUDENT
        if (existing.getUserId() != null) {
            int studentUserId = existing.getUserId().intValue();
            String requestIdStr = String.format("REQ-%d", existing.getRequestId());
            String statusStr = newStatus.toString().toUpperCase();
            
            String notifMessage = String.format(
                    "Your document request (%s) is now %s.",
                    requestIdStr,
                    statusStr
            );
            
            // Add remarks if provided
            if (payload.getRemarks() != null && !payload.getRemarks().trim().isEmpty()) {
                notifMessage += " Remarks: " + payload.getRemarks().trim();
            }

            notificationService.sendNotification(
                    studentUserId,
                    existing.getRequestId(),
                    notifMessage
            );
        }

        return enrichRequest(updated);
    }

    private DocumentsEntity resolveDocument(DocumentsEntity documentPayload) {
        if (documentPayload == null || documentPayload.getDocumentId() == null)
            throw new ResourceNotFoundException("Document", "id", "missing");

        Long documentId = documentPayload.getDocumentId();

        return documentsRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
    }

    private RequestsEntity enrichRequest(RequestsEntity request) {
        if (request != null) {

            if (request.getUserId() != null) {
                userRepository.findById(request.getUserId().intValue()).ifPresent(user -> {
                    request.setUserName(user.getName());
                    request.setStudentId(user.getSid());
                });
            }

            paymentRepository.findByRequestId(request.getRequestId()).ifPresent(payment ->
                    request.setProofOfPayment(payment.getProofOfPayment())
            );

            if (request.getDocument() != null)
                request.setDocumentName(request.getDocument().getName());
        }

        return request;
    }

    private List<RequestsEntity> enrichRequests(List<RequestsEntity> requests) {
        return requests.stream().map(this::enrichRequest).toList();
    }
}
