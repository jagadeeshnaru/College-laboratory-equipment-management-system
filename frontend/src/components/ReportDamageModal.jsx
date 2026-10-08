import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../services/api';

export default function ReportDamageModal({ isOpen, onClose, onSuccess, preselectedEquipmentId, equipmentList = [] }) {
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
        reported_by: 'Lab Staff / User'
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
          <h3 className="modal-title">Report Damage</h3>
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

            <div className="form-group">
              <label className="form-label">Equipment</label>
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
              <label className="form-label">Issue Description</label>
              <textarea
                className="form-textarea"
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Describe the issue or defect in detail..."
                rows={3}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
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
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
