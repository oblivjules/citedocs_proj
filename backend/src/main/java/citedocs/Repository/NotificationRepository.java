package citedocs.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import citedocs.Entity.NotificationEntity;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Integer> {

    // All notifications for a user, newest first
    List<NotificationEntity> findByUserIdOrderByCreatedAtDesc(Integer userId);

    // Unread count for badge
    long countByUserIdAndIsReadFalse(Integer userId);
}
