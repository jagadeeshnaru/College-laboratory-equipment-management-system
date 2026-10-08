import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  GraduationCap,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ title, onLogoutClick, onToggleSidebar }) {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = user?.role === 'Admin';

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {onToggleSidebar && (
          <button
            className="mobile-menu-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="top-navbar-title">{title}</div>
      </div>

      <div className="top-navbar-actions">
        {/* Active Role Indicator Pill */}
        <div className={`nav-role-pill ${isAdmin ? 'admin-pill' : 'faculty-pill'}`}>
          {isAdmin ? <ShieldCheck size={14} /> : <GraduationCap size={14} />}
          <span>{user?.role || 'Admin'}</span>
        </div>

        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div
            className="user-badge"
            onClick={() => setShowDropdown(!showDropdown)}
            title="User Profile & Logout"
          >
            <div className={`user-avatar ${isAdmin ? 'admin-avatar' : 'faculty-avatar'}`}>
              {isAdmin ? <ShieldCheck size={15} /> : <GraduationCap size={15} />}
            </div>
            <div className="user-text-info">
              <span className="user-name-display">{user?.full_name || (isAdmin ? 'Administrator' : 'Faculty Member')}</span>
            </div>
            <ChevronDown size={14} color="#64748b" />
          </div>

          {showDropdown && (
            <div className="navbar-dropdown-menu">
              <div className="dropdown-user-header">
                <div className="dropdown-name">{user?.full_name || 'Administrator'}</div>
                <div className="dropdown-email">{user?.email || 'admin@college.edu'}</div>
                <div className="dropdown-dept">
                  {user?.department || 'Computer Science'} &bull; {user?.role || 'Admin'}
                </div>
              </div>

              <div className="dropdown-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    if (onLogoutClick) onLogoutClick();
                  }}
                  className="dropdown-logout-btn"
                >
                  <LogOut size={15} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
