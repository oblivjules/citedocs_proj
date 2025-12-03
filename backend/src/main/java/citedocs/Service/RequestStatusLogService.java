package citedocs.Service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import citedocs.Entity.RequestStatusLogEntity;
import citedocs.Exception.ResourceNotFoundException;
import citedocs.Repository.RequestStatusLogRepository;

@Service
@Transactional
public class RequestStatusLogService {

    private final RequestStatusLogRepository requestStatusLogRepository;

    public RequestStatusLogService(RequestStatusLogRepository requestStatusLogRepository) {
        this.requestStatusLogRepository = requestStatusLogRepository;
    }

    public RequestStatusLogEntity create(RequestStatusLogEntity log) {
        return requestStatusLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<RequestStatusLogEntity> findAll() {
        return requestStatusLogRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<RequestStatusLogEntity> findByUserId(Long userId) {
        return requestStatusLogRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public RequestStatusLogEntity findById(int id) {
        return requestStatusLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RequestStatusLog", "id", id));
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

