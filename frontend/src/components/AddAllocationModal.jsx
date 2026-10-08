import React, { useState, useEffect } from 'react';
import { X, CalendarCheck, ShieldCheck, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AddAllocationModal({ isOpen, onClose, onSuccess, preselectedEquipmentId, equipmentList = [] }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [equipmentId, setEquipmentId] = useState(preselectedEquipmentId || '');
  const [allocatedToName, setAllocatedToName] = useState('');
  const [allocatedToRole, setAllocatedToRole] = useState('Faculty');
  const [department, setDepartment] = useState('Computer Science');
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

    if (!isAdmin && user) {
      setAllocatedToName(user.full_name || '');
      setDepartment(user.department || 'Computer Science');
      setAllocatedToRole('Faculty');
    }

    // Default to-date: 14 days from now
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setToDate(d.toISOString().split('T')[0]);
  }, [preselectedEquipmentId, equipmentList, user, isAdmin]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalName = isAdmin ? allocatedToName : (user?.full_name || allocatedToName);
    if (!equipmentId || !finalName || !fromDate || !toDate) {
      setError('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.createAllocation({
        equipment_id: parseInt(equipmentId, 10),
        allocated_to_name: finalName,
        allocated_to_role: allocatedToRole,
        department: isAdmin ? department : (user?.department || department),
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarCheck size={18} color="#2563eb" />
            <h3 className="modal-title">
              {isAdmin ? 'Allocate Equipment' : 'Request Equipment Allocation'}
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
                  Requesting for: <strong>{user?.full_name}</strong> ({user?.department})
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
                    {eq.equipment_code} - {eq.name} ({eq.status})
                  </option>
                ))}
              </select>
            </div>

            {isAdmin ? (
              <>
                <div className="form-group">
                  <label className="form-label">Allocated To (Faculty Name) <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={allocatedToName}
                    onChange={(e) => setAllocatedToName(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Kumar / Prof. Sunita Rao"
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
                      <option value="Faculty">Faculty</option>
                      <option value="Lab In-Charge">Lab In-Charge</option>
                      <option value="Research Scholar">Research Scholar</option>
                      <option value="Department Staff">Department Staff</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      className="form-select"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option value="Computer Science">Computer Science (CSE)</option>
                      <option value="ECE">Electronics & Comm (ECE)</option>
                      <option value="Information Technology">Information Technology (IT)</option>
                      <option value="Administration">Administration</option>
                    </select>
                  </div>
                </div>
              </>
            ) : null}

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

            <div className="form-group">
              <label className="form-label">Purpose / Lab Course / Research Topic</label>
              <textarea
                className="form-textarea"
                rows="2"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Distributed Systems practical evaluation, VLSI circuit simulation..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : isAdmin ? 'Confirm Allocation' : 'Submit Allocation Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
