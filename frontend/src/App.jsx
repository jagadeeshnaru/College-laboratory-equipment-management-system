import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EquipmentListPage from './pages/EquipmentListPage';
import EquipmentDetailPage from './pages/EquipmentDetailPage';
import AddEditEquipmentPage from './pages/AddEditEquipmentPage';
import CategoriesPage from './pages/CategoriesPage';
import LaboratoriesPage from './pages/LaboratoriesPage';
import AllocationPage from './pages/AllocationPage';
import MaintenancePage from './pages/MaintenancePage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  const { isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
  const [editingEquipmentId, setEditingEquipmentId] = useState(null);

  // If not logged in, show login page
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setActiveTab('dashboard')} />;
  }

  const handleSelectEquipment = (id) => {
    setSelectedEquipmentId(id);
    setActiveTab('equipment-detail');
  };

  const handleAddEquipment = () => {
    setEditingEquipmentId(null);
    setActiveTab('add-equipment');
  };

  const handleEditEquipment = (id) => {
    setEditingEquipmentId(id);
    setActiveTab('edit-equipment');
  };

  const handleSaveSuccess = () => {
    setActiveTab('equipment');
    setSelectedEquipmentId(null);
    setEditingEquipmentId(null);
  };

  // Get Page Title for Navbar
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'equipment':
        return 'Equipment';
      case 'equipment-detail':
        return 'Equipment Details';
      case 'add-equipment':
        return 'Add Equipment';
      case 'edit-equipment':
        return 'Edit Equipment';
      case 'categories':
        return 'Categories';
      case 'laboratories':
        return 'Laboratories';
      case 'allocations':
        return 'Equipment Allocation';
      case 'maintenance':
        return 'Maintenance Records';
      case 'reports':
        return 'Equipment Reports';
      case 'users':
        return 'Users & Student Team';
      default:
        return 'Lab EMS';
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={
          activeTab.startsWith('equipment') || activeTab.includes('equipment')
            ? 'equipment'
            : activeTab
        }
        setActiveTab={(tab) => {
          setSelectedEquipmentId(null);
          setEditingEquipmentId(null);
          setActiveTab(tab);
        }}
      />

      <main className="main-content">
        <Navbar
          title={getPageTitle()}
          onLogoutClick={() => {
            logout();
          }}
        />

        <div className="page-body">
          {activeTab === 'dashboard' && <DashboardPage />}

          {activeTab === 'equipment' && (
            <EquipmentListPage
              onSelectEquipment={handleSelectEquipment}
              onAddEquipmentClick={handleAddEquipment}
            />
          )}

          {activeTab === 'equipment-detail' && (
            <EquipmentDetailPage
              equipmentId={selectedEquipmentId}
              onBack={() => setActiveTab('equipment')}
              onEditClick={(id) => handleEditEquipment(id)}
            />
          )}

          {(activeTab === 'add-equipment' || activeTab === 'edit-equipment') && (
            <AddEditEquipmentPage
              editId={editingEquipmentId}
              onBack={() => setActiveTab('equipment')}
              onSaveSuccess={handleSaveSuccess}
            />
          )}

          {activeTab === 'categories' && <CategoriesPage />}

          {activeTab === 'laboratories' && <LaboratoriesPage />}

          {activeTab === 'allocations' && <AllocationPage />}

          {activeTab === 'maintenance' && (
            <MaintenancePage onSelectEquipment={handleSelectEquipment} />
          )}

          {activeTab === 'reports' && <ReportsPage />}

          {activeTab === 'users' && <UsersPage />}
        </div>
      </main>
    </div>
  );
}
