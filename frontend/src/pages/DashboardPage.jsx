import React, { useState, useEffect } from 'react';
import { Monitor, CheckCircle, Rocket, Wrench, RefreshCw } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import CategoryChart from '../components/CategoryChart';
import MaintenanceBarChart from '../components/MaintenanceBarChart';
import { api } from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_equipment: 128,
    available: 96,
    in_use: 22,
    under_maintenance: 10,
    damaged: 4
  });
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, catRes] = await Promise.all([
        api.getEquipmentStats().catch(() => null),
        api.getReportsByCategory().catch(() => null)
      ]);

      if (statsRes?.data) {
        setStats(statsRes.data);
      }
      if (catRes?.data) {
        setCategoryData(catRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div>
      {/* 4 KPI Cards Grid */}
      <div className="stats-grid">
        <StatsCard
          title="Total Equipment"
          value={stats.total_equipment}
          color="blue"
          icon={Monitor}
        />
        <StatsCard
          title="Available"
          value={stats.available}
          color="green"
          icon={CheckCircle}
        />
        <StatsCard
          title="In Use"
          value={stats.in_use}
          color="orange"
          icon={Rocket}
        />
        <StatsCard
          title="Under Maintenance"
          value={stats.under_maintenance}
          color="red"
          icon={Wrench}
        />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <CategoryChart data={categoryData} />
        <MaintenanceBarChart stats={stats} />
      </div>
    </div>
  );
}
