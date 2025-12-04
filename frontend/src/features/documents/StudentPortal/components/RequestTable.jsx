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
    <div className="request-table">
      <h3>Recent Document Requests</h3>
      <table>
        <thead>
          <tr>
            <th>REQUEST ID</th>
            <th>DOCUMENT TYPE</th>
            <th>DATE REQUESTED</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {requests.length > 0 ? (
            requests.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
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
                    className="action-btn"
                    onClick={() => onViewDetails(r)}
                  >
                    View Details ›
                  </button>

                  {/* Claim Slip Button — appears only when approved or completed */}
                  {(r.status === "Approved" || r.status === "Completed") && (
                    <Link
                      to={`/claim/${r.id}`} // ✅ dynamic route
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
              <td colSpan="5" className="empty-row">
                No requests found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RequestTable;
