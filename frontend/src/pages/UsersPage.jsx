import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  ShieldCheck,
  UserPlus,
  Trash2,
  Search,
  Building2,
  Mail,
  CheckCircle,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Faculty');
  const [newDepartment, setNewDepartment] = useState('Computer Science');
  const [newPassword, setNewPassword] = useState('faculty123');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getUsers(selectedRoleFilter === 'all' ? '' : selectedRoleFilter);
      if (res?.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [selectedRoleFilter]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUsername || !newFullName || !newEmail) {
      setErrorMsg('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          full_name: newFullName,
          email: newEmail,
          role: newRole,
          department: newDepartment,
          password: newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      setSubmitting(false);
      setIsAddModalOpen(false);
      // Reset fields
      setNewUsername('');
      setNewFullName('');
      setNewEmail('');
      loadUsers();
    } catch (err) {
      setErrorMsg(err.message);
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id, username) => {
    if (username === 'admin') {
      alert('Primary admin account cannot be deleted');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove user "${username}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }
      loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  // Filter users by search
  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q)
    );
  });

  const facultyCount = users.filter((u) => u.role === 'Faculty').length;
  const adminCount = users.filter((u) => u.role === 'Admin').length;

  return (
    <div>
      {/* Overview Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card blue">
          <div>
            <div className="stat-label">Total System Users</div>
            <div className="stat-value">{users.length}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '4px' }}>Faculty & Staff Accounts</div>
          </div>
          <div className="stat-icon-wrap">
            <Users size={28} />
          </div>
        </div>

        <div className="stat-card green">
          <div>
            <div className="stat-label">Faculty Members</div>
            <div className="stat-value">{facultyCount}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '4px' }}>Lab In-Charges & Professors</div>
          </div>
          <div className="stat-icon-wrap">
            <GraduationCap size={28} />
          </div>
        </div>

        <div className="stat-card orange">
          <div>
            <div className="stat-label">System Administrators</div>
            <div className="stat-value">{adminCount}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '4px' }}>Full Management Access</div>
          </div>
          <div className="stat-icon-wrap">
            <ShieldCheck size={28} />
          </div>
        </div>

        <div className="stat-card red" style={{ background: 'linear-gradient(135deg, #4f46e5, #3730a3)' }}>
          <div>
            <div className="stat-label">Departments Covered</div>
            <div className="stat-value">4</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '4px' }}>CSE, ECE, IT, Admin</div>
          </div>
          <div className="stat-icon-wrap">
            <Building2 size={28} />
          </div>
        </div>
      </div>

      {/* Header & Actions Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              Faculty & Admin Management
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Maintain authorized personnel credentials and departmental laboratory assignments
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-input-wrap" style={{ minWidth: '220px' }}>
              <Search className="search-icon" size={16} />
              <input
                type="text"
                className="form-input"
                placeholder="Search by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              style={{ width: '150px' }}
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Faculty">Faculty</option>
            </select>

            <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
              <UserPlus size={16} />
              <span>Add Faculty / Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Registered On</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  Loading faculty & admin roster...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No users found matching current filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.user_id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{u.username}</td>
                  <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: u.role === 'Admin' ? '#dbeafe' : '#d1fae5',
                      color: u.role === 'Admin' ? '#1e40af' : '#065f46',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}>
                      {u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span>{u.full_name}</span>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'Admin' ? 'in-use' : 'available'}`}>
                      {u.role === 'Admin' ? <ShieldCheck size={12} style={{ marginRight: '4px' }} /> : <GraduationCap size={12} style={{ marginRight: '4px' }} />}
                      {u.role}
                    </span>
                  </td>
                  <td>{u.department}</td>
                  <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active'}</td>
                  <td style={{ textAlign: 'center' }}>
                    {u.username !== 'admin' && (
                      <button
                        className="btn btn-sm btn-secondary"
                        style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                        onClick={() => handleDeleteUser(u.user_id, u.username)}
                        title="Remove user account"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Add Faculty or Administrator</h3>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser}>
              <div className="modal-body">
                {errorMsg && (
                  <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '14px' }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Role <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={newRole}
                      onChange={(e) => {
                        setNewRole(e.target.value);
                        if (e.target.value === 'Admin') setNewPassword('admin123');
                        else setNewPassword('faculty123');
                      }}
                    >
                      <option value="Faculty">Faculty</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                    >
                      <option value="Computer Science">Computer Science (CSE)</option>
                      <option value="ECE">Electronics & Comm (ECE)</option>
                      <option value="Information Technology">Information Technology (IT)</option>
                      <option value="Administration">Administration</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Username / Staff ID <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. faculty5 or prof_kumar"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dr. Priya Sharma"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address <span className="req">*</span></label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. priya@college.edu"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Initial Password</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating Account...' : 'Create User Account'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
