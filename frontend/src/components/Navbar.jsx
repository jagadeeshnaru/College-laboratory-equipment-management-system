import React, { useState } from 'react';
import { User, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ title, onLogoutClick }) {
  const { user, switchRole } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="top-navbar">
      <div className="top-navbar-title">{title}</div>

      <div className="top-navbar-actions">
        <div style={{ position: 'relative' }}>
          <div
            className="user-badge"
            onClick={() => setShowDropdown(!showDropdown)}
            title="Click to switch role or logout"
          >
            <div className="user-avatar">
              <User size={16} />
            </div>
            <span>{user?.role || 'Admin'}</span>
            <ChevronDown size={14} color="#64748b" />
          </div>

          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '42px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                width: '200px',
                zIndex: 100,
                padding: '8px 0'
              }}
            >
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                  {user?.full_name || 'Administrator'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {user?.email || 'admin@college.edu'}
                </div>
              </div>

              <div style={{ padding: '6px 0' }}>
                <div style={{ padding: '4px 16px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Switch Role
                </div>
                {['Admin', 'Faculty', 'Student'].map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setShowDropdown(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '8px 16px',
                      background: 'none',
                      border: 'none',
                      fontSize: '0.85rem',
                      color: user?.role === r ? '#2563eb' : '#334155',
                      fontWeight: user?.role === r ? 600 : 400,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <ShieldCheck size={14} />
                    <span>{r}</span>
                  </button>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    if (onLogoutClick) onLogoutClick();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 16px',
                    background: 'none',
                    border: 'none',
                    fontSize: '0.85rem',
                    color: '#ef4444',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
