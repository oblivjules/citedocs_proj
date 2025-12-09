import React, { useState } from "react";
import { Link } from "react-router-dom";
import ProofModal from "../../../../../components/common/ProofModal";
import { formatRequestId } from "../../../../../utils/requestUtils";

export default function RequestTable({ requests, onViewDetails, onUpdateStatus }) {
  const [proofModal, setProofModal] = useState({
    visible: false,
    imgUrl: "",
  });

  const closeProofModal = () => {
    setProofModal({ visible: false, imgUrl: "" });
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "badge badge-pending";
      case "processing":
        return "badge badge-processing";
      case "approved":
        return "badge badge-approved";
      case "completed":
        return "badge badge-completed";
      case "rejected":
        return "badge badge-rejected";
      default:
        return "badge badge-default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <>
      <table className="requests-table">
        <colgroup>
          <col style={{ width: "100px" }} />
          <col style={{ width: "160px" }} />
          <col style={{ width: "160px" }} />
          <col style={{ width: "120px" }} />
          <col style={{ width: "120px" }} />
          <col style={{ width: "120px" }} />
          <col style={{ width: "120px" }} />
        </colgroup>
        <thead>
          <tr>
            <th>REQ ID</th>
            <th>Student Info</th>
            <th>Document</th>
            <th>Details</th>
            <th>Status</th>
            <th>Action</th>
            <th>Claim Slip</th>
          </tr>
        </thead>
        <tbody>
          {requests.length > 0 ? (
            requests.map((req) => {
              const status = req.status?.toLowerCase() || "";
              const hideUpdate = status === "completed" || status === "rejected";
              const requestId = req.requestId || req.id;
              const referenceCode = req.referenceCode || formatRequestId(requestId);

              return (
                <tr key={requestId} className="request-row" data-request-id={requestId}>
                  <td>
                    <strong>{referenceCode}</strong>
                  </td>
                  <td>
                    {req.studentName}
                    <br />
                    <small>{req.studentId || "N/A"}</small>
                  </td>
                  <td>{req.documentType || "Document"}</td>
                  <td>
                    <button
                      className="action-btn view-details-btn"
                      onClick={() => onViewDetails(req)}
                      data-request-id={requestId}
                      data-document={req.documentType}
                      data-copies={req.copies}
                      data-date-needed={formatDate(req.date)}
                      data-status={req.status}
                      data-created={formatDate(req.date)}
                      data-updated={formatDate(req.dateReady || req.date)}
                      data-proof-url={req.proofImage || ""}
                      data-remarks={req.remarks || "—"}
                    >
                      View Details ›
                    </button>
                  </td>
                  <td className="status-cell">
                    <span className={getStatusBadgeClass(req.status)}>
                      {status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {!hideUpdate && (
                      <button
                        className="action-btn process-btn"
                        onClick={() => onUpdateStatus(req)}
                        data-request-id={requestId}
                      >
                        Update
                      </button>
                    )}
                  </td>
                  <td>
                    {status === "approved" || status === "completed" ? (
                      <Link
                        to={`/claim/${requestId}`}
                        className="action-btn claim-slip-btn"
                      >
                        Claim Slip
                      </Link>
                    ) : (
                      <span className="badge none">—</span>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                No requests found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Proof Modal */}
      {proofModal.visible && (
        <ProofModal imgUrl={proofModal.imgUrl} onClose={closeProofModal} />
      )}
    </>
  );
}
