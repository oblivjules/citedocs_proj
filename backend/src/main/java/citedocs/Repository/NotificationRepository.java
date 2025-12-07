package citedocs.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import citedocs.Entity.NotificationEntity;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Integer> {

    // find notifications for a specific user, recent first
    List<NotificationEntity> findByUserIdOrderByCreatedAtDesc(int userId);

    // find unread notifications for a specific user, recent first
    List<NotificationEntity> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(int userId);
}
