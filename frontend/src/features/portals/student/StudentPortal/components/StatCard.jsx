import React from "react";

const StatCard = (props) => {
  const { title, subtitle, value, icon, variant } = props;

  // Fallback: only apply "stat-default" if variant is truly undefined
  const cardClass = variant ? `stat-card stat-${variant}` : "stat-card stat-default";

  return (
    <div className={cardClass}>
      <div className="stat-card-layout">
        <div className="stat-icon-box">{icon || "📄"}</div>
        <div className="stat-content">
          <h3 className="stat-title">{title}</h3>
          <p className="stat-subtitle">{subtitle}</p>
        </div>
        {value && <div className="stat-number">{value}</div>}
      </div>
    </div>
  );
};

export default StatCard;
