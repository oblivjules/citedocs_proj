package citedocs.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import citedocs.Entity.RequestStatusLogEntity;
import citedocs.Entity.UserEntity;
import citedocs.Entity.UserEntity.Role;
import citedocs.Exception.ResourceNotFoundException;
import citedocs.Repository.RequestStatusLogRepository;
import citedocs.Repository.UserRepository;

@Service
@Transactional
public class RequestStatusLogService {

    private final RequestStatusLogRepository requestStatusLogRepository;
    private final UserRepository userRepository;

    public RequestStatusLogService(RequestStatusLogRepository requestStatusLogRepository, UserRepository userRepository) {
        this.requestStatusLogRepository = requestStatusLogRepository;
        this.userRepository = userRepository;
    }

    public RequestStatusLogEntity create(RequestStatusLogEntity log) {
        return requestStatusLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<RequestStatusLogEntity> findAll() {
        List<RequestStatusLogEntity> logs = requestStatusLogRepository.findAll();
        return enrichLogs(logs);
    }

    @Transactional(readOnly = true)
    public List<RequestStatusLogEntity> findByUserId(Long userId) {
        List<RequestStatusLogEntity> logs = requestStatusLogRepository.findByUserId(userId);
        return enrichLogs(logs);
    }

    private List<RequestStatusLogEntity> enrichLogs(List<RequestStatusLogEntity> logs) {
        return logs.stream().map(this::enrichLog).toList();
    }

    private RequestStatusLogEntity enrichLog(RequestStatusLogEntity log) {
        if (log != null && log.getChangedBy() > 0) {
            Optional<UserEntity> userOpt = userRepository.findById(log.getChangedBy());
            if (userOpt.isPresent()) {
                UserEntity user = userOpt.get();
                // Only set name if the user is a registrar
                if (user.getRole() == Role.REGISTRAR) {
                    log.setChangedByName(user.getName());
                }
            }
        }
        return log;
    }

    @Transactional(readOnly = true)
    public RequestStatusLogEntity findById(int id) {
        RequestStatusLogEntity log = requestStatusLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RequestStatusLog", "id", id));
        return enrichLog(log);
    }

    public RequestStatusLogEntity update(int id, RequestStatusLogEntity payload) {
        RequestStatusLogEntity existing = findById(id);
        existing.setRequestId(payload.getRequestId());
        existing.setOldStatus(payload.getOldStatus());
        existing.setNewStatus(payload.getNewStatus());
        existing.setChangedBy(payload.getChangedBy());
        return requestStatusLogRepository.save(existing);
    }

    public void delete(int id) {
        RequestStatusLogEntity existing = findById(id);
        requestStatusLogRepository.delete(existing);
    }
}

