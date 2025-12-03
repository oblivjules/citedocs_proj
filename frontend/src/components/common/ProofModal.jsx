import React from "react";

export default function ProofModal({ imgUrl, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        {imgUrl ? (
          <img src={imgUrl} alt="Proof of Payment" style={{ width: "100%", borderRadius: "12px" }} />
        ) : (
          <p style={{ textAlign: "center", padding: "20px" }}>No proof available</p>
        )}
      </div>
    </div>
  );
}
