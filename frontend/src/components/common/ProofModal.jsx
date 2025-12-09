import React from "react";

export default function ProofModal({ imgUrl, onClose }) {
  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="modal" style={{ display: "flex" }} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-btn" onClick={onClose}>&times;</span>
        {imgUrl ? (
          <img src={imgUrl} alt="Proof of Payment" />
        ) : (
          <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>No proof available</p>
        )}
      </div>
    </div>
  );
}
