import React, { useState, useEffect } from "react";

const ActivityPanel = ({ activities = [] }) => {
  const [filteredActivities, setFilteredActivities] = useState(activities);

  // Filter activities based on localStorage
  useEffect(() => {
    const clearedKey = "adminActivityClearedAt:global";
    const clearedAt = localStorage.getItem(clearedKey);
    if (!clearedAt) {
      setFilteredActivities(activities);
      return;
    }

    const threshold = Date.parse(clearedAt);
    const filtered = activities.filter((activity) => {
      if (!activity.changedAt) return true;
      const activityTime = Date.parse(activity.changedAt);
      return !isNaN(activityTime) && activityTime > threshold;
    });
    setFilteredActivities(filtered);
  }, [activities]);

  return (
    <>
      <section className="activity-section">
        <div className="activity-top">
          <h2>Recent Staff Activity</h2>
        </div>
        <div className="activity-list">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <div
                className="activity-item"
                key={activity.id}
                data-changed-at={activity.changedAt || activity.time}
              >
                <div className="activity-status">
                  <img
                    src="/images/check.png"
                    alt="Activity Icon"
                    className="activity-icon"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <div className="activity-content">
                  <p className="activity-title">
                    {activity.title ||
                      activity.action ||
                      "Request Status Changed"}
                  </p>
                  <p className="activity-description">
                    {activity.description || activity.action || ""}
                  </p>
                  <p className="activity-time">
                    {activity.time ||
                      (activity.changedAt
                        ? new Date(activity.changedAt).toLocaleString()
                        : "Recently")}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-activity">No recent actions</p>
          )}
        </div>
      </section>
    </>
  );
};

export default ActivityPanel;
