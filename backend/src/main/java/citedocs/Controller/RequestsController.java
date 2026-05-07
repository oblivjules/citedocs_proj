package citedocs.Controller;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import citedocs.Entity.RequestsEntity;
import citedocs.Entity.UserEntity;
import citedocs.Service.RequestsService;
import citedocs.Service.UserService;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "http://localhost:3000")
public class RequestsController {

    private final RequestsService requestsService;
    private final UserService userService;

    public RequestsController(RequestsService requestsService, UserService userService) {
        this.requestsService = requestsService;
        this.userService = userService;
    }

    @PostMapping
    public RequestsEntity create(@RequestBody RequestsEntity payload) {
        return requestsService.create(payload);
    }

    @GetMapping
    public List<RequestsEntity> findAll(@RequestParam(required = false) Long userId) {
        if (userId != null) {
            return requestsService.findByUserId(userId);
        }
        return requestsService.findAll();
    }

    @GetMapping("/{id}")
    public RequestsEntity findById(@PathVariable Long id) {
        return requestsService.findById(id);
    }

    @PutMapping("/{id}")
    public RequestsEntity update(@PathVariable Long id, @RequestBody RequestsEntity payload) {
        return requestsService.update(id, payload);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        requestsService.delete(id);
    }

    @PutMapping("/{id}/status")
    public RequestsEntity updateStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest payload, HttpServletRequest request) {
        // Get the authenticated user ID from the request
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            throw new RuntimeException("Unauthorized: No user ID found in request");
        }
        
        Integer userId = Integer.parseInt(userIdAttr.toString());
        
        // Validate that the user is a registrar
        UserEntity user = userService.findById(userId);
        if (user.getRole() != UserEntity.Role.REGISTRAR) {
            throw new RuntimeException("Unauthorized: Only registrars can update request status");
        }
        
        return requestsService.updateStatus(id, payload, userId);
    }
}

