import React, { useState } from "react";

export default function RequestDetailsModal({
  request,
  onClose,
  onStatusChange,
}) {
  const [newStatus, setNewStatus] = useState(request.status);
  const [remarks, setRemarks] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!request) return null;

  // Use requestId for API calls, fallback to id
  const idToUse = request.requestId || request.id;

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      onStatusChange(idToUse, newStatus, remarks);
    } finally {
      setIsUpdating(false);
      onClose();
    }
  };

    // Determine if request is locked (locked when status is not pending)
  const isLocked = request.status !== "pending";
  const canEditStatus = !isLocked;

  const getStatusColor = (status) => {
    const colors = {
      pending: "#FFA500",
      processing: "#1E90FF",
      approved: "#32CD32",
      completed: "#228B22",
      rejected: "#DC143C",
    };
    return colors[status] || "#808080";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Request Details</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-row">
            <strong>Request ID:</strong> {request.id}
              <br />
              <em style={{ fontSize: "0.9rem", color: "#666" }}>
                (DB ID: {request.requestId})
              </em>
          </div>
          
          <div className="detail-row">
            <strong>Student:</strong> {request.studentName}
          </div>
          
          <div className="detail-row">
            <strong>Student ID:</strong> {request.studentId}
          </div>
          
          <div className="detail-row">
            <strong>Document:</strong> {request.documentType}
          </div>
          
          <div className="detail-row">
            <strong>Purpose:</strong> {request.purpose}
          </div>
          
          <div className="detail-row">
            <strong>Copies:</strong> {request.copies}
          </div>
          
          <div className="detail-row">
            <strong>Date Requested:</strong> {request.date}
          </div>

          <div className="detail-row">
            <strong>Current Status:</strong>
            <span
              style={{
                display: "inline-block",
                marginLeft: "10px",
                padding: "5px 10px",
                backgroundColor: getStatusColor(request.status),
                color: "white",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {request.status.toUpperCase()}
            </span>
          </div>

          {request.dateReady && (
            <div className="detail-row">
              <strong>Date Ready:</strong>{" "}
              {new Date(request.dateReady).toLocaleString()}
            </div>
          )}

          {isLocked && (
            <div
              style={{
                backgroundColor: "#FFF3CD",
                borderLeft: "4px solid #FFC107",
                padding: "10px",
                margin: "10px 0",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              <strong>🔒 Request Locked:</strong> This request cannot be edited
              because it has been processed. Only status changes are allowed.
            </div>
          )}

          <div className="detail-row">
            <strong>New Status:</strong>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              disabled={false}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "5px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="detail-row">
            <strong>Remarks:</strong>
            <textarea
              placeholder="Add remarks or notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{
                width: "100%",
                minHeight: "80px",
                padding: "8px",
                marginTop: "5px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div className="modal-actions">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              style={{ marginRight: "10px" }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleUpdate}
              disabled={isUpdating}
              style={{
                opacity: isUpdating ? 0.6 : 1,
                cursor: isUpdating ? "not-allowed" : "pointer",
              }}
            >
              {isUpdating ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
