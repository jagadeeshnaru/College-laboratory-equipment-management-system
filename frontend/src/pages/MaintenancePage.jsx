import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, CheckCircle2, Wrench, Eye } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import AddMaintenanceModal from '../components/AddMaintenanceModal';
import { api } from '../services/api';

export default function MaintenancePage({ onSelectEquipment }) {
  const [records, setRecords] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
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
    try {
      await api.updateMaintenanceStatus(recordId, { status: newStatus });
      fetchData();
      setSelectedRecord(null);
    } catch (err) {
      alert('Failed to update maintenance status: ' + err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>Maintenance Records</h2>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>Add Record</span>
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Equipment</th>
              <th>Issue</th>
              <th>Reported Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  Loading maintenance logs...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No maintenance records found.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.maintenance_id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{r.maintenance_code}</td>
                  <td style={{ fontWeight: 600 }}>{r.equipment_name || 'Equipment'}</td>
                  <td>{r.issue_description}</td>
                  <td>{r.reported_date}</td>
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
                    <td style={{ fontWeight: 600, background: '#f8fafc' }}>Issue</td>
                    <td>{selectedRecord.issue_description}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, background: '#f8fafc' }}>Reported By</td>
                    <td>{selectedRecord.reported_by || 'Staff'} ({selectedRecord.reported_date})</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, background: '#f8fafc' }}>Priority</td>
                    <td><strong style={{ color: selectedRecord.priority === 'High' ? '#ef4444' : '#f59e0b' }}>{selectedRecord.priority}</strong></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, background: '#f8fafc' }}>Status</td>
                    <td><StatusBadge status={selectedRecord.status} /></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, background: '#f8fafc' }}>Repair Cost</td>
                    <td>₹{selectedRecord.cost || 0}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, background: '#f8fafc' }}>Notes</td>
                    <td>{selectedRecord.notes || 'No remarks added yet.'}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: '20px' }}>
                <label className="form-label">Update Status:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
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
