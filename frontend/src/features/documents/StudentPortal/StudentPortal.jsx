import React, { useEffect, useMemo, useState } from "react";
import "./StudentPortal.css";
import Header from "./components/Header";
import Footer from "../../../components/layout/Footer";
import StatCard from "./components/StatCard";
import RequestTable from "./components/RequestTable";
import ActivityPanel from "./components/ActivityPanel";
import RequestDetailsModal from "./components/RequestDetailsModal";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../auth/context/AuthContext";
import { fetchRequests, fetchStatusLogs } from "../../../api/requests";

const StudentPortal = () => {
  const { user } = useAuthContext();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
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
          setRequests(
            data.map((req) => {
              const rawStatus = req.status || "PENDING";
              const formattedStatus = rawStatus
                .toString()
                .toLowerCase()
                .replace(/(^|_)([a-z])/g, (m, p1, p2) => p2.toUpperCase());

              return {
                id: req.requestId?.toString() || req.id?.toString() || "",
                type: req.document?.name || req.documentType?.name || "Document",
                date: req.createdAt
                  ? new Date(req.createdAt).toLocaleDateString()
                  : "",
                status: formattedStatus,
                copies: req.copies || 1,
                dateNeeded: req.dateNeeded
                  ? new Date(req.dateNeeded).toLocaleDateString()
                  : "",
                created: req.createdAt
                  ? new Date(req.createdAt).toLocaleDateString()
                  : "",
                lastUpdated: req.updatedAt
                  ? new Date(req.updatedAt).toLocaleDateString()
                  : "",
              };
            })
          );
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

  // Format status change message
  const formatStatusMessage = (log, requestId) => {
    const requestIdStr = requestId?.toString() || log.requestId?.toString() || "";
    const statusMessages = {
      PENDING: "submitted",
      PROCESSING: "is now processing",
      APPROVED: "has been approved",
      COMPLETED: "has been completed",
      REJECTED: "has been rejected",
    };
    
    const newStatus = log.newStatus || "";
    const statusText = statusMessages[newStatus] || `status changed to ${newStatus}`;
    
    return `Request REQ-${requestIdStr} ${statusText}`;
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
              
              return {
                id: log.logId || log.id,
                action: formatStatusMessage(log, requestId),
                time: formatRelativeTime(log.changedAt),
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
  }, [token, user?.userId]);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
  };

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

            {fetchError && (
              <div className="alert alert-error">{fetchError}</div>
            )}
            {isLoading ? (
              <p className="empty-state">Loading your requests…</p>
            ) : (
              <RequestTable
                requests={requests}
                onViewDetails={handleViewDetails}
              />
            )}
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
