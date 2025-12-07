package citedocs.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import citedocs.Entity.NotificationEntity;
import citedocs.Service.NotificationService;

@CrossOrigin
@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Create (already existing)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NotificationEntity create(@RequestBody NotificationEntity payload) {
        return notificationService.create(payload);
    }

    // Get all notifications (admin use)
    @GetMapping
    public List<NotificationEntity> findAll() {
        return notificationService.findAll();
    }

    // Get notifications for a specific user (most recent first)
    @GetMapping("/user/{userId}")
    public List<NotificationEntity> findByUser(@PathVariable int userId) {
        return notificationService.findByUserId(userId);
    }

    // Get only unread notifications for a specific user
    @GetMapping("/user/{userId}/unread")
    public List<NotificationEntity> findUnreadByUser(@PathVariable int userId) {
        return notificationService.findUnreadByUserId(userId);
    }

    // Mark a notification as read (idempotent)
    @PutMapping("/{id}/read")
    public NotificationEntity markAsRead(@PathVariable int id) {
        return notificationService.markAsRead(id);
    }

    // Update (full update)
    @PutMapping("/{id}")
    public NotificationEntity update(@PathVariable int id, @RequestBody NotificationEntity payload) {
        return notificationService.update(id, payload);
    }

    // Delete
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable int id) {
        notificationService.delete(id);
    }
}
