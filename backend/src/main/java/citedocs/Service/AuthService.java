package citedocs.Service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import citedocs.Entity.UserEntity;
import citedocs.Entity.UserEntity.Role;
import citedocs.Repository.UserRepository;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ========================================================
    // 📌 LOGIN (email + password)
    // ========================================================
    public UserEntity authenticate(String email, String password) {
        UserEntity user = userRepository.findByEmail(email);

        if (user == null) return null;

        // NOTE: plaintext check (you can add hashing later)
        if (!user.getPassword().equals(password)) return null;

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
        newUser.setPassword(password);
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
