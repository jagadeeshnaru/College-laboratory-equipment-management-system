import React, { useState, useEffect } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { api } from '../services/api';

export default function LaboratoriesPage() {
  const [laboratories, setLaboratories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    lab_name: '',
    department: 'Computer Science',
    location: '',
    capacity: 35,
    in_charge: ''
  });

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const res = await api.getLaboratories();
      if (res?.data) setLaboratories(res.data);
    } catch (err) {
      console.error('Failed to load labs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleAddLab = async (e) => {
    e.preventDefault();
    if (!formData.lab_name || !formData.in_charge) return;
    try {
      await api.createLaboratory(formData);
      setFormData({
        lab_name: '',
        department: 'Computer Science',
        location: '',
        capacity: 35,
        in_charge: ''
      });
      setShowAddForm(false);
      fetchLabs();
    } catch (err) {
      alert('Error creating laboratory: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>College Laboratories</h2>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} />
          <span>Add Laboratory</span>
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '20px', padding: '20px', maxWidth: '700px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px' }}>New Laboratory</h3>
          <form onSubmit={handleAddLab}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Laboratory Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.lab_name}
                  onChange={(e) => setFormData({ ...formData, lab_name: e.target.value })}
                  placeholder="e.g. AI & Robotics Lab"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Block D, 3rd Floor"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Capacity</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 30 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Faculty In-Charge</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.in_charge}
                  onChange={(e) => setFormData({ ...formData, in_charge: e.target.value })}
                  placeholder="e.g. Dr. Ramesh Kumar"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary btn-sm">Save Laboratory</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Laboratory Name</th>
              <th>Department</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>In-Charge</th>
              <th>Total Equipment</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading laboratories...</td></tr>
            ) : (
              laboratories.map((l) => (
                <tr key={l.lab_id}>
                  <td style={{ fontWeight: 600 }}>LAB-{l.lab_id}</td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{l.lab_name}</td>
                  <td>{l.department}</td>
                  <td>{l.location}</td>
                  <td>{l.capacity} Seats</td>
                  <td>{l.in_charge}</td>
                  <td><span className="badge available">{l.total_equipment || 0} Assets</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
