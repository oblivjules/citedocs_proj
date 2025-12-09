import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Outlet, useLocation, Link } from "react-router-dom";
import "./RegistrarPortal.css";

import Header from "./components/Header";
import StatCard from "./components/StatCard";
import RequestTable from "./components/RequestTable";
import RequestDetailsModal from "./components/RequestDetailsModal";
import StatusUpdateModal from "./components/StatusUpdateModal";
import ActivityPanel from "./components/ActivityPanel";
import Footer from "../../../../components/layout/Footer";
import { useAuthContext } from "../../../auth/context/AuthContext";
import {
  fetchRequests,
  updateRequestStatus,
  fetchDocuments,
  fetchPaymentByRequestId,
  fetchStatusLogs,
} from "../../../../api/requests";
import { formatRequestId } from "../../../../utils/requestUtils";
import useModal from "./hooks/useModal";

export default function RegistrarPortal() {
  const location = useLocation();
  const { token } = useAuthContext();
  const detailsModal = useModal();
  const statusModal = useModal();
  
  const isDashboard = location.pathname === "/registrar" || location.pathname === "/registrar/";

  const fallbackRequests = useMemo(
    () => [
      {
        id: "REQ-2025-001",
        studentName: "John Doe",
        studentId: "20-2423-001",
        documentType: "Transcript of Records",
        purpose: "Job Application",
        copies: 2,
        status: "processing",
        date: "Jan 15, 2025",
        proofImage: "/proof-test.jpg",
      },
      {
        id: "REQ-2025-002",
        studentName: "Jane Smith",
        studentId: "20-1678-002",
        documentType: "Certificate of Good Moral",
        purpose: "Scholarship",
        copies: 1,
        status: "approved",
        date: "Jan 14, 2025",
        proofImage: "/proof-image2.jpg",
      },
      {
        id: "REQ-2025-003",
        studentName: "Jan Sith",
        studentId: "22-4689-003",
        documentType: "Certificate of Enrollment",
        purpose: "Internship",
        copies: 3,
        status: "completed",
        date: "Feb 1, 2025",
        proofImage: "/proof-test.jpg",
      },
      {
        id: "REQ-2025-004",
        studentName: "Blissy Chavez",
        studentId: "23-2124-004",
        documentType: "Certificate of Good Moral",
        purpose: "Scholarship",
        copies: 1,
        status: "rejected",
        date: "Jan 14, 2025",
        proofImage: "/proof-image2.jpg",
      },
      {
        id: "REQ-2025-005",
        studentName: "Vein Pangilinan",
        studentId: "23-2124-005",
        documentType: "Transcript of Records",
        purpose: "Internship",
        copies: 8,
        status: "pending",
        date: "Dec 19, 2025",
        proofImage: "/proof-test.jpg",
      },
      {
        id: "REQ-2025-006",
        studentName: "Ahtisa Manalo",
        studentId: "23-2124-005",
        documentType: "Transcript of Records",
        purpose: "Internship",
        copies: 15,
        status: "pending",
        date: "Dec 01, 2025",
        proofImage: "/proof-test.jpg",
      },
    ],
    []
  );

  const [requests, setRequests] = useState(fallbackRequests);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [docFilter, setDocFilter] = useState("all");
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const loadRequests = async () => {
      if (!token) {
        setRequests(fallbackRequests);
        return;
      }
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
                documentType: req.documentName || req.documentType?.name || req.documentType || "Document",
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
        console.error("Unable to load registrar requests", error);
        setFetchError(error.message);
        setRequests(fallbackRequests);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, [token, fallbackRequests]);

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

  // Format activity title and description based on status (Staff-facing language)
  const formatActivity = (log, requestId) => {
    const requestIdStr = requestId?.toString() || log.requestId?.toString() || "";
    const formattedId = formatRequestId(requestIdStr);
    const newStatus = (log.newStatus || "").toUpperCase();
    const oldStatus = (log.oldStatus || "").toUpperCase();
    const staffName = log.changedByName || null;
    
    // Find document name from requests if available
    const request = requests.find(r => (r.requestId?.toString() === requestIdStr) || (r.id?.replace('REQ-', '') === requestIdStr));
    const documentName = request?.documentType || "document";
    
    let title = "Request Status Changed";
    let description = "";
    
    // Helper to append staff name when available
    const appendStaff = (text) => {
      return staffName ? `${text} by ${staffName}` : text;
    };
    
    // Handle initial submission (old_status is null or "none")
    if (!oldStatus || oldStatus === "NONE" || oldStatus === "NULL") {
      title = "Request Submitted";
      description = `${formattedId} (${documentName}) was submitted`;
    } else if (newStatus === "PROCESSING") {
      title = "Request Processing";
      description = appendStaff(`${formattedId} (${documentName}) is now being processed`);
    } else if (newStatus === "APPROVED") {
      title = "Request Approved";
      description = `${appendStaff(`${formattedId} (${documentName}) has been approved`)}. Ready for pick up.`;
    } else if (newStatus === "COMPLETED") {
      title = "Request Completed";
      description = staffName 
        ? `${formattedId} (${documentName}) has been picked up (approved by ${staffName})`
        : `${formattedId} (${documentName}) has been picked up`;
    } else if (newStatus === "REJECTED") {
      title = "Request Rejected";
      description = appendStaff(`${formattedId} (${documentName}) has been rejected`);
    } else {
      title = "Request Status Changed";
      description = appendStaff(`${formattedId} (${documentName}) status updated to ${newStatus}`);
    }
    
    return { title, description };
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"}`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"}`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"}`;
    return date.toLocaleDateString();
  };

  // Load activities from status logs
  useEffect(() => {
    const loadActivities = async () => {
      if (!token) {
        setActivities([]);
        return;
      }

      try {
        const logs = await fetchStatusLogs({ token });

        if (Array.isArray(logs) && logs.length > 0) {
          // Sort by changedAt descending to get most recent first
          const sortedLogs = [...logs].sort((a, b) => {
            const dateA = a.changedAt ? new Date(a.changedAt).getTime() : 0;
            const dateB = b.changedAt ? new Date(b.changedAt).getTime() : 0;
            return dateB - dateA;
          });

          const formattedActivities = sortedLogs
            .slice(0, 10) // Limit to 10 most recent
            .map((log) => {
              const requestId = log.requestId?.toString() || "";
              const activity = formatActivity(log, requestId);
              
              return {
                id: log.logId || log.id,
                title: activity.title,
                description: activity.description,
                action: activity.description, // For backward compatibility
                time: formatRelativeTime(log.changedAt) + " ago",
                changedAt: log.changedAt,
                requestId: requestId,
                changedByName: log.changedByName, // Preserve staff name
              };
            });

          setActivities(formattedActivities);
        } else {
          setActivities([]);
        }
      } catch (error) {
        console.error("Unable to load activities", error);
        // Don't set error state for activities, just use empty array
        setActivities([]);
      }
    };

    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, requests]);

  const handleStatusChange = async (id, newStatus, remarks, dateReady) => {
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
      statusModal.close();
    } catch (error) {
      console.error("Unable to update status", error);
      setFetchError(error.message);
    }
  };

  const handleViewDetails = (request) => {
    detailsModal.open(request);
  };

  const handleUpdateStatus = (request) => {
    statusModal.open(request);
  };

  const stats = [
    {
      label: "Total Requests",
      value: requests.length,
      color: "stat-total",
      link: "/registrar?status=all",
    },
    {
      label: "Pending",
      value: requests.filter((r) => r.status === "pending").length,
      color: "stat-pending",
      link: "/registrar?status=pending",
    },
    {
      label: "Processing",
      value: requests.filter((r) => r.status === "processing").length,
      color: "stat-warning",
      link: "/registrar?status=processing",
    },
    {
      label: "Approved",
      value: requests.filter((r) => r.status === "approved").length,
      color: "stat-approved",
      link: "/registrar?status=approved",
    },
    {
      label: "Completed",
      value: requests.filter((r) => r.status === "completed").length,
      color: "stat-success",
      link: "/registrar?status=completed",
    },
    {
      label: "Rejected",
      value: requests.filter((r) => r.status === "rejected").length,
      color: "stat-danger",
      link: "/registrar?status=rejected",
    },
  ];

  // Filter and sort recent requests
  const recentRequests = useMemo(() => {
    let filtered = [...requests];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status.toLowerCase() === statusFilter);
    }

    // Apply document type filter
    if (docFilter !== "all") {
      filtered = filtered.filter((r) => r.documentType === docFilter);
    }

    // Apply search filter
    if (search && search.length >= 2) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.studentName?.toLowerCase().includes(searchLower) ||
          r.studentId?.toLowerCase().includes(searchLower) ||
          r.documentType?.toLowerCase().includes(searchLower) ||
          (r.id || r.referenceCode)?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by createdAt (most recent first) and limit to 10
    return filtered
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // Most recent first
      })
      .slice(0, 10);
  }, [requests, statusFilter, docFilter, search]);

  return (
    <div className="portal-container">
      <Header registrarName="Jane Doe" />

      {/* Nested routes */}
      <Outlet />

      {/* Dashboard content */}
      {isDashboard && (
        <div className="portal-body">
          {/* Stats Section */}
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                label={stat.label}
                value={stat.value}
                color={stat.color}
                link={stat.link}
              />
            ))}
          </div>

          {/* Recent Requests Section */}
          <div className="scrollable-section">
            <div className="table-header">
              <h2>Recent Requests</h2>

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

            {fetchError && <div className="alert alert-error">{fetchError}</div>}
            {isLoading ? (
              <p className="empty-state">Loading requests…</p>
            ) : (
              <div className="table-container">
                <RequestTable
                  requests={recentRequests}
                  onViewDetails={handleViewDetails}
                  onUpdateStatus={handleUpdateStatus}
                />
              </div>
            )}
            <div className="table-footer">
              {search ? (
                <span className="showing-text">
                  Showing {recentRequests.length} result{recentRequests.length !== 1 ? "s" : ""}{" "}
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
                  Showing {recentRequests.length} recent request{recentRequests.length !== 1 ? "s" : ""} ({requests.length} total)
                </span>
              )}
              <Link
                to="/registrar/all-requests"
                className="view-all-btn"
                style={{ textDecoration: "none" }}
              >
                View All Requests
              </Link>
            </div>
          </div>

          {/* Activity Panel BELOW table */}
          <div className="activity-section">
            <ActivityPanel activities={activities} />
          </div>
        </div>
      )}

      {/* Modals */}
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
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
