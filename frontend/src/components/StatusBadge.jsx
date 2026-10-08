import React from 'react';

export default function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase().replace(/\s+/g, '-');
  
  let label = status;
  let badgeClass = 'badge';

  switch (normalized) {
    case 'available':
      badgeClass += ' available';
      break;
    case 'in-use':
    case 'in use':
      badgeClass += ' in-use';
      break;
    case 'under-maintenance':
    case 'under maintenance':
      badgeClass += ' under-maintenance';
      break;
    case 'damaged':
      badgeClass += ' damaged';
      break;
    case 'resolved':
      badgeClass += ' resolved';
      break;
    case 'in-progress':
    case 'in progress':
      badgeClass += ' in-progress';
      break;
    case 'active':
      badgeClass += ' active';
      break;
    case 'completed':
      badgeClass += ' completed';
      break;
    default:
      badgeClass += ' completed';
      break;
  }

  return <span className={badgeClass}>{label}</span>;
}
