import React from "react";
import "./ClaimSlip.css";
import { Link } from "react-router-dom";
import CITLogo from '../../../assets/images/CIT_logo.png';

const ClaimSlip = () => {
  const handlePrint = () => {
    window.print();
  };

  // Example dynamic data — you can replace with props or API data
  const claimData = {
    claimNumber: "REQ-2025-002",
    dateReady: "11/11/2025",
    studentName: "John Doe",
    studentId: "20-2423-001",
    documentType: "Transcript of Records",
    copies: 2,
  };

  return (
    <div className="claim-slip-container">
       {/* Back Button */}
    <Link to={-1} className="back-btn no-print">
      ← Back
    </Link>
    
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
            <span className="info-value">{claimData.studentName}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Student ID</span>
            <span className="info-value">{claimData.studentId}</span>
          </div>
        </div>

        <div className="divider"></div>

        {/* Document Details */}
        <h3>Document Details</h3>
        <div className="claim-info-grid">
          <div className="info-item">
            <span className="info-label">Document Type</span>
            <span className="info-value">{claimData.documentType}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Number of Copies</span>
            <span className="info-value">{claimData.copies}</span>
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
