package citedocs.Service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import citedocs.Entity.UserEntity;
import citedocs.Entity.UserEntity.Role;
import citedocs.Repository.UserRepository;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // ========================================================
    // 📌 LOGIN (email + password)
    // ========================================================
    public UserEntity authenticate(String email, String password) {
        UserEntity user = userRepository.findByEmail(email);

        if (user == null) return null;

        String storedPassword = user.getPassword();
        boolean passwordMatches = false;

        // Check if password is already hashed (BCrypt hashes start with $2a$, $2b$, or $2y$)
        if (storedPassword != null && (storedPassword.startsWith("$2a$") || 
                                       storedPassword.startsWith("$2b$") || 
                                       storedPassword.startsWith("$2y$"))) {
            // Password is hashed, use BCrypt to verify
            passwordMatches = passwordEncoder.matches(password, storedPassword);
        } else {
            // Legacy plaintext password - compare directly
            // Then automatically upgrade to hashed password
            passwordMatches = storedPassword != null && storedPassword.equals(password);
            
            if (passwordMatches) {
                // Upgrade plaintext password to BCrypt hash
                user.setPassword(passwordEncoder.encode(password));
                userRepository.save(user);
            }
        }

        if (!passwordMatches) {
            return null;
        }

        return user;
    }

    // ========================================================
    // 📌 REGISTER (WORKS FOR BOTH STUDENT + REGISTRAR)
    // ========================================================
    public UserEntity registerUser(
            String fullName,
            String email,
            String password,
            Role role,
            String studentId,
            String adminId
    ) {

        // --- 1. Check if email already exists ---
        if (userRepository.findByEmail(email) != null) {
            throw new RuntimeException("Email already exists.");
        }

        // --- 2. Create new user ---
        UserEntity newUser = new UserEntity();
        newUser.setName(fullName);
        newUser.setEmail(email);
        // Hash password before storing
        newUser.setPassword(passwordEncoder.encode(password));
        newUser.setRole(role);

        // Assign ID based on role
        if (role == Role.STUDENT) {
            newUser.setSid(studentId);
            newUser.setAid(null);
        } else if (role == Role.REGISTRAR) {
            newUser.setAid(adminId);
            newUser.setSid(null);
        }

        // --- 3. Save user ---
        return userRepository.save(newUser);
    }
}
