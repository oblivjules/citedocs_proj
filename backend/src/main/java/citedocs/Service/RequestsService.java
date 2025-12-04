package citedocs.Service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import citedocs.Entity.DocumentsEntity;
import citedocs.Entity.RequestsEntity;
import citedocs.Controller.StatusUpdateRequest;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import citedocs.Entity.RequestStatusLogEntity;
import citedocs.Exception.ResourceNotFoundException;
import citedocs.Repository.DocumentsRepository;
import citedocs.Repository.RequestsRepository;
import citedocs.Repository.RequestStatusLogRepository;
import citedocs.Repository.UserRepository;
import citedocs.Repository.PaymentRepository;

@Service
@Transactional
public class RequestsService {

    private final RequestsRepository requestsRepository;
    private final DocumentsRepository documentsRepository;
    private final RequestStatusLogRepository requestStatusLogRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    public RequestsService(RequestsRepository requestsRepository, DocumentsRepository documentsRepository, RequestStatusLogRepository requestStatusLogRepository, UserRepository userRepository, PaymentRepository paymentRepository) {
        this.requestsRepository = requestsRepository;
        this.documentsRepository = documentsRepository;
        this.requestStatusLogRepository = requestStatusLogRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
    }

    public RequestsEntity create(RequestsEntity request) {
        request.setDocument(resolveDocument(request.getDocument()));
        return requestsRepository.save(request);
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
        if (payload.getDateReady() != null) {
            existing.setDateReady(payload.getDateReady());
        }
        if (payload.getDocument() != null) {
            existing.setDocument(resolveDocument(payload.getDocument()));
        }
        return requestsRepository.save(existing);
    }

    public void delete(Long id) {
        RequestsEntity existing = findById(id);
        requestsRepository.delete(existing);
    }

    public RequestsEntity updateStatus(Long id, StatusUpdateRequest payload) {
        RequestsEntity existing = findById(id);
        RequestsEntity.Status oldStatus = existing.getStatus();

        // Parse new status from string safely
        RequestsEntity.Status newStatus = RequestsEntity.Status.fromString(payload.getStatus());
        if (newStatus == null) {
            throw new IllegalArgumentException("Invalid status value: " + payload.getStatus());
        }

        // Update the request
        existing.setStatus(newStatus);

        // Parse and set dateReady if provided (handles offset/Z and plain LocalDateTime)
        if (payload.getDateReady() != null && !payload.getDateReady().isEmpty()) {
            try {
                LocalDateTime parsed = OffsetDateTime.parse(payload.getDateReady()).toLocalDateTime();
                existing.setDateReady(parsed);
            } catch (DateTimeParseException ex) {
                // fallback to LocalDateTime parse
                try {
                    LocalDateTime parsed = LocalDateTime.parse(payload.getDateReady());
                    existing.setDateReady(parsed);
                } catch (DateTimeParseException ex2) {
                    // ignore invalid date formats
                }
            }
        }

        RequestsEntity updated = requestsRepository.save(existing);

        // Log the status change (include remarks if present)
        RequestStatusLogEntity log = new RequestStatusLogEntity();
        log.setRequestId(id);
        log.setOldStatus(oldStatus != null ? oldStatus.toString() : null);
        log.setNewStatus(newStatus.toString());
        log.setChangedBy(existing.getUserId() != null ? existing.getUserId().intValue() : 0); // or use authenticated user ID
        log.setRemarks(payload.getRemarks());
        requestStatusLogRepository.save(log);

        return enrichRequest(updated);
    }

    private DocumentsEntity resolveDocument(DocumentsEntity documentPayload) {
        if (documentPayload == null || documentPayload.getDocumentId() == null) {
            throw new ResourceNotFoundException("Document", "id", "missing");
        }
        Long documentId = documentPayload.getDocumentId();
        return documentsRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id",
                        documentId));
    }

    // Helper method to enrich a single request with user and payment data
    private RequestsEntity enrichRequest(RequestsEntity request) {
        if (request != null) {
            // Fetch and set user info (convert Long to Integer for repository lookup)
            if (request.getUserId() != null) {
                userRepository.findById(request.getUserId().intValue()).ifPresent(user -> {
                    request.setUserName(user.getName());
                    request.setStudentId(user.getSid());  // sid is the student ID field
                });
            }

            // Fetch and set payment proof
            paymentRepository.findByRequestId(request.getRequestId()).ifPresent(payment -> {
                request.setProofOfPayment(payment.getProofOfPayment());
            });

            // Set document name
            if (request.getDocument() != null && request.getDocument().getName() != null) {
                request.setDocumentName(request.getDocument().getName());
            }
        }
        return request;
    }

    // Helper method to enrich multiple requests
    private List<RequestsEntity> enrichRequests(List<RequestsEntity> requests) {
        return requests.stream()
                .map(this::enrichRequest)
                .toList();
    }
}

