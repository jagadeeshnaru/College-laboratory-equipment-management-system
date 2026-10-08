import React, { useState, useEffect } from 'react';
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

function getTabFromPath() {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!path || path === 'dashboard') return 'dashboard';
  if (path === 'equipment' || path === 'equipments') return 'equipment';
  if (path === 'equipment-detail') return 'equipment-detail';
  if (path === 'add-equipment') return 'add-equipment';
  if (path === 'edit-equipment') return 'edit-equipment';
  if (path === 'categories' || path === 'category') return 'categories';
  if (path === 'laboratories' || path === 'labs' || path === 'lab') return 'laboratories';
  if (path === 'allocations' || path === 'allocation') return 'allocations';
  if (path === 'maintenance') return 'maintenance';
  if (path === 'reports' || path === 'report') return 'reports';
  if (path === 'users' || path === 'faculty') return 'users';
  return 'dashboard';
}

export default function App() {
  const { isAuthenticated, logout, user } = useAuth();
  const [activeTab, setActiveTabState] = useState(() => getTabFromPath());
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
  const [editingEquipmentId, setEditingEquipmentId] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync state with browser address bar
  const setActiveTab = (tab, pushUrl = true) => {
    setActiveTabState(tab);
    if (pushUrl) {
      const targetPath = tab === 'dashboard' ? '/' : `/${tab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ tab }, '', targetPath);
      }
    }
  };

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromPath();
      setActiveTabState(tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // If user role is Faculty and tab is 'users', redirect to dashboard
  useEffect(() => {
    if (user && user.role === 'Faculty' && activeTab === 'users') {
      setActiveTab('dashboard');
    }
  }, [user, activeTab]);

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
    setSelectedEquipmentId(null);
    setEditingEquipmentId(null);
    setActiveTab('equipment');
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
        return user?.role === 'Faculty' ? 'Faculty Academic Dashboard' : 'Central Laboratory Dashboard';
      case 'equipment':
        return 'Equipment Inventory';
      case 'equipment-detail':
        return 'Equipment Details';
      case 'add-equipment':
        return 'Add New Equipment';
      case 'edit-equipment':
        return 'Edit Equipment Details';
      case 'categories':
        return 'Equipment Categories';
      case 'laboratories':
        return 'Campus Laboratories';
      case 'allocations':
        return 'Equipment Allocations';
      case 'maintenance':
        return 'Maintenance & Damage Records';
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

          {activeTab === 'users' && (user?.role === 'Admin' ? <UsersPage /> : <DashboardPage onNavigate={handleNavigate} />)}
        </div>
      </main>
    </div>
  );
}
