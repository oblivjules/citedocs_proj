import React, { useState } from "react";
import { Link } from "react-router-dom";
import ProofModal from "../../../../components/common/ProofModal";

export default function RequestTable({ requests, onView }) {
  const [proofModal, setProofModal] = useState({
    visible: false,
    imgUrl: "",
  });

  const openProofModal = (imgUrl) => {
    setProofModal({ visible: true, imgUrl });
  };

  const closeProofModal = () => {
    setProofModal({ visible: false, imgUrl: "" });
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "badge-pending";
      case "processing":
        return "badge-processing";
      case "approved":
        return "badge-approved";
      case "completed":
        return "badge-completed";
      case "rejected":
        return "badge-rejected";
      default:
        return "badge-default";
    }
  };

  return (
    <>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Student Info</th>
              <th>Document Type</th>
              <th>Copies</th>
              <th>Date</th>
              <th>Proof Image</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {requests.length > 0 ? (
              requests.map((req) => {
                const status = req.status.toLowerCase();
                const hideUpdate =
                  status === "completed" || status === "rejected";

                return (
                  <tr key={req.id}>
                    <td>{req.id}</td>

                    <td>
                      <strong>{req.studentName}</strong>
                      <br />
                      <span style={{ fontSize: "0.85rem", color: "#666" }}>
                        {req.studentId}
                      </span>
                    </td>

                    <td>{req.documentType}</td>
                    <td>{req.copies}</td>
                    <td>{req.date}</td>

                    {/* Proof button now opens shared modal */}
                    <td>
                      {req.proofImage ? (
                        <button
                          className="btn-small btn-primary proof-btn"
                          onClick={() => openProofModal(req.proofImage)}
                        >
                          View Proof
                        </button>
                      ) : (
                        <em style={{ color: "#888" }}>No proof</em>
                      )}
                    </td>

                    <td>
                      <span className={`badge ${getStatusBadgeClass(req.status)}`}>
                        {req.status.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        {!hideUpdate && (
                          <button
                            className="btn-small btn-outline"
                            onClick={() => onView(req)}
                          >
                            Update
                          </button>
                        )}

                        {(status === "approved" || status === "completed") && (
                          <Link
                            to={`/claim/${req.id}`}
                            className="action-btn claim-slip-btn"
                          >
                            Claim Slip
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "1rem" }}>
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Shared ProofModal */}
      {proofModal.visible && (
        <ProofModal imgUrl={proofModal.imgUrl} onClose={closeProofModal} />
      )}
    </>
  );
}
