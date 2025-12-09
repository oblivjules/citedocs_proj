import React from "react";

const ActivityPanel = ({ activities }) => (
  <aside className="activity-panel">
    <h3>Recent Activity</h3>
    {activities.map((a) => (
      <div className="activity-item" key={a.id}>
        <div className="activity-dot"></div>
        <div className="activity-content">
          <p className="activity-title">{a.title || "Request Status Changed"}</p>
          <p className="activity-description">{a.description || a.action || ""}</p>
          <small className="activity-time">{a.time}</small>
        </div>
      </div>
    ))}
  </aside>
);

export default ActivityPanel;