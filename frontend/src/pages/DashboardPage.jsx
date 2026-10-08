import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import FacultyDashboard from '../components/FacultyDashboard';

export default function DashboardPage({ onNavigate }) {
  const { user } = useAuth();

  return (
    <div>
      {user?.role === 'Faculty' ? (
        <FacultyDashboard onNavigate={onNavigate} />
      ) : (
        <AdminDashboard onNavigate={onNavigate} />
      )}
    </div>
  );
}
