import React, { useState, useEffect } from 'react';
import { X, Wrench, AlertTriangle, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AddMaintenanceModal({ isOpen, onClose, onSuccess, equipmentList = [] }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [equipmentId, setEquipmentId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [reportedBy, setReportedBy] = useState('Lab In-Charge');
  const [cost, setCost] = useState('0.00');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (equipmentList.length > 0 && !equipmentId) {
      setEquipmentId(equipmentList[0].equipment_id);
    }
    if (!isAdmin && user) {
      setReportedBy(user.full_name || 'Faculty Member');
    }
  }, [equipmentList, user, isAdmin]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!equipmentId || !issueDescription.trim()) {
      setError('Please select equipment and provide issue description');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.reportDamage({
        equipment_id: parseInt(equipmentId, 10),
        issue_description: issueDescription,
        priority,
        reported_by: isAdmin ? reportedBy : (user?.full_name || 'Faculty Member'),
        cost: isAdmin ? (parseFloat(cost) || 0.0) : 0.0,
        notes
      });
      setSubmitting(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add maintenance record');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={18} color="#2563eb" />
            <h3 className="modal-title">
              {isAdmin ? 'Add Maintenance Record' : 'Report Equipment Maintenance Issue'}
            </h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '14px' }}>
                {error}
              </div>
            )}

            {!isAdmin && (
              <div style={{ padding: '10px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '0.85rem', color: '#1e40af', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={16} />
                <span>
                  Reporting by: <strong>{user?.full_name}</strong> ({user?.department})
                </span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Equipment <span className="req">*</span></label>
              <select
                className="form-select"
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                required
              >
                <option value="">Select equipment...</option>
                {equipmentList.map((eq) => (
                  <option key={eq.equipment_id} value={eq.equipment_id}>
                    {eq.equipment_code} - {eq.name} ({eq.lab_name || 'Lab'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Issue Description <span className="req">*</span></label>
              <textarea
                className="form-textarea"
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="e.g. Screen flickering, network port 8 intermittent, power supply fan loud..."
                rows={2}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {isAdmin && (
                <div className="form-group">
                  <label className="form-label">Reported By</label>
                  <input
                    type="text"
                    className="form-input"
                    value={reportedBy}
                    onChange={(e) => setReportedBy(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Kumar"
                  />
                </div>
              )}
            </div>

            {isAdmin && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Estimated / Actual Repair Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Technician Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Sent for OEM part replacement"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isAdmin ? 'Save Maintenance Record' : 'Submit Issue Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
