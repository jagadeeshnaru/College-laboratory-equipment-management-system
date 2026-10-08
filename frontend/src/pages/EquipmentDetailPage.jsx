import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, AlertTriangle, CalendarCheck, QrCode, Printer, X } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ReportDamageModal from '../components/ReportDamageModal';
import AddAllocationModal from '../components/AddAllocationModal';
import { api } from '../services/api';

export default function EquipmentDetailPage({ equipmentId, onBack, onEditClick }) {
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [isAssetTagOpen, setIsAssetTagOpen] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.getEquipmentById(equipmentId);
      if (res?.data) {
        setEquipment(res.data);
      }
    } catch (err) {
      console.error('Error fetching equipment detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (equipmentId) {
      fetchDetail();
    }
  }, [equipmentId]);

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
        <div>Loading equipment details...</div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
        <div>Equipment not found.</div>
        <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={onBack}>
          <ArrowLeft size={16} /> Back to Equipment
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>Equipment Details</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setIsAssetTagOpen(true)}>
            <QrCode size={16} />
            <span>Print Asset Tag</span>
          </button>
          <button className="btn btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Main Spec Card (Matching Mockup Screen 4) */}
      <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '36px', alignItems: 'start' }}>
          {/* Equipment Image */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '260px'
            }}
          >
            <img
              src={equipment.image_url || 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80'}
              alt={equipment.name}
              style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80';
              }}
            />
            <div style={{ marginTop: '14px', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {equipment.model_number || 'Model: OptiPlex Series'}
            </div>
          </div>

          {/* Key-Value Details Table */}
          <div>
            <table className="data-table" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <tbody>
                <tr>
                  <td style={{ width: '160px', fontWeight: 600, background: '#f8fafc', color: '#475569' }}>
                    Equipment ID
                  </td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{equipment.equipment_code}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, background: '#f8fafc', color: '#475569' }}>Name</td>
                  <td style={{ fontWeight: 600 }}>{equipment.name}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, background: '#f8fafc', color: '#475569' }}>Category</td>
                  <td>{equipment.category_name}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, background: '#f8fafc', color: '#475569' }}>Laboratory</td>
                  <td>{equipment.lab_name} ({equipment.lab_location || 'Campus'})</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, background: '#f8fafc', color: '#475569' }}>Status</td>
                  <td>
                    <StatusBadge status={equipment.status} />
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, background: '#f8fafc', color: '#475569' }}>Purchase Date</td>
                  <td>{equipment.purchase_date || '12-08-2024'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, background: '#f8fafc', color: '#475569' }}>Warranty</td>
                  <td>{equipment.warranty || '3 Years'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, background: '#f8fafc', color: '#475569' }}>Description</td>
                  <td style={{ color: '#475569', lineHeight: 1.5 }}>
                    {equipment.description || 'Dell OptiPlex Desktop with 8GB RAM, 512GB SSD'}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Bottom Actions (Matching Mockup Screen 4: Allocate, Report Damage, Edit) */}
            <div style={{ display: 'flex', gap: '14px', marginTop: '24px' }}>
              <button
                className="btn btn-primary"
                onClick={() => setIsAllocModalOpen(true)}
                disabled={equipment.status !== 'Available'}
                title={equipment.status !== 'Available' ? 'Only Available equipment can be allocated' : 'Allocate equipment'}
              >
                <CalendarCheck size={16} />
                <span>Allocate</span>
              </button>

              <button
                className="btn btn-warning"
                onClick={() => setIsReportModalOpen(true)}
              >
                <AlertTriangle size={16} />
                <span>Report Damage</span>
              </button>

              <button
                className="btn btn-success"
                onClick={() => onEditClick(equipment.equipment_id)}
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History Tables (Allocations & Maintenance) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Allocations Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Allocation History</h3>
          {(!equipment.allocations || equipment.allocations.length === 0) ? (
            <div style={{ color: '#64748b', fontSize: '0.88rem' }}>No past allocations recorded.</div>
          ) : (
            <table className="data-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>User / Dept</th>
                  <th>Period</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {equipment.allocations.map((a) => (
                  <tr key={a.allocation_id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.allocated_to_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.allocated_to_role}</div>
                    </td>
                    <td>{a.from_date} to {a.to_date}</td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Maintenance Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Maintenance Log</h3>
          {(!equipment.maintenance || equipment.maintenance.length === 0) ? (
            <div style={{ color: '#64748b', fontSize: '0.88rem' }}>No maintenance incidents recorded.</div>
          ) : (
            <table className="data-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {equipment.maintenance.map((m) => (
                  <tr key={m.maintenance_id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.issue_description}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Priority: {m.priority}</div>
                    </td>
                    <td>{m.reported_date}</td>
                    <td><StatusBadge status={m.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Asset Tag & QR Modal */}
      {isAssetTagOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Official Asset Tag</h3>
              <button className="modal-close" onClick={() => setIsAssetTagOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div
                style={{
                  border: '2px dashed #3b82f6',
                  borderRadius: '12px',
                  padding: '24px 20px',
                  background: '#f8fafc',
                  marginBottom: '16px'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e3a8a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  COLLEGE LABORATORY ASSET
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '6px 0' }}>
                  {equipment.equipment_code}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                  {equipment.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                  {equipment.lab_name} • {equipment.category_name}
                </div>

                {/* SVG QR Code Simulation */}
                <div style={{ margin: '16px auto', width: '120px', height: '120px', background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 100 100" width="100" height="100">
                    <rect x="0" y="0" width="30" height="30" fill="#0f172a" />
                    <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
                    <rect x="10" y="10" width="10" height="10" fill="#0f172a" />
                    <rect x="70" y="0" width="30" height="30" fill="#0f172a" />
                    <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
                    <rect x="80" y="10" width="10" height="10" fill="#0f172a" />
                    <rect x="0" y="70" width="30" height="30" fill="#0f172a" />
                    <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
                    <rect x="10" y="80" width="10" height="10" fill="#0f172a" />
                    <rect x="40" y="10" width="10" height="20" fill="#0f172a" />
                    <rect x="40" y="40" width="20" height="20" fill="#0f172a" />
                    <rect x="70" y="50" width="20" height="10" fill="#0f172a" />
                    <rect x="50" y="70" width="20" height="20" fill="#0f172a" />
                  </svg>
                </div>

                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Scan to verify asset authentication on Lab EMS
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={15} /> Print Tag
              </button>
              <button className="btn btn-secondary" onClick={() => setIsAssetTagOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ReportDamageModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={fetchDetail}
        preselectedEquipmentId={equipment.equipment_id}
        equipmentList={[equipment]}
      />

      <AddAllocationModal
        isOpen={isAllocModalOpen}
        onClose={() => setIsAllocModalOpen(false)}
        onSuccess={fetchDetail}
        preselectedEquipmentId={equipment.equipment_id}
        equipmentList={[equipment]}
      />
    </div>
  );
}
