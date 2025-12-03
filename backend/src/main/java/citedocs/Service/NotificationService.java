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

    // CREATE
    public NotificationEntity create(NotificationEntity payload) {
        payload.setId(null);
        payload.setIsRead(false);
        return notificationRepository.save(payload);
    }

    // LIST all
    public List<NotificationEntity> findAll() {
        return notificationRepository.findAll();
    }

    // ⭐ FIX: This method MUST EXIST
    public List<NotificationEntity> findByUserId(Integer userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // GET single
    public NotificationEntity findById(int id) {
        return notificationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Notification", "id", id));
    }

    // MARK AS READ
    public NotificationEntity markAsRead(int id) {
        NotificationEntity notif = findById(id);
        notif.setIsRead(true);
        return notificationRepository.save(notif);
    }

    // UPDATE
    public NotificationEntity update(int id, NotificationEntity payload) {
        NotificationEntity existing = findById(id);
        existing.setMessage(payload.getMessage());
        existing.setIsRead(payload.getIsRead());
        existing.setRequestId(payload.getRequestId());
        existing.setUserId(payload.getUserId());
        return notificationRepository.save(existing);
    }

    // DELETE one
    public void delete(int id) {
        NotificationEntity notif = findById(id);
        notificationRepository.delete(notif);
    }

    // DELETE all for user
    public void deleteAllForUser(Integer userId) {
        List<NotificationEntity> list = findByUserId(userId);
        notificationRepository.deleteAll(list);
    }
}
