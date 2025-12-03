package citedocs.Service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import citedocs.Entity.NotificationEntity;
import citedocs.Exception.ResourceNotFoundException;
import citedocs.Repository.NotificationRepository;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public NotificationEntity create(NotificationEntity notification) {
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationEntity> findAll() {
        return notificationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public NotificationEntity findById(int id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
    }

    public NotificationEntity update(int id, NotificationEntity payload) {
        NotificationEntity existing = findById(id);
        existing.setUserId(payload.getUserId());
        existing.setRequestId(payload.getRequestId());
        existing.setMessage(payload.getMessage());
        existing.setIsRead(payload.getIsRead());
        return notificationRepository.save(existing);
    }

    public void delete(int id) {
        NotificationEntity existing = findById(id);
        notificationRepository.delete(existing);
    }
}

