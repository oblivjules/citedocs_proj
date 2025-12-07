import axios from "axios";

const API = "http://localhost:8080"; // change if needed

export const getNotifications = async (token, userId) => {
  const res = await axios.get(`${API}/notifications/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getUnreadNotifications = async (token, userId) => {
  const res = await axios.get(`${API}/notifications/user/${userId}/unread`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const markNotificationRead = async (token, id) => {
  const res = await axios.put(
    `${API}/notifications/${id}/read`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};
