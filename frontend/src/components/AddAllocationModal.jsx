import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../services/api';

export default function AddAllocationModal({ isOpen, onClose, onSuccess, preselectedEquipmentId, equipmentList = [] }) {
  const [equipmentId, setEquipmentId] = useState(preselectedEquipmentId || '');
  const [allocatedToName, setAllocatedToName] = useState('');
  const [allocatedToRole, setAllocatedToRole] = useState('Student (CSE)');
  const [department, setDepartment] = useState('CSE');
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedEquipmentId) {
      setEquipmentId(preselectedEquipmentId);
    } else if (equipmentList.length > 0 && !equipmentId) {
      const availableEq = equipmentList.find(e => e.status === 'Available');
      if (availableEq) setEquipmentId(availableEq.equipment_id);
    }
    // Default to-date: 14 days from now
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setToDate(d.toISOString().split('T')[0]);
  }, [preselectedEquipmentId, equipmentList]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!equipmentId || !allocatedToName || !fromDate || !toDate) {
      setError('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.createAllocation({
        equipment_id: parseInt(equipmentId, 10),
        allocated_to_name: allocatedToName,
        allocated_to_role: allocatedToRole,
        department,
        from_date: fromDate,
        to_date: toDate,
        purpose
      });
      setSubmitting(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to allocate equipment');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">Allocate Equipment</h3>
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
                    {eq.equipment_code} - {eq.name} ({eq.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Allocated To (Student / Faculty Name) <span className="req">*</span></label>
              <input
                type="text"
                className="form-input"
                value={allocatedToName}
                onChange={(e) => setAllocatedToName(e.target.value)}
                placeholder="e.g. SHAIK IRFAN / Dr. Ramesh Kumar"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Role Category</label>
                <select
                  className="form-select"
                  value={allocatedToRole}
                  onChange={(e) => setAllocatedToRole(e.target.value)}
                >
                  <option value="Student (CSE)">Student (CSE)</option>
                  <option value="Student (ECE)">Student (ECE)</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Research Scholar">Research Scholar</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="IT">IT</option>
                  <option value="MECH">MECH</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">From Date <span className="req">*</span></label>
                <input
                  type="date"
                  className="form-input"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">To Date <span className="req">*</span></label>
                <input
                  type="date"
                  className="form-input"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Purpose / Project Description</label>
              <textarea
                className="form-textarea"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Final Year Capstone Project evaluation"
                rows={2}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Allocating...' : 'Allocate Equipment'}
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
