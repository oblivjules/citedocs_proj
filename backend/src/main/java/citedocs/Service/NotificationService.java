package citedocs.Service;

import java.util.List;
import java.util.Optional;

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

    /**
     * Convenience helper called by other services to create a notification.
     *
     * @param userId recipient user id (int)
     * @param requestId related request id (Long) - converted to int for NotificationEntity
     * @param message message body
     * @return saved notification
     */
    public NotificationEntity sendNotification(int userId, Long requestId, String message) {
        NotificationEntity notif = new NotificationEntity();
        notif.setUserId(userId);
        // convert safely, if requestId is null use 0
        notif.setRequestId(requestId != null ? Math.toIntExact(requestId) : 0);
        notif.setMessage(message);
        notif.setIsRead(false);
        return notificationRepository.save(notif);
    }

    @Transactional(readOnly = true)
    public List<NotificationEntity> findAll() {
        return notificationRepository.findAll();
    }

    /**
     * List notifications for a user (most recent first).
     */
    @Transactional(readOnly = true)
    public List<NotificationEntity> findByUserId(int userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * List unread notifications for a user (most recent first).
     */
    @Transactional(readOnly = true)
    public List<NotificationEntity> findUnreadByUserId(int userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
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

    /**
     * Mark a notification as read. Idempotent (if already read, it remains read).
     *
     * @param id notification id
     * @return updated notification
     */
    public NotificationEntity markAsRead(int id) {
        NotificationEntity existing = findById(id);
        if (!existing.getIsRead()) {
            existing.setIsRead(true);
            return notificationRepository.save(existing);
        }
        return existing;
    }
}
