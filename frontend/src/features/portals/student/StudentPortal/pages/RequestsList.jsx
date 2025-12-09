import React, { useState, useEffect, useMemo } from "react";
import "../StudentPortal.css";
import Header from "../components/Header";
import Footer from "../../../../../components/layout/Footer";
import RequestDetailsModal from "../../../registrar/RegistrarPortal/components/RequestDetailsModal";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../../../auth/context/AuthContext";
import { fetchRequests, fetchPaymentByRequestId, fetchDocuments } from "../../../../../api/requests";
import { formatRequestId } from "../../../../../utils/requestUtils";

const RequestsList = () => {
  const { user } = useAuthContext();
  const token = localStorage.getItem("token");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [docFilter, setDocFilter] = useState("all");
  const [documentTypes, setDocumentTypes] = useState([]);

  // Load requests from API
  useEffect(() => {
    const loadRequests = async () => {
      if (!token || !user?.userId) {
        setRequests([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
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
                if (error.message && !error.message.includes('404')) {
                  console.warn(`Error loading payment for request ${req.requestId}:`, error);
                }
              }

              const rawStatus = req.status || "PENDING";
              const formattedStatus = rawStatus
                .toString()
                .toLowerCase()
                .replace(/(^|_)([a-z])/g, (m, p1, p2) => p2.toUpperCase());

              return {
                id: formatRequestId(req.requestId || req.id),
                requestId: req.requestId || req.id,
                referenceCode: formatRequestId(req.requestId || req.id),
                type: req.document?.name || req.documentType?.name || "Document",
                documentType: req.document?.name || req.documentType?.name || "Document",
                dateRequested: req.createdAt
                  ? new Date(req.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "",
                status: formattedStatus,
                copies: req.copies || 1,
                dateNeeded: req.dateNeeded
                  ? new Date(req.dateNeeded).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "",
                created: req.createdAt,
                updated: req.updatedAt,
                createdAt: req.createdAt,
                updatedAt: req.updatedAt,
                proofUrl: proofUrl,
                proofImage: proofUrl,
                remarks: req.remarks,
              };
            })
          );
          // Sort by createdAt descending (most recent first)
          const sortedRequests = requestsWithPayments.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          setRequests(sortedRequests);
        } else {
          setRequests([]);
        }
      } catch (error) {
        console.error("Unable to load requests", error);
        setFetchError(error.message);
        setRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, [token, user?.userId]);

  // Load document types
  useEffect(() => {
    const loadDocumentTypes = async () => {
      if (!token) {
        const types = new Set();
        requests.forEach((r) => {
          if (r.type) types.add(r.type);
        });
        setDocumentTypes(Array.from(types).sort());
        return;
      }
      try {
        const docs = await fetchDocuments({ token });
        if (Array.isArray(docs)) {
          const docNames = docs
            .map((doc) => doc.name)
            .filter(Boolean)
            .sort();
          setDocumentTypes(docNames);
        }
      } catch (error) {
        console.error("Unable to load document types", error);
        const types = new Set();
        requests.forEach((r) => {
          if (r.type) types.add(r.type);
        });
        setDocumentTypes(Array.from(types).sort());
      }
    };

    loadDocumentTypes();
  }, [token, requests]);

  // Filter and search logic
  const filteredRequests = useMemo(() => {
    let filtered = [...requests];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => {
        const status = (r.status || "").toString().toLowerCase();
        return status === statusFilter.toLowerCase();
      });
    }

    // Apply document type filter
    if (docFilter !== "all") {
      filtered = filtered.filter((r) => r.type === docFilter);
    }

    // Apply search filter
    if (search && search.length >= 2) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.type?.toLowerCase().includes(searchLower) ||
          (r.id || r.referenceCode)?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [requests, statusFilter, docFilter, search]);

  const handleViewDetails = (req) => setSelectedRequest(req);
  const handleCloseModal = () => setSelectedRequest(null);

  return (
    <div className="portal-container">
      <Header studentName={user?.name || "Student"} />

      <main className="dashboard-container requests-list-page">
        <section className="table-section">
          <div className="section-header">
            <h2>All Document Requests</h2>

            {/* SEARCH + FILTER */}
            <div className="table-controls">
              <form
                className="search-form"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <div className="search-box">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    name="search"
                    placeholder="Search by Request ID or Document Type..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </form>

              <div className="filter-container">
                <div className="filter-select-wrapper">
                  <select
                    value={docFilter}
                    onChange={(e) => setDocFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Documents</option>
                    {documentTypes.map((doc) => (
                      <option key={doc} value={doc}>
                        {doc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-select-wrapper">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="approved">Approved</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="table-container">
            {isLoading ? (
              <p className="empty-state">Loading requests…</p>
            ) : fetchError ? (
              <p className="alert alert-error">{fetchError}</p>
            ) : (
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
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => (
                      <tr key={req.id || req.requestId} className="request-row" data-request-id={req.requestId || req.id}>
                        <td className="request-id">
                          <strong>{req.id || req.referenceCode}</strong>
                        </td>
                        <td>{req.type}</td>
                        <td>{req.dateRequested}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              req.status?.toLowerCase() === "approved"
                                ? "status-ready"
                                : req.status?.toLowerCase() === "processing"
                                ? "status-processing"
                                : req.status?.toLowerCase() === "pending"
                                ? "status-pending-payment"
                                : req.status?.toLowerCase() === "completed"
                                ? "status-completed"
                                : req.status?.toLowerCase() === "rejected"
                                ? "status-rejected"
                                : "status-pending-payment"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>

                        <td className="action-cell">
                          <button
                            className="action-btn view-details-btn"
                            onClick={() => handleViewDetails(req)}
                            data-request-id={req.requestId || req.id}
                            data-document={req.type}
                            data-copies={req.copies}
                            data-date-needed={req.dateNeeded}
                            data-status={req.status}
                            data-created={req.created}
                            data-updated={req.updated}
                            data-proof-url={req.proofUrl || ""}
                            data-remarks={req.remarks || ""}
                          >
                            View Details
                          </button>

                          {(req.status === "Approved" ||
                            req.status === "Completed" ||
                            req.status?.toLowerCase() === "approved" ||
                            req.status?.toLowerCase() === "completed") && (
                            <Link
                              to={`/claim/${req.requestId || req.id}`}
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
                        No matching requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="table-footer">
            {search ? (
              <span className="showing-text">
                Showing {filteredRequests.length} result{filteredRequests.length !== 1 ? "s" : ""} for "{search}"
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="clear-search-link"
                  style={{
                    marginLeft: "10px",
                    color: "#007bff",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                    font: "inherit",
                  }}
                >
                  Clear search
                </button>
              </span>
            ) : (
              <span className="showing-text">
                Showing {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""} ({requests.length} total)
              </span>
            )}
          </div>
        </section>
      </main>

      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={handleCloseModal}
        />
      )}

      <Footer />
    </div>
  );
};

export default RequestsList;
