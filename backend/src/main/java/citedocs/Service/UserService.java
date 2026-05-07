package citedocs.Service;

import java.util.List;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import citedocs.Entity.UserEntity;
import citedocs.Exception.ResourceNotFoundException;
import citedocs.Repository.UserRepository;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // ========================
    // GET ALL USERS
    // ========================
    @Transactional(readOnly = true)
    public List<UserEntity> findAll() {
        return userRepository.findAll();
    }

    // ========================
    // GET USER BY ID
    // ========================
    @Transactional(readOnly = true)
    public UserEntity findById(int id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    // ========================
    // GET USER BY EMAIL
    // ========================
    @Transactional(readOnly = true)
    public UserEntity findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // ========================
    // CREATE USER (called by AuthService)
    // ========================
    public UserEntity create(UserEntity user) {
        // Hash password if provided (should already be hashed if coming from AuthService)
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            // Only hash if it's not already a BCrypt hash (BCrypt hashes start with $2a$)
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    // ========================
    // UPDATE USER
    // ========================
    public UserEntity update(int id, UserEntity payload) {
        UserEntity existing = findById(id);

        existing.setName(payload.getName());
        existing.setEmail(payload.getEmail());
        // Only update password if provided and it's not already a hash
        // Note: UserController should prevent password updates, but this is a safety measure
        if (payload.getPassword() != null && !payload.getPassword().startsWith("$2a$")) {
            existing.setPassword(passwordEncoder.encode(payload.getPassword()));
        } else if (payload.getPassword() == null) {
            // Keep existing password if not provided
            // existing password remains unchanged
        } else {
            // Password is already hashed, use as is (shouldn't happen in normal flow)
            existing.setPassword(payload.getPassword());
        }
        existing.setRole(payload.getRole());
        existing.setSid(payload.getSid());
        existing.setAid(payload.getAid());

        return userRepository.save(existing);
    }

    // ========================
    // DELETE USER
    // ========================
    public void delete(int id) {
        UserEntity existing = findById(id);
        userRepository.delete(existing);
    }
}
