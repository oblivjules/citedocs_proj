import React, { useEffect, useMemo, useState } from "react";
import "./StudentPortal.css";
import Header from "./components/Header";
import Footer from "../../../../components/layout/Footer";
import StatCard from "./components/StatCard";
import RequestTable from "./components/RequestTable";
import ActivityPanel from "./components/ActivityPanel";
import RequestDetailsModal from "../../registrar/RegistrarPortal/components/RequestDetailsModal";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../../../auth/context/AuthContext";
import { fetchRequests, fetchStatusLogs, fetchDocuments, fetchPaymentByRequestId } from "../../../../api/requests";
import { formatRequestId } from "../../../../utils/requestUtils";

const StudentPortal = () => {
  const { user } = useAuthContext();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [docFilter, setDocFilter] = useState("all");
  const [documentTypes, setDocumentTypes] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Check if current path is the dashboard root (/student)
  const isDashboard = location.pathname === "/student";

  const fallbackRequests = useMemo(
    () => [
      {
        id: "REQ-2025-001",
        type: "Transcript of Records",
        date: "Jan 10, 2025",
        status: "Processing",
        copies: 2,
        dateNeeded: "Feb 1, 2025",
        created: "Jan 10, 2025",
        lastUpdated: "Today",
      },
      {
        id: "REQ-2025-002",
        type: "Certificate of Enrollment",
        date: "Jan 14, 2025",
        status: "Approved",
        copies: 1,
        dateNeeded: "Feb 2, 2025",
        created: "Jan 14, 2025",
        lastUpdated: "Yesterday",
      },
      {
        id: "REQ-2025-003",
        type: "Diploma Copy",
        date: "Jan 13, 2025",
        status: "Pending",
        copies: 2,
        dateNeeded: "Feb 3, 2025",
        created: "Jan 13, 2025",
        lastUpdated: "Today",
      },
      {
        id: "REQ-2025-004",
        type: "Good Moral Character",
        date: "Jan 12, 2025",
        status: "Completed",
        copies: 1,
        dateNeeded: "Feb 4, 2025",
        created: "Jan 12, 2025",
        lastUpdated: "3 days ago",
      },
    ],
    []
  );

  useEffect(() => {
    const loadRequests = async () => {
      if (!token || !user?.userId) {
        setRequests(fallbackRequests);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setFetchError(null);
      try {
        // Backend now filters by userId
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
                date: req.createdAt
                  ? new Date(req.createdAt).toLocaleDateString()
                  : "",
                status: formattedStatus,
                copies: req.copies || 1,
                dateNeeded: req.dateNeeded,
                date: req.dateNeeded
                  ? new Date(req.dateNeeded).toLocaleDateString()
                  : "",
                created: req.createdAt
                  ? new Date(req.createdAt).toLocaleDateString()
                  : "",
                lastUpdated: req.updatedAt
                  ? new Date(req.updatedAt).toLocaleDateString()
                  : "",
                createdAt: req.createdAt,
                updatedAt: req.updatedAt,
                remarks: req.remarks,
                proofImage: proofUrl,
                proofUrl: proofUrl,
              };
            })
          );
          setRequests(requestsWithPayments);
        } else {
          setRequests([]);
        }
      } catch (error) {
        console.error("Unable to load student requests", error);
        setFetchError(error.message);
        setRequests(fallbackRequests);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, [token, user, fallbackRequests]);

  // Load document types from API or extract from requests
  useEffect(() => {
    const loadDocumentTypes = async () => {
      if (!token) {
        // Extract from requests if no token
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
        // Fallback to extracting from requests if API fails
        const types = new Set();
        requests.forEach((r) => {
          if (r.type) types.add(r.type);
        });
        setDocumentTypes(Array.from(types).sort());
      }
    };

    loadDocumentTypes();
  }, [token, requests]);

  const stats = [
    {
      title: "Request Document",
      subtitle: "Submit a new document request",
      icon: "📄",
      variant: "primary",
      onClick: () => navigate("/student/request-form"),
    },
    {
      title: "Documents Requested",
      subtitle: "View all your previous requests",
      value: requests.length.toString(),
      icon: "📋",
      variant: "yellow",
      onClick: () => navigate("/student/requests"),
    },
    {
      title: "Ready for Pickup",
      subtitle: "Approved documents",
      value: requests
        .filter((item) => {
          const s = (item.status || "").toString().toLowerCase();
          return s === "approved" || s === "completed" || s === "ready_for_pickup" || s === "ready for pickup";
        })
        .length.toString(),
      icon: "✓",
      variant: "white",
    },
  ];

  // Format activity title and description based on status (DocuTrackr style)
  const formatActivity = (log, requestId) => {
    const requestIdStr = requestId?.toString() || log.requestId?.toString() || "";
    const formattedId = `REQ-${requestIdStr}`;
    const newStatus = (log.newStatus || "").toUpperCase();
    const oldStatus = (log.oldStatus || "").toUpperCase();
    const staffName = log.changedByName || null;
    
    // Find document name from requests if available
    const request = requests.find(r => (r.id?.replace('REQ-', '') === requestIdStr) || (r.requestId?.toString() === requestIdStr));
    const documentName = request?.documentLabel || request?.documentType || "document";
    
    let title = "Request Status Changed";
    let description = "";
    
    // Handle initial submission (old_status is null or "none")
    if (!oldStatus || oldStatus === "NONE" || oldStatus === "NULL") {
      title = "Request Submitted";
      description = `You submitted ${formattedId} (${documentName})`;
    } else if (newStatus === "PROCESSING") {
      title = "Request Processing";
      description = `Your ${formattedId} (${documentName}) is now being processed${staffName ? ` by Staff ${staffName}` : ""}.`;
    } else if (newStatus === "APPROVED") {
      title = "Request Approved";
      description = `Your ${formattedId} (${documentName}) has been approved${staffName ? ` by Staff ${staffName}` : ""}. It is now ready for pick up.`;
    } else if (newStatus === "COMPLETED") {
      title = "Request Completed";
      description = `Your ${formattedId} (${documentName}) has been picked up.`;
    } else if (newStatus === "REJECTED") {
      title = "Request Rejected";
      description = `Your ${formattedId} (${documentName}) has been rejected${staffName ? ` by Staff ${staffName}` : ""}.`;
    } else {
      title = "Request Status Changed";
      description = `Your ${formattedId} (${documentName}) status updated to ${newStatus}${staffName ? ` by Staff ${staffName}` : ""}`;
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
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    return date.toLocaleDateString();
  };

  // Load activities from status logs
  useEffect(() => {
    const loadActivities = async () => {
      if (!token || !user?.userId) {
        setActivities([]);
        return;
      }

      try {
        const logs = await fetchStatusLogs({
          token,
          query: { userId: user.userId },
        });

        if (Array.isArray(logs) && logs.length > 0) {
          const formattedActivities = logs
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
  }, [token, user?.userId]);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
  };

  // Debounced search state
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input (500ms delay like Django templates)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Filter and sort recent requests
  const recentRequests = useMemo(() => {
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

    // Apply search filter (using debounced search)
    if (debouncedSearch && debouncedSearch.length >= 2) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.type?.toLowerCase().includes(searchLower) ||
          (r.id || `REQ-${r.requestId || r.id}`)?.toLowerCase().includes(searchLower)
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
  }, [requests, statusFilter, docFilter, debouncedSearch]);

  return (
    <div className="portal-container">
      <Header studentName={user?.name || "Student"} />

      {/* Nested routes */}
      <Outlet />

      {/* Dashboard content */}
      {isDashboard && (
        <div className="portal-content">
          <div className="portal-main">
            <div className="portal-stats">
              {stats.map((s, index) => (
                <div
                  key={index}
                  onClick={s.onClick}
                  style={{ cursor: s.onClick ? "pointer" : "default" }}
                >
                  <StatCard
                    title={s.title}
                    subtitle={s.subtitle}
                    value={s.value}
                    icon={s.icon}
                    variant={s.variant}
                  />
                </div>
              ))}
            </div>

            {/* Table Section with Search and Filters */}
            <div className="table-section recent-requests">
              <div className="section-header">
                <h2>Recent Document Requests</h2>
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
                  </div>
                </div>
              </div>

              {fetchError && (
                <div className="alert alert-error">{fetchError}</div>
              )}
              {isLoading ? (
                <p className="empty-state">Loading your requests…</p>
              ) : (
                <>
                  <div className="table-container">
                    <RequestTable
                      requests={recentRequests}
                      onViewDetails={handleViewDetails}
                    />
                  </div>
                  <div className={`table-footer ${search ? "search-mode" : ""}`}>
                    <div>
                      {search ? (
                        <>
                          <span className="showing-text">
                            Showing {recentRequests.length} result{recentRequests.length !== 1 ? "s" : ""} for "{search}"
                          </span>
                          <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="clear-search-link"
                          >
                            Clear search
                          </button>
                        </>
                      ) : (
                        <span className="showing-text">
                          Showing {recentRequests.length} recent request{recentRequests.length !== 1 ? "s" : ""} ({requests.length} total)
                        </span>
                      )}
                    </div>
                    <Link
                      to="/student/requests"
                      className="view-all-btn"
                      style={{ textDecoration: "none" }}
                    >
                      View All Requests
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          <ActivityPanel activities={activities} />
        </div>
      )}

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

export default StudentPortal;
