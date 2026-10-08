import React, { useState, useEffect } from 'react';
import {
  Monitor,
  CheckCircle,
  Rocket,
  Wrench,
  Building2,
  CalendarCheck,
  Users,
  AlertTriangle,
  Plus,
  ArrowRight,
  RefreshCw,
  Clock,
  ShieldCheck,
  TrendingUp,
  Sliders,
  DollarSign
} from 'lucide-react';
import StatsCard from './StatsCard';
import CategoryChart from './CategoryChart';
import MaintenanceBarChart from './MaintenanceBarChart';
import StatusBadge from './StatusBadge';
import { api } from '../services/api';

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    total_equipment: 12,
    available: 7,
    in_use: 3,
    under_maintenance: 1,
    damaged: 1
  });
  const [categoryData, setCategoryData] = useState([]);
  const [labData, setLabData] = useState([]);
  const [recentAllocations, setRecentAllocations] = useState([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState([]);
  const [facultyCount, setFacultyCount] = useState(4);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, catRes, labRes, allocRes, maintRes, usersRes] = await Promise.all([
        api.getEquipmentStats().catch(() => null),
        api.getReportsByCategory().catch(() => null),
        api.getReportsByLab().catch(() => null),
        api.getAllocations().catch(() => null),
        api.getMaintenanceRecords().catch(() => null),
        api.getUsers('Faculty').catch(() => null)
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (catRes?.data) setCategoryData(catRes.data);
      if (labRes?.data) setLabData(labRes.data);
      if (allocRes?.data) setRecentAllocations(allocRes.data.slice(0, 5));
      if (maintRes?.data) setMaintenanceTickets(maintRes.data.slice(0, 4));
      if (usersRes?.data) setFacultyCount(usersRes.data.length);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalCost = maintenanceTickets.reduce((acc, curr) => acc + (parseFloat(curr.cost) || 0), 0);

  return (
    <div className="admin-dashboard-root">
      {/* Header Banner */}
      <div className="dashboard-welcome-banner admin-banner">
        <div className="banner-left">
          <div className="banner-icon admin-icon">
            <ShieldCheck size={32} />
          </div>
          <div>
            <div className="banner-badge">System Administrator Portal</div>
            <h2>Central Laboratory Operations & Asset Management</h2>
            <p>
              Overview of all departmental laboratories, equipment lifecycles, faculty allocations, and maintenance queues.
            </p>
          </div>
        </div>
        <div className="banner-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchDashboardData}
            title="Refresh statistics"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)' }}
          >
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (4 Cards) */}
      <div className="stats-grid">
        <StatsCard
          title="Total Equipment"
          value={stats.total_equipment || 0}
          color="blue"
          icon={Monitor}
        />
        <StatsCard
          title="Available Apparatus"
          value={stats.available || 0}
          color="green"
          icon={CheckCircle}
        />
        <StatsCard
          title="Active Allocations"
          value={stats.in_use || 0}
          color="orange"
          icon={Rocket}
        />
        <StatsCard
          title="Under Maintenance / Damaged"
          value={(stats.under_maintenance || 0) + (stats.damaged || 0)}
          color="red"
          icon={Wrench}
        />
      </div>

      {/* Secondary Metrics Bar */}
      <div className="secondary-metrics-grid">
        <div className="mini-metric-card">
          <div className="mini-icon blue-bg">
            <Building2 size={18} />
          </div>
          <div className="mini-info">
            <span className="mini-label">Configured Labs</span>
            <span className="mini-value">{labData.length || 5} Labs</span>
          </div>
        </div>

        <div className="mini-metric-card">
          <div className="mini-icon purple-bg">
            <Users size={18} />
          </div>
          <div className="mini-info">
            <span className="mini-label">Active Faculty Members</span>
            <span className="mini-value">{facultyCount} Professors</span>
          </div>
        </div>

        <div className="mini-metric-card">
          <div className="mini-icon orange-bg">
            <CalendarCheck size={18} />
          </div>
          <div className="mini-info">
            <span className="mini-label">Total Allocations</span>
            <span className="mini-value">{recentAllocations.length} Active Records</span>
          </div>
        </div>

        <div className="mini-metric-card">
          <div className="mini-icon green-bg">
            <TrendingUp size={18} />
          </div>
          <div className="mini-info">
            <span className="mini-label">Equipment Health</span>
            <span className="mini-value">
              {stats.total_equipment > 0
                ? `${Math.round(((stats.available + stats.in_use) / stats.total_equipment) * 100)}% Operational`
                : '100% Operational'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="#2563eb" />
            <span>Administrator Quick Actions</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Shortcuts for rapid laboratory operations</span>
        </div>

        <div className="quick-action-grid">
          <button
            className="action-tile"
            onClick={() => onNavigate?.('add-equipment')}
          >
            <div className="action-tile-icon blue-tile">
              <Plus size={20} />
            </div>
            <div>
              <strong>Add New Equipment</strong>
              <span>Register new device or tool</span>
            </div>
          </button>

          <button
            className="action-tile"
            onClick={() => onNavigate?.('allocations')}
          >
            <div className="action-tile-icon green-tile">
              <CalendarCheck size={20} />
            </div>
            <div>
              <strong>Manage Allocations</strong>
              <span>Issue apparatus to faculty</span>
            </div>
          </button>

          <button
            className="action-tile"
            onClick={() => onNavigate?.('maintenance')}
          >
            <div className="action-tile-icon red-tile">
              <Wrench size={20} />
            </div>
            <div>
              <strong>Maintenance Queue</strong>
              <span>Review repairs & damage tickets</span>
            </div>
          </button>

          <button
            className="action-tile"
            onClick={() => onNavigate?.('laboratories')}
          >
            <div className="action-tile-icon purple-tile">
              <Building2 size={20} />
            </div>
            <div>
              <strong>Laboratories</strong>
              <span>Inspect rooms & in-charges</span>
            </div>
          </button>

          <button
            className="action-tile"
            onClick={() => onNavigate?.('users')}
          >
            <div className="action-tile-icon orange-tile">
              <Users size={20} />
            </div>
            <div>
              <strong>Faculty Roster</strong>
              <span>Manage faculty accounts</span>
            </div>
          </button>

          <button
            className="action-tile"
            onClick={() => onNavigate?.('reports')}
          >
            <div className="action-tile-icon cyan-tile">
              <TrendingUp size={20} />
            </div>
            <div>
              <strong>Analytics & Reports</strong>
              <span>Export departmental summaries</span>
            </div>
          </button>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="dashboard-charts-grid">
        <CategoryChart data={categoryData} />
        <MaintenanceBarChart stats={stats} />
      </div>

      {/* Dual Table Section: Recent Allocations & Maintenance Tickets */}
      <div className="dashboard-tables-grid">
        {/* Recent Allocations Table */}
        <div className="table-container">
          <div className="table-header-bar">
            <div className="table-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarCheck size={18} color="#2563eb" />
              <span>Recent Equipment Allocations</span>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate?.('allocations')}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Equipment</th>
                <th>Allocated To</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAllocations.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No recent allocations recorded.
                  </td>
                </tr>
              ) : (
                recentAllocations.map((a) => (
                  <tr key={a.allocation_id}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{a.allocation_code}</td>
                    <td style={{ fontWeight: 600 }}>{a.equipment_name}</td>
                    <td>{a.allocated_to_name}</td>
                    <td>{a.to_date}</td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Maintenance / Damage Alerts */}
        <div className="table-container">
          <div className="table-header-bar">
            <div className="table-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#ef4444" />
              <span>Maintenance & Repair Tickets</span>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate?.('maintenance')}
            >
              <span>Manage</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Equipment</th>
                <th>Issue</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceTickets.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No active maintenance tickets. All equipment healthy!
                  </td>
                </tr>
              ) : (
                maintenanceTickets.map((m) => (
                  <tr key={m.maintenance_id}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{m.maintenance_code}</td>
                    <td style={{ fontWeight: 600 }}>{m.equipment_name}</td>
                    <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.issue_description}
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        color: m.priority === 'Critical' || m.priority === 'High' ? '#dc2626' : '#d97706'
                      }}>
                        {m.priority}
                      </span>
                    </td>
                    <td><StatusBadge status={m.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
