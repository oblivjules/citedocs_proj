import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ClaimSlip.css";
import CITLogo from '../../../assets/images/CIT_logo.png';
import { fetchClaimSlip, fetchRequestById } from '../../../api/requests';
import { useAuthContext } from '../../../features/auth/context/AuthContext';
import { extractRequestId } from '../../../utils/requestUtils';

const ClaimSlip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthContext();
  const [claimData, setClaimData] = useState(null);
  const [requestData, setRequestData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadClaimSlip = async () => {
      if (!token || !id) {
        setError("Missing token or request ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Extract numeric request ID from formatted ID (e.g., "REQ-123" -> 123)
        const extractedId = extractRequestId(id) || id;
        // Ensure it's a number
        const requestId = typeof extractedId === 'string' ? parseInt(extractedId, 10) : extractedId;

        // Fetch request details first
        const request = await fetchRequestById({ id: requestId, token });
        
        if (!request) {
          setError("Request not found");
          return;
        }

        // Fetch claim slip - required for approved requests
        let claimSlip = null;
        try {
          claimSlip = await fetchClaimSlip({ requestId, token });
        } catch (err) {
          // Claim slip is required - if not found (404), show user-friendly error
          // Don't log 404s as they're expected for non-approved requests
          const isNotFound = err.message && (err.message.includes('404') || err.message.includes('not found'));
          if (isNotFound) {
            setError("Claim slip not found. This request may not have been approved yet.");
          } else {
            // Only log unexpected errors
            console.error("Failed to fetch claim slip", err);
            setError(err.message || "Failed to load claim slip");
          }
          return;
        }

        if (!claimSlip) {
          setError("Claim slip not found. This request may not have been approved yet.");
          return;
        }

        // Only set data if claim slip exists
        setClaimData({
          claimNumber: claimSlip.claimNumber,
          dateReady: claimSlip.dateReady
            ? new Date(claimSlip.dateReady).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              })
            : new Date().toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              }),
        });

        setRequestData({
          studentName: request.userName || "Unknown Student",
          studentId: request.studentId || "N/A",
          documentType: request.documentName || request.documentType?.name || request.documentType || "Document",
          copies: request.copies || 1,
        });
      } catch (err) {
        // Only log unexpected errors (not 404s which are handled above)
        if (!err.message || (!err.message.includes('404') && !err.message.includes('not found'))) {
          console.error("Unable to load claim slip", err);
        }
        setError(err.message || "Failed to load claim slip");
      } finally {
        setIsLoading(false);
      }
    };

    loadClaimSlip();
  }, [token, id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="claim-slip-container">
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Loading claim slip...</p>
        </div>
      </div>
    );
  }

  if (error || !claimData || !requestData) {
    return (
      <div className="claim-slip-container">
        <button onClick={() => navigate(-1)} className="back-btn no-print">
          ← Back
        </button>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "#d32f2f" }}>{error || "Claim slip not found"}</p>
          <button onClick={() => navigate(-1)} style={{ marginTop: "1rem", padding: "8px 16px" }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="claim-slip-container">
       {/* Back Button */}
        <button onClick={() => navigate(-1)} className="back-btn no-print">
          ← Back
        </button>
    
      <div className="claim-slip-card">
        {/* Header */}
        <div className="claim-header">
          <img src={CITLogo} alt="CIT-U Seal" className="citu-seal" />
          <h1>CLAIM SLIP</h1>
          <h2>Official Document Release</h2>
        </div>

        <div className="divider"></div>

        {/* Claim Info */}
        <div className="claim-info-grid">
          <div className="info-item">
            <span className="info-label">Claim Number</span>
            <span className="info-value">{claimData.claimNumber}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Date Ready</span>
            <span className="info-value">{claimData.dateReady}</span>
          </div>
        </div>

        <div className="divider"></div>

        {/* Student Information */}
        <h3>Student Information</h3>
        <div className="claim-info-grid">
          <div className="info-item">
            <span className="info-label">Name</span>
            <span className="info-value">{requestData.studentName}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Student ID</span>
            <span className="info-value">{requestData.studentId}</span>
          </div>
        </div>

        <div className="divider"></div>

        {/* Document Details */}
        <h3>Document Details</h3>
        <div className="claim-info-grid">
          <div className="info-item">
            <span className="info-label">Document Type</span>
            <span className="info-value">{requestData.documentType}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Number of Copies</span>
            <span className="info-value">{requestData.copies}</span>
          </div>
        </div>

        <div className="divider"></div>

        {/* Instructions */}
        <div className="instructions-box">
          <p>
            Please present this slip to the Registrar’s Office to claim your
            document.
          </p>
          <ul>
            <li>Bring a valid school ID.</li>
            <li>Ensure your payment has been verified.</li>
            <li>Only the requester can claim the document.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="claim-footer">
          <p>© 2025 CIT-U Registrar’s Office | CITeDocs</p>
        </div>
      </div>

      {/* Floating Print Button */}
      <button className="floating-print-btn no-print" onClick={handlePrint}>
        🖨️ Print Claim Slip
      </button>
    </div>
  );
};

export default ClaimSlip;
