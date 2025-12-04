package citedocs.Entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonCreator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "requests")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class RequestsEntity {

    public enum Status {
        PENDING,
        PROCESSING,
        COMPLETED,
        APPROVED,
        REJECTED;

        @JsonCreator
        public static Status fromString(String key) {
            if (key == null) return null;
            try {
                return Status.valueOf(key.toUpperCase());
            } catch (IllegalArgumentException ex) {
                return null;
            }
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private DocumentsEntity document;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "varchar(32)")
    private Status status = Status.PENDING;

    @Column(nullable = false)
    private int copies;

    @Column(name = "date_needed")
    private LocalDate dateNeeded;

    @Column(name = "date_ready")
    private LocalDateTime dateReady;   // <-- NEW FIELD HERE

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Transient fields for enriched responses (populated by service)
    @jakarta.persistence.Transient
    private String userName;  // Student name from UserEntity

    @jakarta.persistence.Transient
    private String studentId;  // Student ID from UserEntity

    @jakarta.persistence.Transient
    private String proofOfPayment;  // Proof image URL/path from PaymentEntity

    @jakarta.persistence.Transient
    private String documentName;  // Document name from DocumentsEntity

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = Status.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public DocumentsEntity getDocument() {
        return document;
    }

    public void setDocument(DocumentsEntity document) {
        this.document = document;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public int getCopies() {
        return copies;
    }

    public void setCopies(int copies) {
        this.copies = copies;
    }

    public LocalDate getDateNeeded() {
        return dateNeeded;
    }

    public void setDateNeeded(LocalDate dateNeeded) {
        this.dateNeeded = dateNeeded;
    }

    public LocalDateTime getDateReady() {          // <-- NEW
        return dateReady;
    }

    public void setDateReady(LocalDateTime dateReady) {  // <-- NEW
        this.dateReady = dateReady;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getProofOfPayment() {
        return proofOfPayment;
    }

    public void setProofOfPayment(String proofOfPayment) {
        this.proofOfPayment = proofOfPayment;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }
}
