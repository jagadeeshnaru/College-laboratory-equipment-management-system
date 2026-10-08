import React, { useState } from 'react';
import { User, Lock, FlaskConical, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onLoginSuccess }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState('Admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password, role);
      setLoading(false);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'Admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (selectedRole === 'Faculty') {
      setUsername('faculty1');
      setPassword('faculty123');
    } else {
      setUsername('24691A05J1');
      setPassword('student123');
    }
  };

  return (
    <div
      className="login-page-bg"
      style={{
        backgroundImage: `linear-gradient(rgba(11, 23, 54, 0.82), rgba(15, 31, 75, 0.88)), url('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="login-card">
        <div className="login-icon-badge">
          <FlaskConical size={34} />
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '24px', lineHeight: 1.35 }}>
          College Laboratory<br />Equipment Management System
        </h2>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <div className="search-input-wrap">
              <User className="search-icon" size={18} />
              <input
                type="text"
                className="form-input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <div className="search-input-wrap">
              <Lock className="search-icon" size={18} />
              <input
                type="password"
                className="form-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 600, marginTop: '4px' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="login-role-selector">
            <span style={{ fontWeight: 600, color: '#334155' }}>Role:</span>
            {['Admin', 'Student', 'Faculty'].map((r) => (
              <label key={r} className="role-radio-label">
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={() => handleRoleChange(r)}
                />
                <span>{r}</span>
              </label>
            ))}
          </div>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', fontSize: '0.78rem', color: '#64748b' }}>
          <strong>Project - 9 Team:</strong> IRFAN, JAGADEESH E., JAGADEESH N., JAHNAVI BA., JAHNAVI BA., JAHNAVI K., BHARATH REDDY
        </div>
      </div>
    </div>
  );
}
