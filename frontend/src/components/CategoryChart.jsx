import React from 'react';

const CATEGORY_COLORS = [
  '#3b82f6', // Computer - Blue
  '#10b981', // Networking - Green
  '#8b5cf6', // Electronics - Purple
  '#f59e0b', // Software - Amber
  '#06b6d4', // Others - Cyan
  '#ec4899', // Pink fallback
];

export default function CategoryChart({ data = [] }) {
  // Normalize items
  const items = data.length > 0 ? data : [
    { category: 'Computers', count: 4 },
    { category: 'Networking', count: 3 },
    { category: 'Electronics', count: 3 },
    { category: 'Software', count: 1 },
    { category: 'Others', count: 1 }
  ];

  const total = items.reduce((acc, item) => acc + (parseInt(item.count || item.total_equipment || 0, 10)), 0) || 1;

  // Compute SVG arc slices
  let cumulativeAngle = 0;
  const slices = items.map((item, index) => {
    const value = parseInt(item.count || item.total_equipment || 0, 10);
    const fraction = value / total;
    const angle = fraction * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

    // Convert polar to cartesian
    const radius = 68;
    const innerRadius = 38;
    const cx = 85;
    const cy = 85;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const x3 = cx + innerRadius * Math.cos(endRad);
    const y3 = cy + innerRadius * Math.sin(endRad);
    const x4 = cx + innerRadius * Math.cos(startRad);
    const y4 = cy + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;

    return {
      pathData,
      color,
      name: item.category || item.category_name,
      value
    };
  });

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
          Equipment by Category
        </h3>
        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
          Asset allocation categorized by apparatus type
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '16px', flexWrap: 'wrap', minHeight: '190px' }}>
        <div style={{ position: 'relative', width: '170px', height: '170px', flexShrink: 0 }}>
          <svg viewBox="0 0 170 170" width="100%" height="100%">
            {slices.map((slice, i) => (
              <path
                key={i}
                d={slice.pathData}
                fill={slice.color}
                stroke="#ffffff"
                strokeWidth="2"
                style={{ transition: 'opacity 0.2s', cursor: 'pointer' }}
              >
                <title>{`${slice.name}: ${slice.value} items (${Math.round((slice.value / total) * 100)}%)`}</title>
              </path>
            ))}
          </svg>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{total}</div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Total</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '130px' }}>
          {slices.map((slice, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: slice.color,
                  display: 'inline-block',
                  flexShrink: 0
                }}
              />
              <span style={{ color: '#475569', fontWeight: 500 }}>{slice.name}:</span>
              <strong style={{ color: '#0f172a', marginLeft: 'auto' }}>{slice.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
