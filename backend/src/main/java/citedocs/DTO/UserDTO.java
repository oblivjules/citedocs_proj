package citedocs.DTO;

import citedocs.Entity.UserEntity;
import citedocs.Entity.UserEntity.Role;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for UserEntity that excludes sensitive information
 * like passwords from API responses.
 */
public class UserDTO {
    private int userId;
    private String name;
    private String email;
    private Role role;
    private String sid;  // student_id
    private String aid;  // admin_id
    private LocalDateTime createdAt;

    // Default constructor
    public UserDTO() {
    }

    // Constructor from UserEntity
    public UserDTO(UserEntity user) {
        this.userId = user.getUserId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.sid = user.getSid();
        this.aid = user.getAid();
        this.createdAt = user.getCreatedAt();
    }

    // Getters and Setters
    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getSid() {
        return sid;
    }

    public void setSid(String sid) {
        this.sid = sid;
    }

    public String getAid() {
        return aid;
    }

    public void setAid(String aid) {
        this.aid = aid;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

