import React, { useState, useEffect } from "react";

export default function StatusUpdateModal({
  request,
  onClose,
  onStatusChange,
}) {
  const [newStatus, setNewStatus] = useState(request?.status || "");
  const [remarks, setRemarks] = useState("");
  const [dateReady, setDateReady] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (!request) return;
    setNewStatus(request.status || "");
    setRemarks("");
    setDateReady("");
  }, [request]);

  // Enable date ready when status is approved
  useEffect(() => {
    if (newStatus === "approved") {
      const today = new Date().toISOString().split("T")[0];
      if (!dateReady) {
        setDateReady(today);
      }
    } else {
      setDateReady("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newStatus]);

  // Set min date to today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("dateReady");
    if (dateInput) {
      dateInput.min = today;
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  if (!request) return null;

  const idToUse = request.requestId || request.id;

  // Valid status transitions
  const isValidTransition = (current, next) => {
    if (current === next) return true;
    if (current === "pending")
      return next === "processing" || next === "rejected";
    if (current === "processing")
      return next === "approved" || next === "rejected";
    if (current === "approved") return next === "completed";
    if (current === "completed") return next === "completed";
    return false;
  };

  const getValidNextStatuses = (status) => {
    if (status === "pending") return ["processing", "rejected"];
    if (status === "processing") return ["approved", "rejected"];
    if (status === "approved") return ["completed"];
    if (status === "completed") return ["completed"];
    return [];
  };

  const currentStatus = request.status?.toLowerCase() || "";
  const validStatuses = getValidNextStatuses(currentStatus);

  const handleUpdate = () => {
    if (!newStatus) {
      alert("Please select a status.");
      return;
    }

    if (!isValidTransition(currentStatus, newStatus.toLowerCase())) {
      alert(
        `Cannot transition from ${currentStatus.toUpperCase()} to ${newStatus.toUpperCase()}.`
      );
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmUpdate = async () => {
    setShowConfirmDialog(false);
    setIsUpdating(true);
    try {
      await onStatusChange(
        idToUse,
        newStatus,
        remarks.trim(),
        dateReady || null
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      alert(`Failed to update: ${error.message || "Unknown error"}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "400px" }}
          >
            <div className="modal-header">
              <h3>Confirm Status Update</h3>
            </div>
            <div className="modal-body">
              <p className="modal-message">
                Are you sure you want to update request <strong>{request.referenceCode || request.id || `REQ-${idToUse}`}</strong> to <strong>{newStatus.toUpperCase()}</strong>?
              </p>
              {remarks && (
                <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
                  <strong>Remarks:</strong> {remarks}
                </p>
              )}
              {dateReady && newStatus === "approved" && (
                <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
                  <strong>Date Ready:</strong> {new Date(dateReady).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={handleCancelConfirm}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={handleConfirmUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Confirm Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Modal */}
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-container"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="modal-header">
          <h3>Update Request Status</h3>
          <button className="modal-close" id="closeModal" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-message">
            Request <strong id="requestId">
              {request.referenceCode || request.id || `REQ-${idToUse}`}
            </strong> will be updated.
          </p>
          <div className="modal-form">
            <div className="form-row">
              <label htmlFor="statusDropdown" className="form-label">
                Select Status
              </label>
              <div className="form-field">
                <select
                  id="statusDropdown"
                  className="input-control"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="">Select status</option>
                  {validStatuses.includes("processing") && (
                    <option value="processing">Processing</option>
                  )}
                  {validStatuses.includes("approved") && (
                    <option value="approved">Approved</option>
                  )}
                  {validStatuses.includes("rejected") && (
                    <option value="rejected">Rejected</option>
                  )}
                  {validStatuses.includes("completed") && (
                    <option value="completed">Completed</option>
                  )}
                </select>
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="remarks" className="form-label">
                Remarks (optional)
              </label>
              <div className="form-field">
                <textarea
                  id="remarks"
                  rows="3"
                  className="input-control"
                  placeholder="Add remarks or notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
                <small className="helper-text">
                  Remarks are shared with the requester.
                </small>
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="dateReady" className="form-label">
                Date Ready
              </label>
              <div className="form-field">
                <input
                  type="date"
                  id="dateReady"
                  className="input-control"
                  value={dateReady}
                  onChange={(e) => setDateReady(e.target.value)}
                  disabled={newStatus !== "approved"}
                  min={new Date().toISOString().split("T")[0]}
                />
                <small className="helper-text">
                  Date the document will be available for pickup.
                </small>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            id="cancelProcess"
            className="btn-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            id="confirmProcess"
            className="btn-confirm"
            onClick={handleUpdate}
            disabled={isUpdating || !newStatus}
          >
            {isUpdating ? "Updating..." : "Confirm"}
          </button>
        </div>
        </div>
      </div>
    </>
  );
}

