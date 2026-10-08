import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function ReportDamageModal({ isOpen, onClose, onSuccess, preselectedEquipmentId, equipmentList = [] }) {
  const { user } = useAuth();
  const [equipmentId, setEquipmentId] = useState(preselectedEquipmentId || '');
  const [issueDescription, setIssueDescription] = useState('');
  const [priority, setPriority] = useState('High');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedEquipmentId) {
      setEquipmentId(preselectedEquipmentId);
    } else if (equipmentList.length > 0 && !equipmentId) {
      setEquipmentId(equipmentList[0].equipment_id);
    }
  }, [preselectedEquipmentId, equipmentList]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!equipmentId) {
      setError('Please select an equipment');
      return;
    }
    if (!issueDescription.trim()) {
      setError('Please provide an issue description');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.reportDamage({
        equipment_id: parseInt(equipmentId, 10),
        issue_description: issueDescription,
        priority,
        reported_by: user?.full_name || 'Faculty Member'
      });
      setSubmitting(false);
      setIssueDescription('');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit report');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#e11d48" />
            <h3 className="modal-title">Report Equipment Issue / Damage</h3>
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

            <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', color: '#475569', marginBottom: '16px' }}>
              Reporting As: <strong style={{ color: '#0f172a' }}>{user?.full_name || 'Faculty Member'}</strong> ({user?.department || 'Department'})
            </div>

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
                placeholder="Describe the issue, malfunction or hardware defect in detail..."
                rows={3}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Priority</label>
              <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      checked={priority === p}
                      onChange={(e) => setPriority(e.target.value)}
                    />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Incident Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
