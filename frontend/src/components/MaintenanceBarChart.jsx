import React from 'react';

export default function MaintenanceBarChart({ stats }) {
  const data = [
    { label: 'Working', count: stats?.available ?? 17, color: '#10b981' },
    { label: 'In Use', count: stats?.in_use ?? 12, color: '#3b82f6' },
    { label: 'Under Maintenance', count: stats?.under_maintenance ?? 5, color: '#f59e0b' },
    { label: 'Damaged', count: stats?.damaged ?? 4, color: '#ef4444' }
  ];

  const maxVal = Math.max(...data.map(d => d.count), 20);
  const chartHeight = 140;

  return (
    <div className="card" style={{ height: '100%' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>
        Maintenance Status
      </h3>
      <div style={{ display: 'flex', height: '180px', alignItems: 'flex-end', paddingBottom: '25px', gap: '24px' }}>
        {/* Y Axis labels */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: `${chartHeight}px`, fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right', paddingRight: '8px', borderRight: '1px solid #e2e8f0' }}>
          <span>20</span>
          <span>15</span>
          <span>10</span>
          <span>5</span>
          <span>0</span>
        </div>

        {/* Bars */}
        <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around', alignItems: 'flex-end', height: `${chartHeight}px` }}>
          {data.map((item, idx) => {
            const barHeight = Math.max(8, (item.count / maxVal) * chartHeight);
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '48px', position: 'relative' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.color, marginBottom: '4px' }}>
                  {item.count}
                </span>
                <div
                  style={{
                    width: '32px',
                    height: `${barHeight}px`,
                    backgroundColor: item.color,
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.4s ease'
                  }}
                  title={`${item.label}: ${item.count}`}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: `${chartHeight + 6}px`,
                    fontSize: '0.72rem',
                    color: '#64748b',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    width: '80px'
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
