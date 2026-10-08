import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Monitor,
  CheckCircle,
  CalendarCheck,
  Wrench,
  AlertTriangle,
  Plus,
  ArrowRight,
  RotateCcw,
  Search,
  Building2,
  Clock,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import AddAllocationModal from './AddAllocationModal';
import ReportDamageModal from './ReportDamageModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function FacultyDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [equipmentList, setEquipmentList] = useState([]);
  const [myAllocations, setMyAllocations] = useState([]);
  const [myMaintenance, setMyMaintenance] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedEquipmentForReport, setSelectedEquipmentForReport] = useState(null);

  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      const [eqRes, allocRes, maintRes, labRes] = await Promise.all([
        api.getEquipmentList().catch(() => null),
        api.getAllocations().catch(() => null),
        api.getMaintenanceRecords().catch(() => null),
        api.getLaboratories().catch(() => null)
      ]);

      const allEq = eqRes?.data || [];
      const allAlloc = allocRes?.data || [];
      const allMaint = maintRes?.data || [];
      const allLabs = labRes?.data || [];

      setEquipmentList(allEq);
      setLaboratories(allLabs);

      // Filter allocations relevant to this faculty
      const facultyName = user?.full_name?.toLowerCase() || '';
      const facultyDept = user?.department?.toLowerCase() || '';

      const userAllocations = allAlloc.filter(
        (a) =>
          a.allocated_to_name?.toLowerCase().includes(facultyName) ||
          a.allocated_to_name?.toLowerCase().includes('faculty') ||
          (facultyDept && a.department?.toLowerCase().includes(facultyDept))
      );
      setMyAllocations(userAllocations.length > 0 ? userAllocations : allAlloc.slice(0, 4));

      // Filter maintenance tickets reported by or relevant to faculty
      const userMaint = allMaint.filter(
        (m) =>
          m.reported_by?.toLowerCase().includes(facultyName) ||
          m.reported_by?.toLowerCase().includes('prof') ||
          m.reported_by?.toLowerCase().includes('dr.')
      );
      setMyMaintenance(userMaint.length > 0 ? userMaint : allMaint.slice(0, 4));
    } catch (err) {
      console.error('Failed to load faculty dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyData();
  }, [user]);

  const handleReturn = async (allocationId) => {
    try {
      await api.returnAllocation(allocationId);
      fetchFacultyData();
    } catch (err) {
      alert('Error returning equipment: ' + err.message);
    }
  };

  const handleOpenReportModal = (equipment) => {
    setSelectedEquipmentForReport(equipment);
    setIsReportModalOpen(true);
  };

  // Filter equipment for quick browser
  const filteredEquipment = equipmentList.filter((eq) => {
    const matchesSearch =
      eq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.equipment_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.lab_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const availableCount = equipmentList.filter((e) => e.status === 'Available').length;
  const inUseCount = equipmentList.filter((e) => e.status === 'In Use').length;
  const underMaintCount = equipmentList.filter((e) => e.status === 'Under Maintenance' || e.status === 'Damaged').length;

  return (
    <div className="faculty-dashboard-root">
      {/* Faculty Welcome Banner */}
      <div className="dashboard-welcome-banner faculty-banner">
        <div className="banner-left">
          <div className="banner-icon faculty-icon">
            <GraduationCap size={32} />
          </div>
          <div>
            <div className="banner-badge faculty-badge">Faculty Academic Portal</div>
            <h2>Welcome back, {user?.full_name || 'Faculty Member'}!</h2>
            <p>
              Department of <strong>{user?.department || 'Computer Science & Engineering'}</strong> &bull;{' '}
              {user?.email || 'faculty@college.edu'}
            </p>
          </div>
        </div>
        <div className="banner-actions">
          <button
            className="btn btn-primary"
            onClick={() => setIsAllocModalOpen(true)}
            style={{ background: '#10b981', borderColor: '#10b981', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)' }}
          >
            <Plus size={16} />
            <span>Request / Allocate Equipment</span>
          </button>
        </div>
      </div>

      {/* Faculty KPI Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card green">
          <div>
            <div className="stat-label">Available for Practicals</div>
            <div className="stat-value">{availableCount}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '4px' }}>Ready for immediate allocation</div>
          </div>
          <div className="stat-icon-wrap">
            <CheckCircle size={28} />
          </div>
        </div>

        <div className="stat-card blue">
          <div>
            <div className="stat-label">My Active Allocations</div>
            <div className="stat-value">{myAllocations.filter((a) => a.status === 'Active').length}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '4px' }}>Currently issued in my name</div>
          </div>
          <div className="stat-icon-wrap">
            <CalendarCheck size={28} />
          </div>
        </div>

        <div className="stat-card orange">
          <div>
            <div className="stat-label">Department Laboratories</div>
            <div className="stat-value">{laboratories.length || 5}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '4px' }}>Equipped active lab rooms</div>
          </div>
          <div className="stat-icon-wrap">
            <Building2 size={28} />
          </div>
        </div>

        <div className="stat-card red">
          <div>
            <div className="stat-label">Reported Maintenance</div>
            <div className="stat-value">{myMaintenance.filter((m) => m.status !== 'Resolved').length}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '4px' }}>Open repairs under review</div>
          </div>
          <div className="stat-icon-wrap">
            <Wrench size={28} />
          </div>
        </div>
      </div>

      {/* Faculty Quick Action Shortcuts */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#059669" />
          <span>Faculty Quick Actions</span>
        </h3>

        <div className="faculty-actions-bar">
          <button className="faculty-action-btn primary-green" onClick={() => setIsAllocModalOpen(true)}>
            <CalendarCheck size={18} />
            <span>Issue / Reserve Equipment</span>
          </button>
          <button className="faculty-action-btn primary-amber" onClick={() => handleOpenReportModal(null)}>
            <AlertTriangle size={18} />
            <span>Report Equipment Damage</span>
          </button>
          <button className="faculty-action-btn secondary-btn" onClick={() => onNavigate?.('equipment')}>
            <Monitor size={18} />
            <span>Browse Full Catalog</span>
          </button>
          <button className="faculty-action-btn secondary-btn" onClick={() => onNavigate?.('laboratories')}>
            <Building2 size={18} />
            <span>View Lab Locations</span>
          </button>
        </div>
      </div>

      {/* Grid: My Allocations & Maintenance Tickets */}
      <div className="dashboard-tables-grid" style={{ marginBottom: '24px' }}>
        {/* My Allocations */}
        <div className="table-container">
          <div className="table-header-bar">
            <div>
              <div className="table-title">My Equipment Allocations</div>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Apparatus currently allocated to you</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate?.('allocations')}>
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Equipment</th>
                <th>Return By</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {myAllocations.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No active allocations. Click 'Request Equipment' to reserve apparatus.
                  </td>
                </tr>
              ) : (
                myAllocations.map((a) => (
                  <tr key={a.allocation_id}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{a.allocation_code}</td>
                    <td style={{ fontWeight: 600 }}>{a.equipment_name}</td>
                    <td>{a.to_date}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td style={{ textAlign: 'center' }}>
                      {a.status === 'Active' ? (
                        <button
                          className="btn btn-sm btn-secondary"
                          style={{ color: '#059669', borderColor: '#a7f3d0' }}
                          onClick={() => handleReturn(a.allocation_id)}
                          title="Return this equipment"
                        >
                          <RotateCcw size={12} /> Return
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Maintenance / Damage Reports */}
        <div className="table-container">
          <div className="table-header-bar">
            <div>
              <div className="table-title">Reported Issues & Repairs</div>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Track status of your lab repair requests</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate?.('maintenance')}>
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Equipment</th>
                <th>Issue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myMaintenance.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No issues reported. All department equipment in good working order.
                  </td>
                </tr>
              ) : (
                myMaintenance.map((m) => (
                  <tr key={m.maintenance_id}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{m.maintenance_code}</td>
                    <td style={{ fontWeight: 600 }}>{m.equipment_name}</td>
                    <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.issue_description}
                    </td>
                    <td><StatusBadge status={m.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Laboratory Apparatus Availability Lookup */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Laboratory Equipment Live Directory
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Check apparatus availability across campus laboratories for class demonstrations and projects
            </p>
          </div>

          <div className="search-input-wrap" style={{ maxWidth: '320px' }}>
            <Search className="search-icon" size={16} />
            <input
              type="text"
              className="form-input"
              placeholder="Search equipment, lab, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Equipment Name</th>
                <th>Laboratory</th>
                <th>Category</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Quick Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipment.slice(0, 6).map((eq) => (
                <tr key={eq.equipment_id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{eq.equipment_code}</td>
                  <td style={{ fontWeight: 600 }}>{eq.name}</td>
                  <td>{eq.lab_name || 'Main Lab'}</td>
                  <td>{eq.category_name || 'General'}</td>
                  <td><StatusBadge status={eq.status} /></td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      {eq.status === 'Available' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => {
                            setIsAllocModalOpen(true);
                          }}
                        >
                          Request
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleOpenReportModal(eq)}
                        title="Report damage or malfunction"
                      >
                        <Wrench size={12} /> Report Issue
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Allocation Modal */}
      <AddAllocationModal
        isOpen={isAllocModalOpen}
        onClose={() => setIsAllocModalOpen(false)}
        onSuccess={fetchFacultyData}
        equipmentList={equipmentList}
      />

      {/* Report Damage Modal */}
      <ReportDamageModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedEquipmentForReport(null);
        }}
        onSuccess={fetchFacultyData}
        equipment={selectedEquipmentForReport}
        equipmentList={equipmentList}
      />
    </div>
  );
}
