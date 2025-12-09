import React, { useState, useEffect } from "react";
import ProofModal from "../../../../../components/common/ProofModal";
import { fetchStatusLogs } from "../../../../../api/requests";
import { useAuthContext } from "../../../../auth/context/AuthContext";

export default function RequestDetailsModal({ request, onClose }) {
  const [proofModal, setProofModal] = useState({ visible: false, imgUrl: "" });
  const [latestRemarks, setLatestRemarks] = useState("");
  const [staffHistory, setStaffHistory] = useState([]);
  const [showStaffHistory, setShowStaffHistory] = useState(false);
  const { token } = useAuthContext();

  const handleProofClick = () => {
    if (!request) return;
    const proofUrl = request.proofImage || request.proofUrl || "";
    if (proofUrl) {
      setProofModal({ visible: true, imgUrl: proofUrl });
    }
  };

  const closeProofModal = () => {
    setProofModal({ visible: false, imgUrl: "" });
  };

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

  const getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    return `dt-status-badge ${s}`;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  // Fetch latest remarks and staff history from status log
  useEffect(() => {
    const loadLatestRemarks = async () => {
      if (!request || !request.requestId || !token) {
        setLatestRemarks(request?.remarks || "");
        return;
      }

      // First, use remarks from request if available
      if (request.remarks) {
        setLatestRemarks(request.remarks);
      }

      // Fetch status logs for this request
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

          // Find the most recent one with remarks
          const latestWithRemarks = requestLogs.find((log) => log.remarks && log.remarks.trim());
          if (latestWithRemarks && !request.remarks) {
            setLatestRemarks(latestWithRemarks.remarks);
          }

          // Build staff history (only registrars who changed the status)
          const staffMap = new Map();
          requestLogs.forEach((log) => {
            // Only include logs with changedByName (registrar actions)
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
        console.error("Unable to load remarks", error);
        setLatestRemarks(request.remarks || "");
        setStaffHistory([]);
      }
    };

    loadLatestRemarks();
  }, [request, token]);

  if (!request) return null;

  const proofUrl = request.proofImage || request.proofUrl || "";
  const hasProof = !!proofUrl;

  return (
    <>
      <div className="dt-modal" style={{ display: "flex" }}>
        <div className="dt-modal-content">
          <button className="dt-close" onClick={onClose} aria-label="Close">
            ×
          </button>
          <div className="dt-modal-header">
            <div className="dt-header-left">
              <div className="dt-header-top">
                <div className="dt-id" id="mRequestId">
                  {request.referenceCode || request.id || `REQ-${request.requestId || request.id}`}
                </div>
                <span className={getStatusClass(request.status)} id="mStatus">
                  {request.status?.toUpperCase() || "UNKNOWN"}
                </span>
              </div>
              <div className="dt-subtitle">Request Details</div>
            </div>
          </div>
          <div className="dt-modal-body">
            <div className="dt-grid dt-main-grid">
              <div className="dt-card">
                <div className="dt-card-label">
                  <span>Document</span>
                </div>
                <div className="dt-card-value" id="mDocument">
                  {request.documentType || "—"}
                </div>
              </div>
              <div className="dt-card">
                <div className="dt-card-label">
                  <span>Copies</span>
                </div>
                <div className="dt-card-value" id="mCopies">
                  {request.copies || "—"}
                </div>
              </div>
              <div className="dt-card">
                <div className="dt-card-label">
                  <span>Date Needed</span>
                </div>
                <div className="dt-card-value" id="mDateNeeded">
                  {formatDate(request.dateNeeded || request.date)}
                </div>
              </div>
              <div className="dt-card">
                <div className="dt-card-label">
                  <span>Created</span>
                </div>
                <div className="dt-card-value" id="mCreated">
                  {formatDate(request.createdAt || request.date)}
                </div>
              </div>
              <div className="dt-card">
                <div className="dt-card-label">
                  <span>Last Updated</span>
                </div>
                <div className="dt-card-value" id="mUpdated">
                  {formatDate(request.updatedAt || request.dateReady || request.date)}
                </div>
              </div>
            </div>
            {hasProof && (
              <div className="dt-card dt-proof" id="mProofSection">
                <div className="dt-card-label">
                  <span>Proof of Payment</span>
                </div>
                <div className="dt-proof-frame" onClick={handleProofClick} title="Click to view full size">
                  <img
                    id="mProofImage"
                    src={proofUrl}
                    alt="Proof of Payment"
                    onError={(e) => {
                      e.target.style.display = "none";
                      const placeholder = e.target.parentElement.querySelector(
                        ".proof-not-available"
                      );
                      if (!placeholder) {
                        const div = document.createElement("div");
                        div.className = "proof-not-available";
                        div.textContent = "Not available";
                        e.target.parentElement.appendChild(div);
                      }
                    }}
                  />
                </div>
              </div>
            )}
            <div className="dt-card" id="mRemarksCard">
              <div className="dt-card-label">
                <span>Remarks</span>
              </div>
              <div className="dt-card-value" id="mRemarks" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {latestRemarks || request.remarks || "—"}
              </div>
            </div>
            {staffHistory.length > 0 && (
              <div className="dt-card" id="mStaffHistoryCard">
                <div className="dt-card-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Staff History</span>
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
      </div>
      <div
        className="modal-overlay"
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 4999 }}
      />
      
      {proofModal.visible && (
        <ProofModal imgUrl={proofModal.imgUrl} onClose={closeProofModal} />
      )}
    </>
  );
}

