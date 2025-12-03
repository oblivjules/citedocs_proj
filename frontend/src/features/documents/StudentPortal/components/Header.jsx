import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../auth/context/AuthContext";
import appLogo from "../../../../assets/images/app_logo.png";

import {
  getNotifications,
  deleteNotification,
  markNotificationRead,
} from "../../../../api/notifications";

const Header = ({ studentName }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();
  const { logout, user, token } = useAuthContext();

  // initials
  const getUserInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const userInitials = getUserInitials(user?.name || studentName);

  // 🔔 load notifications
  useEffect(() => {
    if (!user || !token) return;

    const userId =
      user.id ?? user.userId ?? user.user_id ?? user.userid ?? user.uid;

    if (!userId) {
      console.warn("No userId found on user object for notifications.");
      return;
    }

    async function load() {
      try {
        const data = await getNotifications(token, userId);
        setNotifications(data);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    }

    load();
  }, [user, token]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate("/student-login", { replace: true });
  };

  const markRead = async (id) => {
    try {
      const updated = await markNotificationRead(token, id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? updated : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const removeNotification = async (id) => {
    try {
      await deleteNotification(token, id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

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
        }}
      >
        {/* Left Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
          <img
            src={appLogo}
            alt="CITeDocs Logo"
            style={{ height: "48px", cursor: "pointer" }}
            onClick={() => navigate("/student")}
          />

          {/* Navigation Links */}
          <nav style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            <NavLink
              to="/student"
              className={({ isActive }) =>
                isActive ? "nav-link active-link" : "nav-link"
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/student/request-form"
              className={({ isActive }) =>
                isActive ? "nav-link active-link" : "nav-link"
              }
            >
              Create Request
            </NavLink>

            <NavLink
              to="/student/requests"
              className={({ isActive }) =>
                isActive ? "nav-link active-link" : "nav-link"
              }
            >
              All Requests
            </NavLink>
          </nav>
        </div>

        {/* Right Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <div
              style={{ cursor: "pointer" }}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span style={{ fontSize: "22px" }}>🔔</span>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div>

            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  top: "45px",
                  right: 0,
                  backgroundColor: "white",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  width: "320px",
                  zIndex: 1000,
                  overflow: "auto",
                }}
              >
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #e5e5e5",
                    fontWeight: 700,
                    color: "#333",
                    fontSize: "16px",
                  }}
                >
                  Notifications
                </div>
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {notifications.length === 0 && (
                    <p
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "#777",
                      }}
                    >
                      No notifications
                    </p>
                  )}

                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid #f0f0f0",
                        backgroundColor: notif.isRead ? "white" : "#fff5f5",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 6px 0",
                          color: "#333",
                          fontSize: "14px",
                          fontWeight: notif.isRead ? 400 : 600,
                        }}
                      >
                        {notif.message}
                      </p>

                      <div style={{ display: "flex", gap: "10px" }}>
                        {!notif.isRead && (
                          <button
                            style={{
                              background: "none",
                              color: "#8B2635",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                            onClick={() => markRead(notif.id)}
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          style={{
                            background: "none",
                            color: "red",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                          onClick={() => removeNotification(notif.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="user-avatar">{userInitials}</div>
          <span style={{ fontWeight: "600", fontSize: "15px" }}>
            {studentName}
          </span>

          {/* Logout */}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Overlay to close notifications */}
      {showNotifications && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setShowNotifications(false)}
        />
      )}
    </>
  );
};

export default Header;
