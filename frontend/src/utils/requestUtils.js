/**
 * Format request ID consistently as "REQ-{ID}"
 * @param {number|string} requestId - The request ID number
 * @returns {string} Formatted request ID (e.g., "REQ-123")
 */
export const formatRequestId = (requestId) => {
  if (!requestId) return "REQ-000";
  const id = typeof requestId === "string" ? parseInt(requestId, 10) : requestId;
  return `REQ-${id}`;
};

/**
 * Format claim number as "REQ-YYYY-XXX" where YYYY is year and XXX is sequential number
 * @param {number|string} requestId - The request ID number
 * @param {number} sequence - Optional sequence number (defaults to requestId)
 * @returns {string} Formatted claim number (e.g., "REQ-2025-002")
 */
export const formatClaimNumber = (requestId, sequence = null) => {
  const year = new Date().getFullYear();
  const seq = sequence !== null ? sequence : (typeof requestId === "string" ? parseInt(requestId, 10) : requestId);
  const paddedSeq = String(seq).padStart(3, "0");
  return `REQ-${year}-${paddedSeq}`;
};

/**
 * Extract numeric ID from formatted request ID
 * @param {string} formattedId - Formatted ID like "REQ-123"
 * @returns {number|null} Numeric ID or null if invalid
 */
export const extractRequestId = (formattedId) => {
  if (!formattedId) return null;
  const match = formattedId.match(/REQ-(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

