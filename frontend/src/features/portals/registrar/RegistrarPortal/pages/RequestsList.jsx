import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RequestTable from "../components/RequestTable";
import RequestDetailsModal from "../components/RequestDetailsModal";
import StatusUpdateModal from "../components/StatusUpdateModal";
import useModal from "../hooks/useModal";
import { useAuthContext } from "../../../../auth/context/AuthContext";
import { fetchDocuments } from "../../../../api/requests";

export default function RequestsList({ requests = [], onStatusChange }) {
  const detailsModal = useModal();
  const statusModal = useModal();
  const [statusFilter, setStatusFilter] = useState("all");
  const [docFilter, setDocFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [documentTypes, setDocumentTypes] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuthContext();

  // Load document types from API
  useEffect(() => {
    const loadDocumentTypes = async () => {
      if (!token) {
        // Fallback to extracting from requests if no token
        const types = new Set();
        requests.forEach((r) => {
          if (r.documentType) types.add(r.documentType);
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

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Search is handled in filtering logic
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

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
        (r.id || r.referenceCode || r.requestId)
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
    await onStatusChange(id, newStatus, remarks, dateReady);
    statusModal.close();
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
        <RequestTable
          requests={filtered}
          onViewDetails={handleViewDetails}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>

      <div className="table-footer">
        {search ? (
          <span className="showing-text">
            Showing {filtered.length} result{filtered.length !== 1 ? "s" : ""}{" "}
            for "{search}"
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSearch("");
              }}
              style={{ marginLeft: "10px", color: "#007bff", textDecoration: "none" }}
            >
              Clear search
            </a>
          </span>
        ) : (
          <span className="showing-text">
            Showing {filtered.length} request{filtered.length !== 1 ? "s" : ""} (
            {requests.length} total)
          </span>
        )}
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
