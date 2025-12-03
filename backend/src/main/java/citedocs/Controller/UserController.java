package citedocs.Controller;

import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import citedocs.Entity.UserEntity;
import citedocs.Service.UserService;

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
    public UserEntity create(@RequestBody UserEntity user) {
        return userService.create(user);
    }

    // Get all users
    @GetMapping
    public List<UserEntity> findAll() {
        return userService.findAll();
    }

    // Get user by ID
    @GetMapping("/{id}")
    public UserEntity findById(@PathVariable int id) {
        return userService.findById(id);
    }

    // Update user
    @PutMapping("/{id}")
    public UserEntity update(@PathVariable int id, @RequestBody UserEntity payload) {
        return userService.update(id, payload);
    }

    // Delete user
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable int id) {
        userService.delete(id);
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

        return ResponseEntity.ok(user);
    }
}
