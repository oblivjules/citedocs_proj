package citedocs.DTO;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class RequestDetailDTO {
    private Long requestId;
    private String referenceCode;
    private Long userId;
    private String studentName;
    private String studentId;
    private String documentType;
    private String documentName;
    private String purpose;
    private int copies;
    private LocalDate dateNeeded;
    private LocalDateTime dateReady;
    private String status;
    private String proofOfPayment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RequestDetailDTO() {}

    public RequestDetailDTO(Long requestId, Long userId, String studentName, String studentId,
                            String documentName, String purpose, int copies, LocalDate dateNeeded,
                            LocalDateTime dateReady, String status, String proofOfPayment,
                            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.requestId = requestId;
        this.referenceCode = "REQ-" + requestId;
        this.userId = userId;
        this.studentName = studentName;
        this.studentId = studentId;
        this.documentName = documentName;
        this.documentType = documentName;
        this.purpose = purpose;
        this.copies = copies;
        this.dateNeeded = dateNeeded;
        this.dateReady = dateReady;
        this.status = status;
        this.proofOfPayment = proofOfPayment;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public String getReferenceCode() {
        return referenceCode;
    }

    public void setReferenceCode(String referenceCode) {
        this.referenceCode = referenceCode;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
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

    public LocalDateTime getDateReady() {
        return dateReady;
    }

    public void setDateReady(LocalDateTime dateReady) {
        this.dateReady = dateReady;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getProofOfPayment() {
        return proofOfPayment;
    }

    public void setProofOfPayment(String proofOfPayment) {
        this.proofOfPayment = proofOfPayment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
