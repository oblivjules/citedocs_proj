package citedocs.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import citedocs.Entity.NotificationEntity;
import citedocs.Service.NotificationService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // CREATE notification
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NotificationEntity create(@RequestBody NotificationEntity payload) {
        return notificationService.create(payload);
    }

    // LIST notifications (optionally filter by userId)
    @GetMapping
    public List<NotificationEntity> getAll(
            @RequestParam(value = "userId", required = false) Integer userId) {

        if (userId != null) {
            return notificationService.findByUserId(userId);
        }
        return notificationService.findAll();
    }

    // GET single
    @GetMapping("/{id}")
    public NotificationEntity getById(@PathVariable int id) {
        return notificationService.findById(id);
    }

    // MARK read
    @PutMapping("/{id}/read")
    public NotificationEntity markRead(@PathVariable int id) {
        return notificationService.markAsRead(id);
    }

    // UPDATE (optional)
    @PutMapping("/{id}")
    public NotificationEntity update(@PathVariable int id,
                                     @RequestBody NotificationEntity payload) {
        return notificationService.update(id, payload);
    }

    // DELETE one
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable int id) {
        notificationService.delete(id);
    }

    // DELETE all notifications for a user
    @DeleteMapping("/user/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAllForUser(@PathVariable Integer userId) {
        notificationService.deleteAllForUser(userId);
    }
}
