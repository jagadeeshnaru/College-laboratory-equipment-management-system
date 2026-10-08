import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, RotateCcw, CalendarCheck, Search, Filter } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import AddAllocationModal from '../components/AddAllocationModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AllocationPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [allocations, setAllocations] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAlloc, setSelectedAlloc] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allocRes, eqRes] = await Promise.all([
        api.getAllocations(),
        api.getEquipmentList()
      ]);
      if (allocRes?.data) setAllocations(allocRes.data);
      if (eqRes?.data) setEquipmentList(eqRes.data);
    } catch (err) {
      console.error('Failed to load allocations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReturnEquipment = async (allocationId) => {
    try {
      await api.returnAllocation(allocationId);
      fetchData();
      setSelectedAlloc(null);
    } catch (err) {
      alert('Error returning equipment: ' + err.message);
    }
  };

  // Filter allocations
  const filteredAllocations = allocations.filter((a) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      a.allocation_code?.toLowerCase().includes(term) ||
      a.equipment_name?.toLowerCase().includes(term) ||
      a.allocated_to_name?.toLowerCase().includes(term) ||
      a.department?.toLowerCase().includes(term);

    const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {isAdmin ? 'Equipment Allocations' : 'My Equipment Allocations'}
          </h2>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
            {isAdmin ? 'Monitor, approve and track hardware checked out across faculties' : 'Track your borrowed equipment, return dates and request new items'}
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>{isAdmin ? 'Add Allocation' : 'Request Allocation'}</span>
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
              placeholder="Search by allocation ID, equipment or faculty name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Equipment</th>
              <th>Allocated To</th>
              <th>Department</th>
              <th>Period</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  Loading allocations...
                </td>
              </tr>
            ) : filteredAllocations.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No allocations found.
                </td>
              </tr>
            ) : (
              filteredAllocations.map((a) => {
                const isMyAllocation =
                  user &&
                  (a.allocated_to_name?.toLowerCase().includes(user.full_name?.toLowerCase()) ||
                    a.allocated_to_name?.toLowerCase().includes('faculty'));

                return (
                  <tr key={a.allocation_id}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{a.allocation_code}</td>
                    <td style={{ fontWeight: 600 }}>{a.equipment_name || 'Equipment'}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.allocated_to_name || a.allocated_to_role}</div>
                      {!isAdmin && isMyAllocation && (
                        <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>● Your Booking</span>
                      )}
                    </td>
                    <td>{a.department || 'Computer Science'}</td>
                    <td>{a.from_date} to {a.to_date}</td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setSelectedAlloc(a)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Allocation Modal */}
      <AddAllocationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchData}
        equipmentList={equipmentList}
      />

      {/* View Detail Modal */}
      {selectedAlloc && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Allocation Details ({selectedAlloc.allocation_code})</h3>
              <button className="modal-close" onClick={() => setSelectedAlloc(null)}>✕</button>
            </div>
            <div className="modal-body">
              <table className="data-table" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '140px', fontWeight: 600, background: '#f8fafc' }}>Equipment</td>
                    <td style={{ fontWeight: 600 }}>{selectedAlloc.equipment_name} ({selectedAlloc.equipment_code})</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, background: '#f8fafc' }}>Allocated To</td>
                    <td style={{ fontWeight: 600 }}>{selectedAlloc.allocated_to_name}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, background: '#f8fafc' }}>Role / Dept</td>
                    <td>{selectedAlloc.allocated_to_role} ({selectedAlloc.department || 'CSE'})</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, background: '#f8fafc' }}>Duration</td>
                    <td>{selectedAlloc.from_date} to {selectedAlloc.to_date}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, background: '#f8fafc' }}>Purpose</td>
                    <td>{selectedAlloc.purpose || 'Academic & Lab Assignment'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, background: '#f8fafc' }}>Status</td>
                    <td><StatusBadge status={selectedAlloc.status} /></td>
                  </tr>
                </tbody>
              </table>

              {selectedAlloc.status === 'Active' && (isAdmin || user?.full_name === selectedAlloc.allocated_to_name) && (
                <div style={{ marginTop: '20px' }}>
                  <button
                    className="btn btn-success"
                    style={{ width: '100%' }}
                    onClick={() => handleReturnEquipment(selectedAlloc.allocation_id)}
                  >
                    <CheckCircle size={16} /> Mark Equipment as Returned
                  </button>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedAlloc(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
