import React, { useState } from "react";

const RequestDetailsModal = ({ request, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  if (!request) return null;

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
        </div>
      </div>
    </>
  );
};

export default RequestDetailsModal;