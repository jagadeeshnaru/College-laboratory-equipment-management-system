import React from 'react';

const CATEGORY_COLORS = [
  '#3b82f6', // Computer - Blue
  '#10b981', // Networking - Green
  '#22c55e', // Electronics - Lime/Green
  '#8b5cf6', // Software - Purple
  '#f59e0b', // Others - Amber
  '#ec4899', // Pink fallback
];

export default function CategoryChart({ data = [] }) {
  // Normalize items
  const items = data.length > 0 ? data : [
    { category: 'Computers', count: 40 },
    { category: 'Networking', count: 20 },
    { category: 'Electronics', count: 28 },
    { category: 'Software', count: 12 },
    { category: 'Others', count: 8 }
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
    const radius = 70;
    const innerRadius = 38;
    const cx = 90;
    const cy = 90;

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
    <div className="card" style={{ height: '100%' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>
        Equipment by Category
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '20px' }}>
        <div style={{ position: 'relative', width: '180px', height: '180px' }}>
          <svg viewBox="0 0 180 180" width="100%" height="100%">
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
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {slices.map((slice, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: slice.color,
                  display: 'inline-block'
                }}
              />
              <span style={{ color: '#475569', fontWeight: 500 }}>{slice.name}:</span>
              <strong style={{ color: '#0f172a' }}>{slice.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
