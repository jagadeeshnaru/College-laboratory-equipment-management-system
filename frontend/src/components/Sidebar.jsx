import React from 'react';
import {
  LayoutDashboard,
  Server,
  FolderTree,
  Building2,
  CalendarCheck,
  Wrench,
  BarChart3,
  Users,
  FlaskConical
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'equipment', label: 'Equipment', icon: Server },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'laboratories', label: 'Laboratories', icon: Building2 },
  { id: 'allocations', label: 'Allocations', icon: CalendarCheck },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users }
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <FlaskConical size={22} />
        </div>
        <span>Lab EMS</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem', color: '#64748b' }}>
        <div>Project-9 (Group 7)</div>
        <div style={{ color: '#94a3b8', fontWeight: 600 }}>Lab EMS v1.0</div>
      </div>
    </aside>
  );
}
