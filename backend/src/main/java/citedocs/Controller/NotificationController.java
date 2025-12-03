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

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public NotificationEntity create(@RequestBody NotificationEntity payload) {
        return notificationService.create(payload);
    }

    @GetMapping
    public List<NotificationEntity> findAll() {
        return notificationService.findAll();
    }

    @GetMapping("/{id}")
    public NotificationEntity findById(@PathVariable int id) {
        return notificationService.findById(id);
    }

    @PutMapping("/{id}")
    public NotificationEntity update(@PathVariable int id, @RequestBody NotificationEntity payload) {
        return notificationService.update(id, payload);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable int id) {
        notificationService.delete(id);
    }
}

