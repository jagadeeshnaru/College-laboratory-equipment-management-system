import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, CheckCircle2, Wrench, Eye, AlertTriangle, Search } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import AddMaintenanceModal from '../components/AddMaintenanceModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function MaintenancePage({ onSelectEquipment }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [records, setRecords] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [maintRes, eqRes] = await Promise.all([
        api.getMaintenanceRecords(),
        api.getEquipmentList()
      ]);
      if (maintRes?.data) setRecords(maintRes.data);
      if (eqRes?.data) setEquipmentList(eqRes.data);
    } catch (err) {
      console.error('Failed to fetch maintenance records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (recordId, newStatus) => {
    if (!isAdmin) return;
    try {
      await api.updateMaintenanceStatus(recordId, { status: newStatus });
      fetchData();
      setSelectedRecord(null);
    } catch (err) {
      alert('Failed to update maintenance status: ' + err.message);
    }
  };

  const filteredRecords = records.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      r.maintenance_code?.toLowerCase().includes(term) ||
      r.equipment_name?.toLowerCase().includes(term) ||
      r.issue_description?.toLowerCase().includes(term) ||
      r.reported_by?.toLowerCase().includes(term);

    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {isAdmin ? 'Maintenance & Damage Records' : 'Maintenance & Repair Requests'}
          </h2>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
            {isAdmin ? 'Manage repair tickets, service logs and technician resolutions' : 'Submit defect notices and track repair status for classroom and lab equipment'}
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>{isAdmin ? 'Add Record' : 'Report Issue'}</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: '20px' }}>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          <div className="search-input-wrap">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by ticket code, equipment or defect description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Equipment</th>
              <th>Issue Description</th>
              <th>Reported By</th>
              <th>Reported Date</th>
              <th>Priority</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  Loading maintenance logs...
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No maintenance records found.
                </td>
              </tr>
            ) : (
              filteredRecords.map((r) => (
                <tr key={r.maintenance_id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{r.maintenance_code}</td>
                  <td style={{ fontWeight: 600 }}>{r.equipment_name || 'Equipment'}</td>
                  <td>{r.issue_description}</td>
                  <td>{r.reported_by || 'Faculty'}</td>
                  <td>{r.reported_date}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: r.priority === 'High' ? '#dc2626' : r.priority === 'Medium' ? '#d97706' : '#16a34a' }}>
                      {r.priority}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedRecord(r)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Record Modal */}
      <AddMaintenanceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchData}
        equipmentList={equipmentList}
      />

      {/* View & Update Status Detail Modal */}
      {selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Maintenance Record {selectedRecord.maintenance_code}</h3>
              <button className="modal-close" onClick={() => setSelectedRecord(null)}>✕</button>
            </div>
            <div className="modal-body">
              <table className="data-table" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '140px', fontWeight: 600, background: '#f8fafc' }}>Equipment</td>
                    <td style={{ fontWeight: 600 }}>{selectedRecord.equipment_name} ({selectedRecord.equipment_code})</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, background: '#f8fafc' }}>Issue Description</td>
                    <td>{selectedRecord.issue_description}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, background: '#f8fafc' }}>Reported By</td>
                    <td>{selectedRecord.reported_by || 'Faculty'} ({selectedRecord.reported_date})</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, background: '#f8fafc' }}>Priority Level</td>
                    <td><strong style={{ color: selectedRecord.priority === 'High' ? '#ef4444' : '#f59e0b' }}>{selectedRecord.priority}</strong></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, background: '#f8fafc' }}>Current Status</td>
                    <td><StatusBadge status={selectedRecord.status} /></td>
                  </tr>
                  {isAdmin && (
                    <tr>
                      <td style={{ fontWeight: 600, background: '#f8fafc' }}>Repair Cost</td>
                      <td>₹{selectedRecord.cost || 0}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ fontWeight: 600, background: '#f8fafc' }}>Technician Remarks</td>
                    <td>{selectedRecord.notes || 'In queue for diagnostic check.'}</td>
                  </tr>
                </tbody>
              </table>

              {isAdmin && (
                <div style={{ marginTop: '20px' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Update Status (Admin Only):</label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    {['Under Maintenance', 'In Progress', 'Resolved'].map((st) => (
                      <button
                        key={st}
                        className={`btn btn-sm ${selectedRecord.status === st ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleUpdateStatus(selectedRecord.maintenance_id, st)}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedRecord(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
