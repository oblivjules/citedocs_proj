package citedocs.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import citedocs.Security.JwtUtil;
import citedocs.Service.AuthService;
import citedocs.Entity.UserEntity;
import citedocs.Entity.UserEntity.Role;
import citedocs.DTO.UserDTO;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    // ======================================================
    // 📌 LOGIN ENDPOINT
    // ======================================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String password = body.get("password");

            // Validate input
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.status(400).body(Map.of(
                        "message", "Email is required"
                ));
            }

            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.status(400).body(Map.of(
                        "message", "Password is required"
                ));
            }

            UserEntity user = authService.authenticate(email.trim(), password);

            if (user == null) {
                return ResponseEntity.status(401).body(Map.of(
                        "message", "Invalid email or password"
                ));
            }

            String token = jwtUtil.generateToken(String.valueOf(user.getUserId()));

            // Return UserDTO instead of UserEntity to exclude sensitive data
            UserDTO userDTO = new UserDTO(user);

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "user", userDTO
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "message", "An error occurred during login",
                    "error", e.getMessage()
            ));
        }
    }

    // ======================================================
    // 📌 REGISTER ENDPOINT (handles both STUDENT + REGISTRAR)
    // ======================================================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            // Extract inputs from frontend
            String firstName = body.get("firstName");
            String lastName = body.get("lastName");
            String email = body.get("email");
            String password = body.get("password");
            String role = body.get("role");         // "STUDENT" or "REGISTRAR"
            String studentId = body.get("studentId");

            // Validate inputs
            if (firstName == null || firstName.trim().isEmpty() ||
                lastName == null || lastName.trim().isEmpty() ||
                email == null || email.trim().isEmpty() ||
                password == null || password.trim().isEmpty() ||
                role == null || role.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "All required fields must be provided"
                ));
            }

            // SECURITY: Prevent unauthorized role registration
            // Only allow STUDENT role registration through public endpoint
            // REGISTRAR accounts must be created by existing registrars
            Role userRole;
            try {
                userRole = Role.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid role. Only STUDENT registration is allowed."
                ));
            }

            if (userRole == Role.REGISTRAR) {
                return ResponseEntity.status(403).body(Map.of(
                        "error", "Forbidden: Registrar accounts cannot be created through public registration"
                ));
            }

            // Convert names → one full name (because UserEntity only has `name`)
            String fullName = firstName.trim() + " " + lastName.trim();

            // Save user
            UserEntity user = authService.registerUser(
                    fullName,
                    email.trim(),
                    password,
                    userRole,
                    studentId != null ? studentId.trim() : null,
                    null  // adminId is null for students
            );

            // Return UserDTO instead of UserEntity to exclude sensitive data
            UserDTO userDTO = new UserDTO(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Registration successful",
                    "user", userDTO
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    // ======================================================
    // 📌 LOGOUT
    // ======================================================
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
