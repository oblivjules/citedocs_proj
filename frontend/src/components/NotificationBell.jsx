import React, { useEffect, useState } from "react";
import {
  fetchUnreadNotifications,
  fetchNotifications,
  markNotificationRead
} from "../api/notifications";

import "./NotificationBell.css";

export default function NotificationBell({ token, userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!token || !userId) return;

    const load = async () => {
      try {
        const unreadData = await fetchUnreadNotifications({ token, userId });
        const allData = await fetchNotifications({ token, userId });

        setUnread(unreadData);
        setNotifications(allData);
      } catch (err) {
        console.error("Notification fetch error:", err);
      }
    };

    load();
  }, [token, userId]);

  const handleOpen = () => setOpen(!open);

  const handleMarkRead = async (id) => {
    await markNotificationRead({ token, id });

    setUnread((prev) => prev.filter((n) => n.notificationId !== id));
    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === id ? { ...n, isRead: true } : n
      )
    );
  };

  return (
    <div className="notif-container">
      <div className="notif-icon" onClick={handleOpen}>
        🔔
        {unread.length > 0 && <span className="notif-badge">{unread.length}</span>}
      </div>

      {open && (
        <div className="notif-dropdown">
          <h4>Notifications</h4>
          {notifications.length === 0 && <p>No notifications</p>}

          {notifications.map((n) => (
            <div
              key={n.notificationId}
              className={`notif-item ${n.isRead ? "read" : "unread"}`}
              onClick={() => handleMarkRead(n.notificationId)}
            >
              <p>{n.message}</p>
              <small>{new Date(n.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
