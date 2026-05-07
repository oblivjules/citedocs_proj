package citedocs.Controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import citedocs.Entity.UserEntity;
import citedocs.Service.UserService;
import citedocs.DTO.UserDTO;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Create user
    @PostMapping
    public ResponseEntity<UserDTO> create(@RequestBody UserEntity user) {
        UserEntity created = userService.create(user);
        return ResponseEntity.ok(new UserDTO(created));
    }

    // Get all users
    @GetMapping
    public List<UserDTO> findAll() {
        return userService.findAll().stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> findById(@PathVariable int id) {
        UserEntity user = userService.findById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new UserDTO(user));
    }

    // Update user - requires authentication and authorization
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable int id, 
            @RequestBody UserEntity payload,
            HttpServletRequest request
    ) {
        // Verify user is authenticated
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        int authenticatedUserId = Integer.parseInt(userIdAttr.toString());
        
        // Prevent users from modifying other users' data
        if (authenticatedUserId != id) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden: You can only modify your own data"));
        }

        // Prevent password updates through this endpoint (use separate password change endpoint)
        UserEntity existingUser = userService.findById(id);
        if (existingUser != null && payload.getPassword() != null) {
            // Don't allow password updates here - password should be changed via dedicated endpoint
            payload.setPassword(existingUser.getPassword());
        }

        UserEntity updated = userService.update(id, payload);
        return ResponseEntity.ok(new UserDTO(updated));
    }

    // Delete user - requires authentication and authorization
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id, HttpServletRequest request) {
        // Verify user is authenticated
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        int authenticatedUserId = Integer.parseInt(userIdAttr.toString());
        
        // Prevent users from deleting other users' data
        if (authenticatedUserId != id) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden: You can only delete your own account"));
        }

        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        Long userId = Long.parseLong(userIdAttr.toString());
        UserEntity user = userService.findById(userId.intValue());
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }

        // Return UserDTO to exclude sensitive data
        return ResponseEntity.ok(new UserDTO(user));
    }
}
