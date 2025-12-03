// src/api/notifications.js
import { apiRequest, buildQueryParams } from "./client";

const BASE = "/api/notifications";

// Get notifications for a specific user
export async function getNotifications(token, userId) {
  const query = buildQueryParams({ userId });
  return apiRequest(`${BASE}${query}`, {
    method: "GET",
    token,
  });
}

// Mark notification as read
export async function markNotificationRead(token, id) {
  return apiRequest(`${BASE}/${id}/read`, {
    method: "PUT",
    token,
  });
}

// Delete one notification
export async function deleteNotification(token, id) {
  return apiRequest(`${BASE}/${id}`, {
    method: "DELETE",
    token,
  });
}

// Optional: delete all for a user
export async function deleteAllNotifications(token, userId) {
  return apiRequest(`${BASE}/user/${userId}`, {
    method: "DELETE",
    token,
  });
}
