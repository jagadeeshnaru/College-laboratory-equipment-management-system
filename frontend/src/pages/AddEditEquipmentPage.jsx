import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

const INITIAL_FORM = {
  name: 'Dell Laptop',
  category_id: '1',
  lab_id: '1',
  status: 'Available',
  purchase_date: '2024-10-01',
  warranty: '3 Years',
  model_number: '',
  serial_number: '',
  description: 'High performance laptop for laboratory and faculty research use.',
  image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80'
};

export default function AddEditEquipmentPage({ editId, onBack, onSaveSuccess }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [categories, setCategories] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch dropdown lists & prefill form if editing
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, labRes] = await Promise.all([
          api.getCategories(),
          api.getLaboratories()
        ]);
        if (catRes?.data) setCategories(catRes.data);
        if (labRes?.data) setLaboratories(labRes.data);

        if (editId) {
          const eqRes = await api.getEquipmentById(editId);
          if (eqRes?.data) {
            setFormData({
              name: eqRes.data.name || '',
              category_id: String(eqRes.data.category_id || '1'),
              lab_id: String(eqRes.data.lab_id || '1'),
              status: eqRes.data.status || 'Available',
              purchase_date: eqRes.data.purchase_date || '2024-10-01',
              warranty: eqRes.data.warranty || '3 Years',
              model_number: eqRes.data.model_number || '',
              serial_number: eqRes.data.serial_number || '',
              description: eqRes.data.description || '',
              image_url: eqRes.data.image_url || ''
            });
          }
        }
      } catch (err) {
        console.error('Failed to load form metadata:', err);
      }
    }
    loadMeta();
  }, [editId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category_id || !formData.lab_id) {
      setError('Please fill all required fields indicated by *');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        name: formData.name.trim(),
        category_id: parseInt(formData.category_id, 10),
        lab_id: parseInt(formData.lab_id, 10),
        status: formData.status,
        purchase_date: formData.purchase_date,
        warranty: formData.warranty,
        model_number: formData.model_number,
        serial_number: formData.serial_number,
        description: formData.description,
        image_url: formData.image_url
      };

      if (editId) {
        await api.updateEquipment(editId, payload);
        setSuccessMsg('Equipment updated successfully!');
      } else {
        await api.createEquipment(payload);
        setSuccessMsg('New equipment created successfully!');
      }

      setLoading(false);
      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess();
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to save equipment record');
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>
          {editId ? 'Edit Equipment' : 'Add Equipment'}
        </h2>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      {/* Form Card */}
      <div className="card" style={{ maxWidth: '800px', padding: '32px' }}>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Row 1: Name */}
          <div className="form-group">
            <label className="form-label">
              Name <span className="req">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Dell Laptop"
              required
            />
          </div>

          {/* Row 2: Category & Laboratory */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">
                Category <span className="req">*</span>
              </label>
              <select
                className="form-select"
                value={formData.category_id}
                onChange={(e) => handleChange('category_id', e.target.value)}
                required
              >
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Laboratory <span className="req">*</span>
              </label>
              <select
                className="form-select"
                value={formData.lab_id}
                onChange={(e) => handleChange('lab_id', e.target.value)}
                required
              >
                {laboratories.map((l) => (
                  <option key={l.lab_id} value={l.lab_id}>
                    {l.lab_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Status */}
          <div className="form-group">
            <label className="form-label">
              Status <span className="req">*</span>
            </label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              required
            >
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>

          {/* Row 4: Purchase Date & Warranty */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Purchase Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.purchase_date}
                onChange={(e) => handleChange('purchase_date', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Warranty Period</label>
              <input
                type="text"
                className="form-input"
                value={formData.warranty}
                onChange={(e) => handleChange('warranty', e.target.value)}
                placeholder="e.g. 3 Years"
              />
            </div>
          </div>

          {/* Row 5: Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="High performance laptop for laboratory and faculty research use."
              rows={4}
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save'}</span>
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset} disabled={loading}>
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
