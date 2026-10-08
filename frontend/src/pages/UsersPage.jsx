import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, ShieldCheck, UserPlus } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { api } from '../services/api';

const PROJECT_MEMBERS = [
  { sno: 1, roll: '24691A05J1', name: 'SHAIK IRFAN', role: 'Student', dept: 'CSE' },
  { sno: 2, roll: '24691A05J2', name: 'EDAGOTTI JAGADEESH', role: 'Student', dept: 'CSE' },
  { sno: 3, roll: '24691A05J3', name: 'NARU JAGADEESH', role: 'Student', dept: 'CSE' },
  { sno: 4, roll: '24691A05J4', name: 'BARAKI JAHNAVI', role: 'Student', dept: 'CSE' },
  { sno: 5, roll: '24691A05J5', name: 'BATHULA JAHNAVI', role: 'Student', dept: 'CSE' },
  { sno: 6, roll: '24691A05J6', name: 'KONDA JAHNAVI', role: 'Student', dept: 'CSE' },
  { sno: 7, roll: '24691A05J7', name: 'KOTHAPALLI BHARATH REDDY', role: 'Student', dept: 'CSE' },
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');

  useEffect(() => {
    async function loadUsers() {
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
    }
    loadUsers();
  }, [selectedRoleFilter]);

  return (
    <div>
      {/* Project Team Spotlight Card */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #0e1b38 0%, #1e3a8a 100%)', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px', borderRadius: '10px' }}>
            <GraduationCap size={26} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Project - 9: College Laboratory Equipment Management System</h3>
            <p style={{ fontSize: '0.85rem', color: '#93c5fd' }}>Student Development Team Roster</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {PROJECT_MEMBERS.map((m) => (
            <div
              key={m.roll}
              style={{
                background: 'rgba(255,255,255,0.08)',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.12)'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#bfdbfe', fontWeight: 600 }}>{m.roll}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{m.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Users Header & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>System Users & Roles</h3>
        <div>
          <select
            className="form-select"
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Faculty">Faculty</option>
            <option value="Student">Student</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID / Roll No</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Registered On</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Loading system users...</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.user_id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{u.username}</td>
                  <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'Admin' ? 'under-maintenance' : u.role === 'Faculty' ? 'in-use' : 'available'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.department}</td>
                  <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
