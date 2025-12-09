import React, { useState, useEffect } from "react";
import { fetchStatusLogs } from "../../../../../api/requests";
import { useAuthContext } from "../../../../auth/context/AuthContext";

const RequestDetailsModal = ({ request, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [staffHistory, setStaffHistory] = useState([]);
  const [showStaffHistory, setShowStaffHistory] = useState(false);
  const { token } = useAuthContext();

  useEffect(() => {
    const loadStaffHistory = async () => {
      if (!request || !request.requestId || !token) {
        setStaffHistory([]);
        return;
      }

      try {
        const logs = await fetchStatusLogs({ token });

        if (Array.isArray(logs) && logs.length > 0) {
          // Filter logs for this request
          const requestLogs = logs
            .filter((log) => log.requestId === request.requestId || 
                            log.requestId?.toString() === request.requestId?.toString())
            .sort((a, b) => {
              const dateA = a.changedAt ? new Date(a.changedAt).getTime() : 0;
              const dateB = b.changedAt ? new Date(b.changedAt).getTime() : 0;
              return dateB - dateA;
            });

          // Build staff history (only registrars who changed the status)
          const staffMap = new Map();
          requestLogs.forEach((log) => {
            if (log.changedByName && log.changedByName.trim()) {
              const key = log.changedByName;
              if (!staffMap.has(key)) {
                staffMap.set(key, {
                  name: log.changedByName,
                  firstAction: log.changedAt,
                  lastAction: log.changedAt,
                  actions: [],
                });
              }
              const staff = staffMap.get(key);
              if (new Date(log.changedAt) > new Date(staff.lastAction)) {
                staff.lastAction = log.changedAt;
              }
              if (new Date(log.changedAt) < new Date(staff.firstAction)) {
                staff.firstAction = log.changedAt;
              }
              staff.actions.push({
                status: log.newStatus,
                changedAt: log.changedAt,
                remarks: log.remarks,
              });
            }
          });
          
          setStaffHistory(Array.from(staffMap.values()).sort((a, b) => 
            new Date(b.lastAction) - new Date(a.lastAction)
          ));
        } else {
          setStaffHistory([]);
        }
      } catch (error) {
        console.error("Unable to load staff history", error);
        setStaffHistory([]);
      }
    };

    loadStaffHistory();
  }, [request, token]);

  if (!request) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      alert(`Uploading ${selectedFile.name}...`);
      // Handle upload logic here
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-container">
        <div className="modal-header">
          <div>
            <h2>{request.id}</h2>
            <p className="modal-subtitle">Request Details</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-grid">
            <div className="modal-field">
              <label>Document</label>
              <p className="modal-value">{request.type}</p>
            </div>
            <div className="modal-field">
              <label>Copies</label>
              <p className="modal-value">{request.copies || 2}</p>
            </div>
            <div className="modal-field">
              <label>Status</label>
              <p className="modal-value">{request.status}</p>
            </div>
          </div>

          <div className="modal-grid">
            <div className="modal-field">
              <label>Date Needed</label>
              <p className="modal-value">{request.dateNeeded || "Nov 15, 2024"}</p>
            </div>
            <div className="modal-field">
              <label>Created</label>
              <p className="modal-value">{request.created || "Oct 15, 2024"}</p>
            </div>
            <div className="modal-field">
              <label>Last Updated</label>
              <p className="modal-value">{request.lastUpdated || "Today"}</p>
            </div>
          </div>
          
          {staffHistory.length > 0 && (
            <div className="modal-field" style={{ marginTop: "24px", paddingTop: "24px", borderTop: "2px solid #f0f0f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <label style={{ fontSize: "18px", fontWeight: 600, color: "#8B2635" }}>Staff History</label>
                <button
                  type="button"
                  onClick={() => setShowStaffHistory(!showStaffHistory)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#8B2635",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 600,
                    padding: "4px 8px",
                  }}
                >
                  {showStaffHistory ? "Hide" : "View"} ({staffHistory.length})
                </button>
              </div>
              {showStaffHistory && (
                <div className="staff-history-list" style={{ marginTop: "16px" }}>
                  {staffHistory.map((staff, idx) => (
                    <div key={idx} style={{ 
                      marginBottom: "16px", 
                      padding: "12px", 
                      backgroundColor: "#f9fafb", 
                      borderRadius: "8px",
                      borderLeft: "3px solid #8B2635"
                    }}>
                      <div style={{ fontWeight: 600, color: "#8B2635", marginBottom: "8px" }}>
                        {staff.name}
                      </div>
                      <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
                        Actions: {staff.actions.length} | 
                        First: {formatDate(staff.firstAction)} | 
                        Last: {formatDate(staff.lastAction)}
                      </div>
                      <div style={{ fontSize: "12px", color: "#888" }}>
                        Status changes: {staff.actions.map(a => a.status).join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RequestDetailsModal;