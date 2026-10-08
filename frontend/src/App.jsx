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
  const { isAuthenticated, logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
  const [editingEquipmentId, setEditingEquipmentId] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If not logged in, show login page
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setActiveTab('dashboard')} />;
  }

  const isAdmin = user?.role === 'Admin';

  const handleSelectEquipment = (id) => {
    setSelectedEquipmentId(id);
    setActiveTab('equipment-detail');
  };

  const handleAddEquipment = () => {
    if (!isAdmin) return;
    setEditingEquipmentId(null);
    setActiveTab('add-equipment');
  };

  const handleEditEquipment = (id) => {
    if (!isAdmin) return;
    setEditingEquipmentId(id);
    setActiveTab('edit-equipment');
  };

  const handleSaveSuccess = () => {
    setActiveTab('equipment');
    setSelectedEquipmentId(null);
    setEditingEquipmentId(null);
  };

  const handleNavigate = (tab) => {
    setSelectedEquipmentId(null);
    setEditingEquipmentId(null);
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  // Get Page Title for Navbar
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return isAdmin ? 'Central Laboratory Dashboard' : 'Faculty Academic Dashboard';
      case 'equipment':
        return isAdmin ? 'Equipment Inventory Management' : 'Equipment Catalog & Availability';
      case 'equipment-detail':
        return 'Equipment Specifications & Status';
      case 'add-equipment':
        return 'Add New Equipment';
      case 'edit-equipment':
        return 'Edit Equipment Details';
      case 'categories':
        return 'Equipment Categories';
      case 'laboratories':
        return isAdmin ? 'Campus Laboratories Management' : 'Campus Laboratories Directory';
      case 'allocations':
        return isAdmin ? 'Equipment Allocations & Returns' : 'My Equipment Allocations';
      case 'maintenance':
        return isAdmin ? 'Maintenance & Damage Records' : 'Maintenance & Repair Requests';
      case 'reports':
        return 'Inventory & Operations Reports';
      case 'users':
        return 'Faculty & User Management';
      default:
        return 'Lab EMS Portal';
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
        setActiveTab={handleNavigate}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className="main-content">
        <Navbar
          title={getPageTitle()}
          onLogoutClick={() => {
            logout();
          }}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <div className="page-body">
          {activeTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}

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

          {isAdmin && (activeTab === 'add-equipment' || activeTab === 'edit-equipment') && (
            <AddEditEquipmentPage
              editId={editingEquipmentId}
              onBack={() => setActiveTab('equipment')}
              onSaveSuccess={handleSaveSuccess}
            />
          )}

          {isAdmin && activeTab === 'categories' && <CategoriesPage />}

          {activeTab === 'laboratories' && <LaboratoriesPage />}

          {activeTab === 'allocations' && <AllocationPage />}

          {activeTab === 'maintenance' && (
            <MaintenancePage onSelectEquipment={handleSelectEquipment} />
          )}

          {isAdmin && activeTab === 'reports' && <ReportsPage />}

          {isAdmin && activeTab === 'users' && <UsersPage />}
        </div>
      </main>
    </div>
  );
}
