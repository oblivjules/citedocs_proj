import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../portals/student/StudentPortal/StudentPortal.css";
import Header from "../../portals/student/StudentPortal/components/Header";
import Footer from "../../../components/layout/Footer";
import "./DocumentRequest.css";
import { useAuthContext } from "../../auth/context/AuthContext";
import {
  createRequest as createRequestApi,
  fetchRequests,
  fetchDocuments,
  createPayment,
  fetchPaymentByRequestId,
} from "../../../api/requests";

// Document types matching the image
const documentTypes = [
  { value: "transcript", label: "Transcript of Records" },
  { value: "enrollment", label: "Certificate of Enrollment" },
  { value: "good-moral", label: "Good Moral Certificate" },
  { value: "diploma", label: "Diploma Copy" },
  { value: "grades", label: "True Copy of Grades (TCG)" },
  { value: "transfer", label: "Transfer Credential" },
  { value: "clearance", label: "Student Clearance" },
  { value: "study-load", label: "Study Load" },
  { value: "authentication", label: "Authentication/CAV/Apostille" },
];

export default function DocumentRequest() {
  const { user } = useAuthContext();
  const token = localStorage.getItem("token");
  const [documents, setDocuments] = useState([]);
  const [formData, setFormData] = useState({
    documentId: "",
    dateNeeded: "",
    copies: 1,
    proofFile: null,
  });

  const fallbackRequests = useMemo(
    () => [
      {
        id: "REQ-2025-001",
        documentLabel: "Transcript of Records",
        copies: 2,
        dateNeeded: "Nov 15, 2025",
        status: "Processing",
        proofUrl:
          "https://via.placeholder.com/300x200.png?text=Proof+of+Payment",
      },
      {
        id: "REQ-2025-002",
        documentLabel: "Certificate of Enrollment",
        copies: 1,
        dateNeeded: "Nov 10, 2025",
        status: "Approved",
        proofUrl:
          "https://via.placeholder.com/300x200.png?text=Proof+of+Payment",
      },
      {
        id: "REQ-2025-003",
        documentLabel: "Good Moral Character",
        copies: 1,
        dateNeeded: "Nov 5, 2025",
        status: "Completed",
        proofUrl:
          "https://via.placeholder.com/300x200.png?text=Proof+of+Payment",
      },
    ],
    []
  );

  const [userRequests, setUserRequests] = useState(fallbackRequests);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [proofModal, setProofModal] = useState({ visible: false, imgUrl: "" });
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);

  // Prevent past dates
  const today = new Date().toISOString().split("T")[0];

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, proofFile: file });
    }
  };

  const generateRequestId = () => {
    const currentYear = new Date().getFullYear();
    const yearPrefix = `REQ-${currentYear}-`;

    const yearRequests = userRequests.filter((req) =>
      req.id.startsWith(yearPrefix)
    );
    let maxSeq = 0;

    yearRequests.forEach((req) => {
      const seqStr = req.id.replace(yearPrefix, "");
      const seqNum = parseInt(seqStr, 10);
      if (!isNaN(seqNum) && seqNum > maxSeq) {
        maxSeq = seqNum;
      }
    });

    const nextSeq = maxSeq + 1;
    return `${yearPrefix}${nextSeq.toString().padStart(3, "0")}`;
  };

  const studentName = user?.name || "Student";

  // Load documents from backend
  const loadDocuments = useCallback(async () => {
    if (!token) {
      setIsLoadingDocuments(false);
      return;
    }
    
    setIsLoadingDocuments(true);
    setFetchError(null);
    
    try {
      const docs = await fetchDocuments({ token });
      if (Array.isArray(docs) && docs.length > 0) {
        setDocuments(docs);
        setFetchError(null);
      } else {
        console.warn("No documents found in backend");
        setFetchError("No documents available. The system may still be initializing. Please try again in a moment.");
      }
    } catch (error) {
      console.error("Unable to load documents", error);
      setFetchError("Failed to load documents. Please refresh the page or contact support.");
    } finally {
      setIsLoadingDocuments(false);
    }
  }, [token]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const loadRequests = useCallback(async () => {
    if (!token || !user?.userId) {
      setUserRequests(fallbackRequests);
      return;
    }

    setIsFetching(true);
    setFetchError(null);
    try {
      const data = await fetchRequests({
        token,
        query: { userId: user.userId },
      });

      if (Array.isArray(data)) {
        // Load payment info for each request
        const requestsWithPayments = await Promise.all(
          data.map(async (req) => {
            let proofUrl = "";
            try {
              const payment = await fetchPaymentByRequestId({
                requestId: req.requestId,
                token,
              });
              if (payment && payment.proofOfPayment) {
                    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
                    proofUrl = `${API_BASE_URL}/api/payments/file/${payment.proofOfPayment}`;
                  }

            } catch (error) {
              // Payment not found is expected for requests without payment - ignore silently
              if (error.message && !error.message.includes('404')) {
                console.warn(`Error loading payment for request ${req.requestId}:`, error);
              }
            }

            return {
              id: req.requestId?.toString() || req.id?.toString() || "",
              documentLabel: req.document?.name || "Document",
              copies: req.copies,
              dateNeeded: formatDate(req.dateNeeded),
              status: req.status || "PENDING",
              proofUrl: proofUrl,
            };
          })
        );

        setUserRequests(requestsWithPayments);
      }
    } catch (error) {
      console.error("Unable to load requests", error);
      setFetchError(error.message);
      setUserRequests(fallbackRequests);
    } finally {
      setIsFetching(false);
    }
  }, [token, user?.userId, fallbackRequests]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDATION
    if (!formData.documentId) {
      alert("Please select a document type.");
      return;
    }

    // Validate that we have documents loaded from backend
    if (documents.length === 0) {
      alert("Documents are still loading. Please wait a moment and try again.");
      return;
    }

    // Validate that documentId is a valid number (not a fallback string)
    const documentId = parseInt(formData.documentId);
    if (isNaN(documentId) || documentId <= 0) {
      alert("Please select a valid document type. If the issue persists, please refresh the page.");
      return;
    }

    // Verify the selected document exists in the loaded documents
    const selectedDocument = documents.find(doc => doc.documentId === documentId);
    if (!selectedDocument) {
      alert("Selected document not found. Please refresh the page and try again.");
      return;
    }

    if (!formData.dateNeeded) {
      alert("Please choose a date needed.");
      return;
    }

    if (formData.dateNeeded < today) {
      alert("The date needed cannot be in the past.");
      return;
    }

    if (!formData.copies || formData.copies < 1) {
      alert("Please enter a valid number of copies (at least 1).");
      return;
    }

    if (!formData.proofFile) {
      alert("Please upload a proof of payment file.");
      return;
    }

    if (!user?.userId) {
      alert("Missing user information. Please try signing in again.");
      return;
    }

    if (!token) {
      alert("Authentication required. Please sign in again.");
      return;
    }

    // Prepare payload matching backend structure
    const payload = {
      userId: user.userId,
      document: {
        documentId: documentId,
      },
      dateNeeded: formData.dateNeeded,
      copies: parseInt(formData.copies),
      status: "PENDING", // Backend enum
    };

    try {
      setIsFetching(true);
      
      // Step 1: Create the request
      const created = await createRequestApi({ payload, token });
      const requestId = created.requestId;

      if (!requestId) {
        throw new Error("Request creation failed - no request ID returned");
      }

      // Step 2: Upload payment proof if file is provided
      if (formData.proofFile) {
        try {
          await createPayment({
            requestId: requestId,
            proofFile: formData.proofFile,
            remarks: null,
            token,
          });
        } catch (paymentError) {
          console.error("Payment upload failed", paymentError);
          // Request was created but payment failed - show warning
          alert("Request created but payment upload failed. Please contact support.");
        }
      }

      // Step 3: Reload requests to get updated data including payment
      await loadRequests();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Reset form
      setFormData({
        documentId: "",
        dateNeeded: "",
        copies: 1,
        proofFile: null,
      });
    } catch (error) {
      console.error("Unable to submit request", error);
      alert(error.message || "Unable to submit request.");
    } finally {
      setIsFetching(false);
    }
  };

  const openProofModal = (imgUrl) => {
    setProofModal({ visible: true, imgUrl });
  };

  const closeProofModal = () => {
    setProofModal({ visible: false, imgUrl: "" });
  };

  return (
    <div className="portal-container">
      <Header studentName={studentName} />

      <div className="request-container">
        <div className="form-card">
          <div className="form-header">
            <div className="form-icon">📄</div>
            <div>
              <h2>Request a New Document</h2>
              <p>
                Please fill out the form to request a document from the
                Registrar's Office.
              </p>
            </div>
          </div>

          {success && (
            <div className="alert alert-success">
              Request submitted successfully!
            </div>
          )}

          {fetchError && documents.length === 0 && (
            <div className="alert alert-error">
              {fetchError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-grid" noValidate>
            <div className="form-group">
              <label>Student ID</label>
              <input type="text" name="studentId" value={user?.sid || user?.studentId || ""} readOnly />
            </div>

            <div className="form-group">
              <label>Student Name</label>
              <input
                type="text"
                name="studentName"
                value={studentName}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>
                <span style={{ marginRight: "8px" }}>📄</span>
                Select Document Type <span style={{ color: "red" }}>*</span>
              </label>
              <select
                name="documentId"
                value={formData.documentId}
                onChange={handleChange}
                required
                disabled={isLoadingDocuments || documents.length === 0}
              >
                <option value="">
                  {isLoadingDocuments 
                    ? "-- Loading documents... --" 
                    : documents.length === 0
                    ? "-- No documents available --"
                    : "-- Select Document Type --"}
                </option>
                {/* Only show documents loaded from backend */}
                {documents.map((doc) => (
                  <option key={doc.documentId} value={doc.documentId}>
                    {doc.name}
                  </option>
                ))}
              </select>
              {isLoadingDocuments && (
                <small style={{ color: "#666", fontSize: "12px", marginTop: "4px", display: "block" }}>
                  Loading available documents...
                </small>
              )}
              {!isLoadingDocuments && documents.length === 0 && fetchError && (
                <div style={{ marginTop: "8px" }}>
                  <small style={{ color: "#d32f2f", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                    {fetchError}
                  </small>
                  <button
                    type="button"
                    onClick={loadDocuments}
                    style={{
                      padding: "4px 12px",
                      fontSize: "12px",
                      backgroundColor: "#8B2635",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Date Needed</label>
              <input
                type="date"
                name="dateNeeded"
                value={formData.dateNeeded}
                onChange={handleChange}
                min={today}
                required
              />
            </div>

            <div className="form-group">
              <label>Number of Copies <span style={{ color: "red" }}>*</span></label>
              <input
                type="number"
                name="copies"
                min="1"
                value={formData.copies}
                onChange={handleChange}
              />
            </div>

            <div className="file-upload">
              <div className="upload-icon">📤</div>
              <p className="upload-title">Proof of Payment Upload <span style={{ color: "red" }}>*</span></p>
              <p className="upload-subtitle">
                Upload your payment receipt here
              </p>
              <input
                type="file"
                id="proofFile"
                name="proofFile"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              <label htmlFor="proofFile" className="file-label">
                {formData.proofFile
                  ? `📎 ${formData.proofFile.name}`
                  : "Choose File"}
              </label>
              <p className="upload-info">
                Supported formats: PNG, JPG, JPEG, WEBP
              </p>
            </div>

            <div className="submit-btn">
              <button type="submit" className="btn btn-primary">
                Submit Request
              </button>
            </div>
          </form>
        </div>

        <div className="history-card">
          <div className="history-header">
            <h3>Request History</h3>
          </div>
          <div className="history-table-wrapper">
            {isFetching && <p className="empty-state">Loading requests…</p>}
            {fetchError && (
              <p className="alert alert-error">
                {fetchError}. Showing cached data.
              </p>
            )}
            {!isFetching && userRequests.length === 0 ? (
              <p className="empty-state">No requests found.</p>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>REQUEST ID</th>
                    <th>DOCUMENT</th>
                    <th>COPIES</th>
                    <th>DATE NEEDED</th>
                    <th>STATUS</th>
                    <th>PAYMENT</th>
                    <th>CLAIM SLIP</th>
                  </tr>
                </thead>
                <tbody>
                  {userRequests.map((req) => (
                    <tr key={req.id}>
                      <td>{req.id}</td>
                      <td>{req.documentLabel}</td>
                      <td>{req.copies}</td>
                      <td>{req.dateNeeded}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            req.status === "PROCESSING" || req.status === "Processing"
                              ? "status-processing"
                              : req.status === "APPROVED" || req.status === "Approved"
                              ? "status-ready"
                              : req.status === "COMPLETED" || req.status === "Completed"
                              ? "status-completed"
                              : req.status === "REJECTED" || req.status === "Rejected"
                              ? "status-rejected"
                              : "status-pending-payment"
                          }`}
                        >
                          {req.status === "PENDING" ? "Pending" :
                           req.status === "PROCESSING" ? "Processing" :
                           req.status === "APPROVED" ? "Approved" :
                           req.status === "COMPLETED" ? "Completed" :
                           req.status === "REJECTED" ? "Rejected" :
                           req.status}
                        </span>
                      </td>

                      <td>
                        {req.proofUrl ? (
                          <button
                            className="view-proof-btn"
                            onClick={() => openProofModal(req.proofUrl)}
                          >
                            View Proof
                          </button>
                        ) : (
                          <span style={{ color: "#999" }}>No Payment</span>
                        )}
                      </td>

                      <td>
                        {(req.status === "APPROVED" || req.status === "Approved" ||
                        req.status === "COMPLETED" || req.status === "Completed") ? (
                          <Link
                            to={`/claim/${req.id}`}
                            className="action-btn claim-slip-btn"
                          >
                            Claim Slip
                          </Link>
                        ) : (
                          <span style={{ color: "#999" }}>Not Available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {proofModal.visible && (
        <div className="modal-overlay" onClick={closeProofModal}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeProofModal}>
              ✕
            </button>
            <img
              src={proofModal.imgUrl}
              alt="Proof of Payment"
              style={{
                width: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: "12px",
              }}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
