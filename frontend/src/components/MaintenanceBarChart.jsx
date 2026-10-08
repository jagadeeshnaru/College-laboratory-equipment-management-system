import React from 'react';

export default function MaintenanceBarChart({ stats }) {
  const data = [
    { label: 'Available', count: stats?.available ?? 7, color: '#10b981' },
    { label: 'In Use', count: stats?.in_use ?? 3, color: '#3b82f6' },
    { label: 'Under Maint.', count: stats?.under_maintenance ?? 1, color: '#f59e0b' },
    { label: 'Damaged', count: stats?.damaged ?? 1, color: '#ef4444' }
  ];

  const maxVal = Math.max(...data.map(d => d.count), 10);
  const maxBarHeight = 120; // in px

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
          Equipment Status Breakdown
        </h3>
        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
          Operational health distribution across all labs
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: '190px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
          {/* Y-Axis Reference Guide */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: `${maxBarHeight}px`, fontSize: '0.72rem', color: '#94a3b8', textAlign: 'right', paddingRight: '8px', borderRight: '1px solid #f1f5f9', minWidth: '24px' }}>
            <span>{maxVal}</span>
            <span>{Math.round(maxVal / 2)}</span>
            <span>0</span>
          </div>

          {/* Bar Columns */}
          <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around', alignItems: 'flex-end', height: `${maxBarHeight}px` }}>
            {data.map((item, idx) => {
              const barHeight = Math.max(12, Math.round((item.count / maxVal) * maxBarHeight));
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    height: '100%',
                    flex: 1,
                    maxWidth: '60px'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: item.color, marginBottom: '6px' }}>
                    {item.count}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${barHeight}px`,
                      backgroundColor: item.color,
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.35s ease',
                      boxShadow: `0 2px 6px ${item.color}33`
                    }}
                    title={`${item.label}: ${item.count} devices`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* X-Axis Labels Row (Placed directly below bars in normal flow, NOT absolute) */}
        <div style={{ display: 'flex', paddingLeft: '40px', justifyContent: 'space-around', paddingTop: '8px' }}>
          {data.map((item, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                maxWidth: '75px',
                textAlign: 'center',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#475569',
                lineHeight: 1.2
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
