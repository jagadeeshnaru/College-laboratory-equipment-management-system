import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Eye, RefreshCw, Layers } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function EquipmentListPage({ onSelectEquipment, onAddEquipmentClick }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [equipmentList, setEquipmentList] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLab, setSelectedLab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eqRes, labRes, catRes] = await Promise.all([
        api.getEquipmentList({
          search: searchTerm,
          lab_id: selectedLab === 'all' ? '' : selectedLab,
          category_id: selectedCategory === 'all' ? '' : selectedCategory,
          status: selectedStatus === 'all' ? '' : selectedStatus
        }),
        api.getLaboratories(),
        api.getCategories()
      ]);

      if (eqRes?.data) setEquipmentList(eqRes.data);
      if (labRes?.data) setLaboratories(labRes.data);
      if (catRes?.data) setCategories(catRes.data);
    } catch (err) {
      console.error('Error fetching equipment list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, selectedLab, selectedCategory, selectedStatus]);

  // Client-side dynamic filtering using .filter()
  const filteredEquipment = equipmentList.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipment_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category_name && item.category_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.lab_name && item.lab_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLab = selectedLab === 'all' || String(item.lab_id) === String(selectedLab);
    const matchesCat = selectedCategory === 'all' || String(item.category_id) === String(selectedCategory);
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

    return matchesSearch && matchesLab && matchesCat && matchesStatus;
  });

  return (
    <div>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {isAdmin ? 'Equipment Inventory' : 'Equipment Catalog'}
          </h2>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
            {isAdmin ? 'Manage, track and allocate campus laboratory equipment' : 'Browse equipment availability and check out items for laboratory sessions'}
          </div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={onAddEquipmentClick}>
            <Plus size={16} />
            <span>Add Equipment</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          <div className="search-input-wrap">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              className="form-input"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '170px' }}>
            <select
              className="form-select"
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
            >
              <option value="all">All Laboratories</option>
              {laboratories.map((lab) => (
                <option key={lab.lab_id} value={lab.lab_id}>
                  {lab.lab_name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '140px' }}>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Laboratory</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  Loading equipment catalog...
                </td>
              </tr>
            ) : filteredEquipment.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No equipment found matching criteria.
                </td>
              </tr>
            ) : (
              filteredEquipment.map((item) => (
                <tr key={item.equipment_id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{item.equipment_code}</td>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>{item.category_name}</td>
                  <td>{item.lab_name}</td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onSelectEquipment(item.equipment_id)}
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
    </div>
  );
}
