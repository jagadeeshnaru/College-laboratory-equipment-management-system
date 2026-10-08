import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import { api } from '../services/api';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('lab'); // 'lab', 'category', 'maintenance', 'damaged'
  const [labReport, setLabReport] = useState({ data: [], totals: {} });
  const [catReport, setCatReport] = useState({ data: [], totals: {} });
  const [maintReport, setMaintReport] = useState({ records: [], statusDistribution: [] });
  const [damagedReport, setDamagedReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const [labRes, catRes, maintRes, damRes] = await Promise.all([
          api.getReportsByLab(),
          api.getReportsByCategory(),
          api.getMaintenanceSummary(),
          api.getDamagedReports()
        ]);

        if (labRes?.data) setLabReport(labRes);
        if (catRes?.data) setCatReport(catRes);
        if (maintRes?.records) setMaintReport(maintRes);
        if (damRes?.data) setDamagedReport(damRes.data);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  return (
    <div>
      {/* Header */}
      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>
        Equipment Reports
      </h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        {[
          { id: 'lab', label: 'By Laboratory' },
          { id: 'category', label: 'By Category' },
          { id: 'maintenance', label: 'Maintenance' },
          { id: 'damaged', label: 'Damaged' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              fontSize: '0.92rem',
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? '#2563eb' : '#64748b',
              borderBottom: activeTab === tab.id ? '3px solid #2563eb' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: By Laboratory (Mockup Screen 9 exact match) */}
      {activeTab === 'lab' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Laboratory</th>
                <th>Total Equipment</th>
                <th>Available</th>
                <th>In Use</th>
                <th>Under Maintenance</th>
                <th>Damaged</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Generating laboratory summary report...</td></tr>
              ) : labReport.data.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No laboratory records found.</td></tr>
              ) : (
                labReport.data.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{row.laboratory}</td>
                    <td style={{ fontWeight: 600 }}>{row.total_equipment}</td>
                    <td style={{ color: '#059669', fontWeight: 600 }}>{row.available}</td>
                    <td style={{ color: '#2563eb', fontWeight: 600 }}>{row.in_use}</td>
                    <td style={{ color: '#d97706', fontWeight: 600 }}>{row.under_maintenance}</td>
                    <td style={{ color: '#dc2626', fontWeight: 600 }}>{row.damaged}</td>
                  </tr>
                ))
              )}
            </tbody>
            {labReport.totals && (
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td>{labReport.totals.total_equipment}</td>
                  <td style={{ color: '#059669' }}>{labReport.totals.available}</td>
                  <td style={{ color: '#2563eb' }}>{labReport.totals.in_use}</td>
                  <td style={{ color: '#d97706' }}>{labReport.totals.under_maintenance}</td>
                  <td style={{ color: '#dc2626' }}>{labReport.totals.damaged}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* Tab 2: By Category */}
      {activeTab === 'category' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Equipment</th>
                <th>Available</th>
                <th>In Use</th>
                <th>Under Maintenance</th>
                <th>Damaged</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Generating category report...</td></tr>
              ) : catReport.data.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No categories found.</td></tr>
              ) : (
                catReport.data.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{row.category}</td>
                    <td style={{ fontWeight: 600 }}>{row.total_equipment}</td>
                    <td style={{ color: '#059669', fontWeight: 600 }}>{row.available}</td>
                    <td style={{ color: '#2563eb', fontWeight: 600 }}>{row.in_use}</td>
                    <td style={{ color: '#d97706', fontWeight: 600 }}>{row.under_maintenance}</td>
                    <td style={{ color: '#dc2626', fontWeight: 600 }}>{row.damaged}</td>
                  </tr>
                ))
              )}
            </tbody>
            {catReport.totals && (
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td>{catReport.totals.total_equipment}</td>
                  <td style={{ color: '#059669' }}>{catReport.totals.available}</td>
                  <td style={{ color: '#2563eb' }}>{catReport.totals.in_use}</td>
                  <td style={{ color: '#d97706' }}>{catReport.totals.under_maintenance}</td>
                  <td style={{ color: '#dc2626' }}>{catReport.totals.damaged}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* Tab 3: Maintenance Status Summary */}
      {activeTab === 'maintenance' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
            {maintReport.statusDistribution.map((st, i) => (
              <div key={i} className="card" style={{ padding: '18px' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>{st.status}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{st.count}</div>
                <div style={{ fontSize: '0.8rem', color: '#059669' }}>Cost: ₹{st.total_cost || 0}</div>
              </div>
            ))}
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Equipment</th>
                  <th>Laboratory</th>
                  <th>Issue</th>
                  <th>Priority</th>
                  <th>Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {maintReport.records.map((r) => (
                  <tr key={r.maintenance_id}>
                    <td style={{ fontWeight: 600 }}>{r.maintenance_code}</td>
                    <td style={{ fontWeight: 600 }}>{r.equipment_name} ({r.equipment_code})</td>
                    <td>{r.lab_name}</td>
                    <td>{r.issue_description}</td>
                    <td><strong style={{ color: r.priority === 'High' ? '#ef4444' : '#f59e0b' }}>{r.priority}</strong></td>
                    <td>₹{r.cost || 0}</td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Damaged Items */}
      {activeTab === 'damaged' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Equipment</th>
                <th>Category</th>
                <th>Laboratory</th>
                <th>Status</th>
                <th>Reported Issue</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {damagedReport.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No damaged equipment reported.</td></tr>
              ) : (
                damagedReport.map((d) => (
                  <tr key={d.equipment_id}>
                    <td style={{ fontWeight: 600 }}>{d.equipment_code}</td>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td>{d.category_name}</td>
                    <td>{d.lab_name}</td>
                    <td><StatusBadge status={d.status} /></td>
                    <td>{d.issue_description || 'Needs inspection'}</td>
                    <td><strong style={{ color: d.priority === 'High' ? '#ef4444' : '#f59e0b' }}>{d.priority || 'Medium'}</strong></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
