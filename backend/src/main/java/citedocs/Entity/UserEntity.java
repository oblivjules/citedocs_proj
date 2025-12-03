package citedocs.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name="users")
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="user_id")
    private int uid;

    @Column(name="name", nullable=false)
    private String name;

    @Column(name="email", nullable=false, unique=true)
    private String email;

    @Column(name="password_hash", nullable=false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name="role", nullable=false)
    private Role role;

    @Column(name="student_id", unique=true, nullable=true)
    private String sid;

    @Column(name="admin_id", unique=true, nullable=true)
    private String aid;

    @Column(name="created_at", nullable=false, updatable = false)
    private LocalDateTime createdAt;

    public enum Role {
        REGISTRAR,
        STUDENT,
    }


    public UserEntity() {
        super();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
    
    public UserEntity(String name, String email, String password, Role role, String sid, String aid) {
        super();
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.sid = sid;
        this.aid = aid;
    }

    public int getUserId() {
        return uid;
    }

    public void setUserId(int uid) {
        this.uid = uid;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
