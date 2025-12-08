import React, { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../../auth/context/AuthContext";
import appLogo from "../../../../../assets/images/app_logo.png";

import {
  getNotifications,
  getUnreadNotifications,
  markNotificationRead
} from "../../../../../api/notifications";

import "../../../../../components/NotificationStyles.css";

export default function Header({ registrarName = "Registrar" }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState([]);

  const navigate = useNavigate();
  const { logout, user, token } = useAuthContext();

  /** --------------------------------------------------
   * Get Initials (Correct logic: first + last initial)
   * Example: Juan Dela Cruz → JC
   -----------------------------------------------------*/
  const getInitials = (fullName) => {
    if (!fullName) return "U";

    const parts = fullName.trim().split(" ").filter(Boolean);

    // Fallback for single names
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    const firstInitial = parts[0][0];
    const lastInitial = parts[parts.length - 1][0];

    return (firstInitial + lastInitial).toUpperCase();
  };

  const initials = getInitials(user?.name || registrarName);

  /** --------------------------------------------------
   * LOAD NOTIFICATIONS
   -----------------------------------------------------*/
  const loadNotifications = useCallback(async () => {
    if (!token || !user?.userId) return;
    try {
      const all = await getNotifications(token, user.userId);
      const unreadList = await getUnreadNotifications(token, user.userId);

      setNotifications(all);
      setUnread(unreadList);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  }, [token, user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  /** --------------------------------------------------
   * MARK AS READ
   -----------------------------------------------------*/
  const handleMarkRead = async (id) => {
    await markNotificationRead(token, id);

    setUnread(unread.filter((n) => n.notificationId !== id));

    setNotifications(
      notifications.map((n) =>
        n.notificationId === id ? { ...n, isRead: true } : n
      )
    );
  };

  /** --------------------------------------------------
   * LOGOUT
   -----------------------------------------------------*/
  const handleLogout = () => {
    logout();
    navigate("/registrar-login", { replace: true });
  };

  /** --------------------------------------------------
   * Notification Icon Select
   -----------------------------------------------------*/
  const getIcon = (msg) => {
    msg = msg.toLowerCase();
    if (msg.includes("submitted")) return "📝";
    if (msg.includes("approved")) return "✅";
    if (msg.includes("processing")) return "⚙️";
    if (msg.includes("rejected")) return "❌";
    if (msg.includes("payment")) return "💰";
    return "🔔";
  };

  /** --------------------------------------------------
   * RENDER
   -----------------------------------------------------*/
  return (
    <>
      <header
        style={{
          backgroundColor: "#8B2635",
          color: "white",
          padding: "16px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        {/* LEFT SECTION */}
        <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
          <img
            src={appLogo}
            alt="CITeDocs Logo"
            style={{ height: "48px", cursor: "pointer" }}
            onClick={() => navigate("/registrar")}
          />

          <nav style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            <NavLink to="/registrar" className="nav-link">Home</NavLink>
            <NavLink to="/registrar/all-requests" className="nav-link">All Requests</NavLink>
          </nav>
        </div>

        {/* RIGHT SECTION */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          
          {/* NOTIFICATION BELL */}
          <div style={{ position: "relative" }}>
            <div
              className="notification-bell"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
              {unread.length > 0 && (
                <span className="notification-badge">{unread.length}</span>
              )}
            </div>

            {showNotifications && (
              <div className="notification-dropdown">
                
                <div className="notification-header">Notifications</div>

                <div className="notification-list">
                  {notifications.map((notif) => {
                    const isRead = notif.isRead;

                    return (
                      <div
                        key={notif.notificationId}
                        className={`notification-item ${isRead ? "read" : "unread"}`}
                        onClick={() => handleMarkRead(notif.notificationId)}
                      >
                        <div className="notification-icon">{getIcon(notif.message)}</div>

                        <div>
                          <p className={`notification-message ${isRead ? "" : "unread"}`}>
                            {notif.message}
                          </p>

                          <div className="notification-time">
                            {new Date(notif.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="notification-footer"
                  onClick={() => {
                    unread.forEach((n) => handleMarkRead(n.notificationId));
                    setShowNotifications(false);
                  }}
                >
                  Mark all as read
                </div>
              </div>
            )}
          </div>

          {/* DYNAMIC AVATAR INITIALS */}
          <div className="user-avatar">{initials}</div>

          {/* USER NAME */}
          <span style={{ fontWeight: "600", fontSize: "15px" }}>
            {user?.name || registrarName}
          </span>

          {/* LOGOUT BUTTON */}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* CLICK OUTSIDE TO CLOSE NOTIFICATION DROPDOWN */}
      {showNotifications && (
        <div
          onClick={() => setShowNotifications(false)}
          style={{ position: "fixed", inset: 0, zIndex: 80 }}
        />
      )}
    </>
  );
}
