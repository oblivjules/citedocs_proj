package citedocs.Controller;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public ResponseEntity<?> create(@RequestBody RequestsEntity payload, HttpServletRequest request) {
        // Verify user is authenticated
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        int authenticatedUserId = Integer.parseInt(userIdAttr.toString());
        
        // Ensure the request is created for the authenticated user
        // Don't trust userId from payload - use authenticated user ID
        payload.setUserId((long) authenticatedUserId);

        RequestsEntity created = requestsService.create(payload);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<?> findAll(@RequestParam(required = false) Long userId, HttpServletRequest request) {
        // Verify user is authenticated
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        int authenticatedUserId = Integer.parseInt(userIdAttr.toString());
        UserEntity authenticatedUser = userService.findById(authenticatedUserId);
        
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        // If userId parameter is provided, validate it matches authenticated user (unless registrar)
        if (userId != null) {
            if (authenticatedUserId != userId.intValue() && authenticatedUser.getRole() != UserEntity.Role.REGISTRAR) {
                return ResponseEntity.status(403).body(Map.of("message", "Forbidden: You can only view your own requests"));
            }
            return ResponseEntity.ok(requestsService.findByUserId(userId));
        }

        // If no userId parameter, return all requests only for registrars
        if (authenticatedUser.getRole() == UserEntity.Role.REGISTRAR) {
            return ResponseEntity.ok(requestsService.findAll());
        } else {
            // Students can only see their own requests
            return ResponseEntity.ok(requestsService.findByUserId((long) authenticatedUserId));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id, HttpServletRequest request) {
        // Verify user is authenticated
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        int authenticatedUserId = Integer.parseInt(userIdAttr.toString());
        UserEntity authenticatedUser = userService.findById(authenticatedUserId);
        
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        RequestsEntity requestEntity = requestsService.findById(id);
        if (requestEntity == null) {
            return ResponseEntity.notFound().build();
        }

        // Users can only see their own requests, unless they're a registrar
        if (authenticatedUserId != requestEntity.getUserId().intValue() && 
            authenticatedUser.getRole() != UserEntity.Role.REGISTRAR) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden: You can only view your own requests"));
        }

        return ResponseEntity.ok(requestEntity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody RequestsEntity payload, HttpServletRequest request) {
        // Verify user is authenticated
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        int authenticatedUserId = Integer.parseInt(userIdAttr.toString());
        
        RequestsEntity existingRequest = requestsService.findById(id);
        if (existingRequest == null) {
            return ResponseEntity.notFound().build();
        }

        // Users can only update their own requests
        if (authenticatedUserId != existingRequest.getUserId().intValue()) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden: You can only update your own requests"));
        }

        // Don't allow userId changes - use existing request's userId
        payload.setUserId(existingRequest.getUserId());

        RequestsEntity updated = requestsService.update(id, payload);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, HttpServletRequest request) {
        // Verify user is authenticated
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        int authenticatedUserId = Integer.parseInt(userIdAttr.toString());
        
        RequestsEntity existingRequest = requestsService.findById(id);
        if (existingRequest == null) {
            return ResponseEntity.notFound().build();
        }

        // Users can only delete their own requests
        if (authenticatedUserId != existingRequest.getUserId().intValue()) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden: You can only delete your own requests"));
        }

        requestsService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest payload, HttpServletRequest request) {
        // Verify user is authenticated
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        
        Integer userId = Integer.parseInt(userIdAttr.toString());
        
        // Validate that the user is a registrar
        UserEntity user = userService.findById(userId);
        if (user == null || user.getRole() != UserEntity.Role.REGISTRAR) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden: Only registrars can update request status"));
        }
        
        try {
            RequestsEntity updated = requestsService.updateStatus(id, payload, userId);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "An error occurred while updating status"));
        }
    }
}

