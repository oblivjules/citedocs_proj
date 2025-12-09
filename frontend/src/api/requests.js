import { apiRequest } from "./client";

const REQUESTS_BASE = "/api/requests";
const CLAIM_SLIPS_BASE = "/api/claim-slips";

export const fetchRequests = ({ token, query } = {}) =>
  apiRequest(REQUESTS_BASE, {
    method: "GET",
    token,
    query,
  });

export const fetchRequestById = ({ id, token }) =>
  apiRequest(`${REQUESTS_BASE}/${id}`, {
    method: "GET",
    token,
  });

export const createRequest = ({ payload, token }) => {
  // Backend expects JSON, not FormData
  return apiRequest(REQUESTS_BASE, {
    method: "POST",
    body: payload,
    token,
  });
};

export const updateRequest = ({ id, payload, token }) =>
  apiRequest(`${REQUESTS_BASE}/${id}`, {
    method: "PUT",
    body: payload,
    token,
  });

export const updateRequestStatus = ({ id, status, remarks, dateReady, token }) => {
  const body = {
    status: status ? status.toUpperCase() : status,
    remarks: remarks || null,
  };
  
  // Only include dateReady if provided and status is approved
  if (dateReady && status?.toLowerCase() === "approved") {
    body.dateReady = dateReady;
  }
  
  return apiRequest(`${REQUESTS_BASE}/${id}/status`, {
    method: "PUT",
    body,
    token,
  });
};

export const fetchClaimSlip = ({ requestId, token }) => {
  // Ensure requestId is a number
  const numericRequestId = typeof requestId === 'string' ? parseInt(requestId, 10) : requestId;
  return apiRequest(`${CLAIM_SLIPS_BASE}?requestId=${numericRequestId}`, {
    method: "GET",
    token,
  });
};

const STATUS_LOGS_BASE = "/api/request-status-logs";

export const fetchStatusLogs = ({ token, query } = {}) =>
  apiRequest(STATUS_LOGS_BASE, {
    method: "GET",
    token,
    query,
  });

const DOCUMENTS_BASE = "/api/documents";

export const fetchDocuments = ({ token } = {}) =>
  apiRequest(DOCUMENTS_BASE, {
    method: "GET",
    token,
  });

const PAYMENTS_BASE = "/api/payments";

export const createPayment = ({ requestId, proofFile, remarks, token }) => {
  const formData = new FormData();
  formData.append("requestId", requestId);
  formData.append("proofFile", proofFile);
  if (remarks) {
    formData.append("remarks", remarks);
  }

  return apiRequest(`${PAYMENTS_BASE}/upload`, {
    method: "POST",
    body: formData,
    token,
  });
};

export const fetchPaymentByRequestId = async ({ requestId, token }) => {
  try {
    return await apiRequest(`${PAYMENTS_BASE}/request/${requestId}`, {
      method: "GET",
      token,
    });
  } catch (error) {
    // Handle 404 (payment not found) gracefully
    if (error.message && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
};

