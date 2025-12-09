import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RequestTable from "../components/RequestTable";
import RequestDetailsModal from "../components/RequestDetailsModal";
import StatusUpdateModal from "../components/StatusUpdateModal";
import useModal from "../hooks/useModal";
import { useAuthContext } from "../../../../auth/context/AuthContext";
import { fetchRequests, updateRequestStatus, fetchDocuments, fetchPaymentByRequestId } from "../../../../../api/requests";
import { formatRequestId } from "../../../../../utils/requestUtils";

export default function AllRequests() {
  const detailsModal = useModal();
  const statusModal = useModal();
  const [statusFilter, setStatusFilter] = useState("all");
  const [docFilter, setDocFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [documentTypes, setDocumentTypes] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuthContext();

  // Load requests
  useEffect(() => {
    const loadRequests = async () => {
      if (!token) return;
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = await fetchRequests({ token });
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
                id: formatRequestId(req.requestId || req.id),
                requestId: req.requestId || req.id,
                referenceCode: formatRequestId(req.requestId || req.id),
                studentName: req.userName || "Unknown Student",
                studentId: req.studentId || "N/A",
                documentType:
                  req.documentName ||
                  req.documentType?.name ||
                  req.documentType ||
                  "Document",
                purpose: req.purpose,
                copies: req.copies,
                status: (req.status || "").toLowerCase(),
                date: req.createdAt
                  ? new Date(req.createdAt).toLocaleDateString()
                  : "",
                dateNeeded: req.dateNeeded,
                dateReady: req.dateReady,
                proofImage: proofUrl,
                proofUrl: proofUrl,
                remarks: req.remarks,
                createdAt: req.createdAt,
              };
            })
          );
          setRequests(requestsWithPayments);
        }
      } catch (error) {
        console.error("Unable to load requests", error);
        setFetchError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, [token]);

  // Load document types from API
  useEffect(() => {
    const loadDocumentTypes = async () => {
      if (!token) return;
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
        // Fallback to extracting from requests if API fails
        const types = new Set();
        requests.forEach((r) => {
          if (r.documentType) types.add(r.documentType);
        });
        setDocumentTypes(Array.from(types).sort());
      }
    };

    loadDocumentTypes();
  }, [token, requests]);

  // Get status from query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusFromURL = params.get("status");
    if (statusFromURL) setStatusFilter(statusFromURL);
    else setStatusFilter("all");
  }, [location.search]);

  // Enhanced filtering logic
  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchesStatus =
        statusFilter === "all" || r.status.toLowerCase() === statusFilter;
      const matchesDoc =
        docFilter === "all" || r.documentType === docFilter;
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        search.length < 2 ||
        r.studentName?.toLowerCase().includes(searchLower) ||
        r.studentId?.toLowerCase().includes(searchLower) ||
        r.documentType?.toLowerCase().includes(searchLower) ||
        (r.id || r.referenceCode)
          ?.toLowerCase()
          .includes(searchLower);
      return matchesStatus && matchesDoc && matchesSearch;
    });
  }, [requests, statusFilter, docFilter, search]);

  const handleViewDetails = (request) => {
    detailsModal.open(request);
  };

  const handleUpdateStatus = (request) => {
    statusModal.open(request);
  };

  const handleStatusUpdate = async (id, newStatus, remarks, dateReady) => {
    if (!token) return;
    try {
      await updateRequestStatus({
        id: id,
        status: newStatus,
        remarks,
        dateReady,
        token,
      });
      // Reload requests to get updated data
      const data = await fetchRequests({ token });
      if (Array.isArray(data)) {
        setRequests(
          data.map((req) => ({
            id: formatRequestId(req.requestId || req.id),
            requestId: req.requestId || req.id,
            referenceCode: formatRequestId(req.requestId || req.id),
            studentName: req.userName || "Unknown Student",
            studentId: req.studentId || "N/A",
            documentType:
              req.documentName ||
              req.documentType?.name ||
              req.documentType ||
              "Document",
            purpose: req.purpose,
            copies: req.copies,
            status: (req.status || "").toLowerCase(),
            date: req.createdAt
              ? new Date(req.createdAt).toLocaleDateString()
              : "",
            dateReady: req.dateReady,
            proofImage: req.proofOfPayment,
            remarks: req.remarks,
            createdAt: req.createdAt,
          }))
        );
      }
      statusModal.close();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert(`Failed to update: ${error.message || "Unknown error"}`);
    }
  };

  // Keyboard shortcut for search (Ctrl+F)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        const searchInput = document.querySelector(".search-input");
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="portal-body">
      <div className="card">
        <div className="table-header">
          <h2>All Document Requests</h2>

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
                  className="search-input"
                  placeholder="Search by Request ID, Student Name/ID, Document Type, Status..."
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
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    const params = new URLSearchParams(location.search);
                    if (e.target.value === "all") {
                      params.delete("status");
                    } else {
                      params.set("status", e.target.value);
                    }
                    navigate({ search: params.toString() });
                  }}
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
          {fetchError && <div className="alert alert-error">{fetchError}</div>}
          {isLoading ? (
            <p className="empty-state">Loading requests…</p>
          ) : (
            <RequestTable
              requests={filtered}
              onViewDetails={handleViewDetails}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        </div>

        <div className="table-footer">
          {search ? (
            <span className="showing-text">
              Showing {filtered.length} result{filtered.length !== 1 ? "s" : ""}{" "}
              for "{search}"
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{ marginLeft: "10px", color: "#007bff", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0, font: "inherit" }}
              >
                Clear search
              </button>
            </span>
          ) : (
            <span className="showing-text">
              Showing {filtered.length} request{filtered.length !== 1 ? "s" : ""} (
              {requests.length} total)
            </span>
          )}
        </div>
      </div>

      {detailsModal.isOpen && (
        <RequestDetailsModal
          request={detailsModal.data}
          onClose={detailsModal.close}
        />
      )}

      {statusModal.isOpen && (
        <StatusUpdateModal
          request={statusModal.data}
          onClose={statusModal.close}
          onStatusChange={handleStatusUpdate}
        />
      )}
    </div>
  );
}

