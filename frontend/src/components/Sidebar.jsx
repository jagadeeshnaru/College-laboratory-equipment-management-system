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
  FlaskConical,
  ShieldCheck,
  GraduationCap,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Navigation items tailored for Admin vs Faculty
const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'equipment', label: 'Equipment Catalog', icon: Server },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'laboratories', label: 'Laboratories', icon: Building2 },
  { id: 'allocations', label: 'Allocations', icon: CalendarCheck },
  { id: 'maintenance', label: 'Maintenance Logs', icon: Wrench },
  { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
  { id: 'users', label: 'Faculty & Admins', icon: Users }
];

const FACULTY_NAV_ITEMS = [
  { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { id: 'equipment', label: 'Equipment Inventory', icon: Server },
  { id: 'laboratories', label: 'Campus Labs', icon: Building2 },
  { id: 'allocations', label: 'My Allocations', icon: CalendarCheck },
  { id: 'maintenance', label: 'Maintenance Requests', icon: Wrench }
];

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : FACULTY_NAV_ITEMS;

  const handleItemClick = (id) => {
    setActiveTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-mobile-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <FlaskConical size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ lineHeight: 1.1 }}>Lab EMS</div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
              {isAdmin ? 'Admin Console' : 'Faculty Portal'}
            </span>
          </div>

          {onClose && (
            <button className="sidebar-mobile-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* User Identity Pill in Sidebar */}
        <div className="sidebar-user-card">
          <div className={`sidebar-role-badge ${isAdmin ? 'admin' : 'faculty'}`}>
            {isAdmin ? <ShieldCheck size={14} /> : <GraduationCap size={14} />}
            <span>{isAdmin ? 'System Administrator' : 'Faculty Member'}</span>
          </div>
          <div className="sidebar-user-name">{user?.full_name || (isAdmin ? 'Administrator' : 'Faculty Member')}</div>
          <div className="sidebar-user-dept">{user?.department || 'Computer Science'}</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => handleItemClick(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div>College Lab EMS v2.0</div>
          <div style={{ color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>
            {isAdmin ? '🛡️ Administrator Mode' : '🎓 Faculty Mode'}
          </div>
        </div>
      </aside>
    </>
  );
}
