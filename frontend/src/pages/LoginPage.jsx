import React, { useState } from 'react';
import {
  ShieldCheck,
  GraduationCap,
  Lock,
  User,
  AlertCircle,
  FlaskConical,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onLoginSuccess }) {
  const { login } = useAuth();
  const [role, setRole] = useState('Admin'); // 'Admin' or 'Faculty'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setError('');
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);

    try {
      await login(username.trim(), password, role);
      setLoading(false);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Invalid login credentials. Please check your username and password.');
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-backdrop-overlay" />

      <div className="login-container">
        {/* Left Side: Info & Features Banner */}
        <div className="login-info-panel">
          <div className="login-brand">
            <div className="login-brand-icon">
              <FlaskConical size={28} />
            </div>
            <div>
              <h2>Lab EMS</h2>
              <span className="brand-subtitle">Laboratory Equipment Management</span>
            </div>
          </div>

          <div className="login-hero-text">
            <h3>Unified Campus Equipment & Asset Platform</h3>
            <p>
              Streamline laboratory allocations, track equipment health, manage maintenance schedules,
              and maintain full institutional inventory accountability.
            </p>
          </div>

          <div className="login-features-list">
            <div className="feature-item">
              <div className="feature-icon admin-feat">
                <ShieldCheck size={18} />
              </div>
              <div>
                <strong>Administrator Control Center</strong>
                <p>Full inventory management, lab setup, system audits, and equipment analytics</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon faculty-feat">
                <GraduationCap size={18} />
              </div>
              <div>
                <strong>Faculty Portal</strong>
                <p>Reserve lab apparatus, report maintenance issues, and manage classroom practicals</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon audit-feat">
                <BarChart3 size={18} />
              </div>
              <div>
                <strong>Real-Time Analytics</strong>
                <p>Instant availability tracking, damage assessment, and departmental breakdown</p>
              </div>
            </div>
          </div>

          <div className="login-footer-info">
            <span>College Laboratory Management Portal &bull; v2.0</span>
          </div>
        </div>

        {/* Right Side: Login Form Panel */}
        <div className="login-form-panel">
          <div className="login-form-card">
            <div className="form-header">
              <span className="welcome-tag">Secure Portal</span>
              <h2>Welcome to Lab EMS</h2>
              <p>Select your portal and sign in with your authorized credentials</p>
            </div>

            {/* Portal Tab Switcher */}
            <div className="portal-tabs">
              <button
                type="button"
                className={`portal-tab ${role === 'Admin' ? 'active admin' : ''}`}
                onClick={() => handleRoleSelect('Admin')}
              >
                <ShieldCheck size={18} />
                <span>Admin Login</span>
              </button>
              <button
                type="button"
                className={`portal-tab ${role === 'Faculty' ? 'active faculty' : ''}`}
                onClick={() => handleRoleSelect('Faculty')}
              >
                <GraduationCap size={18} />
                <span>Faculty Login</span>
              </button>
            </div>

            {error && (
              <div className="login-error-box">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">
                  {role === 'Admin' ? 'Administrator Username / Email' : 'Faculty Username / Staff ID'}
                </label>
                <div className="input-with-icon">
                  <User size={18} className="field-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder={role === 'Admin' ? 'Enter admin username' : 'Enter faculty username or email'}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Password</label>
                </div>
                <div className="input-with-icon">
                  <Lock size={18} className="field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="role-indicator-badge">
                <CheckCircle2 size={15} color={role === 'Admin' ? '#2563eb' : '#059669'} />
                <span>
                  Logging in as <strong>{role}</strong> ({role === 'Admin' ? 'Full System Administration' : 'Academic & Lab Operations'})
                </span>
              </div>

              <button
                type="submit"
                className={`login-submit-btn ${role === 'Admin' ? 'btn-admin' : 'btn-faculty'}`}
                disabled={loading}
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Log In to {role} Portal</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
