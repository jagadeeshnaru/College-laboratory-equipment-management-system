import React from 'react';

export default function StatsCard({ title, value, color = 'blue', icon: Icon }) {
  return (
    <div className={`stat-card ${color}`}>
      <div>
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
      {Icon && (
        <div className="stat-icon-wrap">
          <Icon size={24} color="#ffffff" />
        </div>
      )}
    </div>
  );
}
