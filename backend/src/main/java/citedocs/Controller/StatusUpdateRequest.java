package citedocs.Controller;

public class StatusUpdateRequest {
    private String status;
    private String remarks;
    private String dateReady;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getDateReady() {
        return dateReady;
    }

    public void setDateReady(String dateReady) {
        this.dateReady = dateReady;
    }
}
