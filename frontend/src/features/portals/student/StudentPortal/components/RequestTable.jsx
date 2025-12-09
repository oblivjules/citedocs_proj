import React from "react";
import { Link } from "react-router-dom";

const RequestTable = ({ requests, onViewDetails }) => {
  const getStatusClass = (status) => {
    const statusMap = {
      Processing: "status-processing",
      Approved: "status-ready",
      Pending: "status-pending-payment",
      Completed: "status-completed",
      Rejected: "status-rejected",
    };
    return statusMap[status] || "status-default";
  };

  return (
    <table className="requests-table">
      <thead>
        <tr>
          <th>Request ID</th>
          <th>Document Type</th>
          <th>Date Requested</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {requests.length > 0 ? (
          requests.map((r) => (
            <tr key={r.id || r.requestId} className="request-row" data-request-id={r.requestId || r.id}>
              <td className="request-id">
                <strong>{r.id || r.referenceCode || `REQ-${r.requestId || r.id}`}</strong>
              </td>
              <td>{r.type}</td>
              <td>{r.date}</td>
              <td>
                <span className={`status-badge ${getStatusClass(r.status)}`}>
                  {r.status}
                </span>
              </td>
              <td className="action-cell">
                {/* View Details Button */}
                <button
                  className="action-btn view-details-btn"
                  onClick={() => onViewDetails(r)}
                  data-request-id={r.requestId || r.id}
                  data-document={r.type}
                  data-copies={r.copies}
                  data-date-needed={r.dateNeeded}
                  data-status={r.status}
                  data-created={r.created}
                  data-updated={r.lastUpdated}
                >
                  View Details
                </button>

                {/* Claim Slip Button — appears only when approved or completed */}
                {((r.status === "Approved" || r.status === "Completed") ||
                  (r.status?.toLowerCase() === "approved" || r.status?.toLowerCase() === "completed")) && (
                  <Link
                    to={`/claim/${r.requestId || r.id}`}
                    className="action-btn claim-slip-btn"
                  >
                    Claim Slip
                  </Link>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="center-cell">
              No requests found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default RequestTable;
