import React, { useState, useEffect, useCallback } from 'react';
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

function parseUrl() {
  const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const segments = pathname.split('/').filter(Boolean);

  let requestedRole = null;
  let requestedTab = 'dashboard';

  if (segments.length === 0) {
    return { requestedRole: null, requestedTab: 'dashboard' };
  }

  if (segments[0] === 'admin') {
    requestedRole = 'Admin';
    requestedTab = segments[1] || 'dashboard';
  } else if (segments[0] === 'faculty' || segments[0] === 'fac') {
    requestedRole = 'Faculty';
    requestedTab = segments[1] || 'dashboard';
  } else if (segments[0] === 'login') {
    if (segments[1] === 'admin') requestedRole = 'Admin';
    else if (segments[1] === 'faculty' || segments[1] === 'fac') requestedRole = 'Faculty';
    return { requestedRole, requestedTab: 'login' };
  } else {
    requestedTab = segments[0];
  }

  // Normalize tab names
  if (requestedTab === 'equipment' || requestedTab === 'equipments') requestedTab = 'equipment';
  else if (requestedTab === 'equipment-detail') requestedTab = 'equipment-detail';
  else if (requestedTab === 'add-equipment') requestedTab = 'add-equipment';
  else if (requestedTab === 'edit-equipment') requestedTab = 'edit-equipment';
  else if (requestedTab === 'categories' || requestedTab === 'category') requestedTab = 'categories';
  else if (requestedTab === 'laboratories' || requestedTab === 'labs' || requestedTab === 'lab') requestedTab = 'laboratories';
  else if (requestedTab === 'allocations' || requestedTab === 'allocation') requestedTab = 'allocations';
  else if (requestedTab === 'maintenance') requestedTab = 'maintenance';
  else if (requestedTab === 'reports' || requestedTab === 'report') requestedTab = 'reports';
  else if (requestedTab === 'users' || requestedTab === 'faculty-management') requestedTab = 'users';
  else requestedTab = 'dashboard';

  return { requestedRole, requestedTab };
}

function buildPath(role, tab) {
  const rolePrefix = role === 'Admin' ? '/admin' : '/faculty';
  if (!tab || tab === 'dashboard') return rolePrefix;
  return `${rolePrefix}/${tab}`;
}

export default function App() {
  const { isAuthenticated, logout, user } = useAuth();
  const initialUrl = parseUrl();

  const [activeTab, setActiveTabState] = useState(() => initialUrl.requestedTab);
  const [loginRole, setLoginRole] = useState(() => initialUrl.requestedRole || 'Admin');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
  const [editingEquipmentId, setEditingEquipmentId] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync state with browser address bar
  const navigateTo = useCallback((tab, pushUrl = true) => {
    let targetTab = tab;
    // Disallow non-admin from users tab
    if (user?.role === 'Faculty' && targetTab === 'users') {
      targetTab = 'dashboard';
    }

    setActiveTabState(targetTab);

    if (pushUrl && user?.role) {
      const newPath = buildPath(user.role, targetTab);
      if (window.location.pathname !== newPath) {
        window.history.pushState({ tab: targetTab, role: user.role }, '', newPath);
      }
    }
  }, [user]);

  // Sync initial URL on login or role changes
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const { requestedTab } = parseUrl();
      const validTab = (user.role === 'Faculty' && requestedTab === 'users') ? 'dashboard' : (requestedTab === 'login' ? 'dashboard' : requestedTab);
      setActiveTabState(validTab);
      const expectedPath = buildPath(user.role, validTab);
      if (window.location.pathname !== expectedPath) {
        window.history.replaceState({ tab: validTab, role: user.role }, '', expectedPath);
      }
    }
  }, [isAuthenticated, user]);

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const { requestedTab } = parseUrl();
      if (user?.role === 'Faculty' && requestedTab === 'users') {
        setActiveTabState('dashboard');
      } else if (requestedTab !== 'login') {
        setActiveTabState(requestedTab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  // Handle Login Role Switcher
  const handleLoginRoleChange = (role) => {
    setLoginRole(role);
    const newPath = role === 'Admin' ? '/admin' : '/faculty';
    if (window.location.pathname !== newPath) {
      window.history.replaceState(null, '', newPath);
    }
  };

  const handleLoginSuccess = (loggedInRole) => {
    const role = loggedInRole || user?.role || 'Admin';
    setActiveTabState('dashboard');
    const newPath = role === 'Admin' ? '/admin' : '/faculty';
    window.history.pushState({ tab: 'dashboard', role }, '', newPath);
  };

  const handleLogout = () => {
    logout();
    window.history.pushState(null, '', '/login');
  };

  // If not logged in, render LoginPage with initial selected tab
  if (!isAuthenticated) {
    return (
      <LoginPage
        initialRole={loginRole}
        onRoleChange={handleLoginRoleChange}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const handleSelectEquipment = (id) => {
    setSelectedEquipmentId(id);
    navigateTo('equipment-detail');
  };

  const handleAddEquipment = () => {
    setEditingEquipmentId(null);
    navigateTo('add-equipment');
  };

  const handleEditEquipment = (id) => {
    setEditingEquipmentId(id);
    navigateTo('edit-equipment');
  };

  const handleSaveSuccess = () => {
    setSelectedEquipmentId(null);
    setEditingEquipmentId(null);
    navigateTo('equipment');
  };

  const handleSidebarNavigate = (tab) => {
    setSelectedEquipmentId(null);
    setEditingEquipmentId(null);
    navigateTo(tab);
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
        setActiveTab={handleSidebarNavigate}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className="main-content">
        <Navbar
          title={getPageTitle()}
          onLogoutClick={handleLogout}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <div className="page-body">
          {activeTab === 'dashboard' && <DashboardPage onNavigate={handleSidebarNavigate} />}

          {activeTab === 'equipment' && (
            <EquipmentListPage
              onSelectEquipment={handleSelectEquipment}
              onAddEquipmentClick={handleAddEquipment}
            />
          )}

          {activeTab === 'equipment-detail' && (
            <EquipmentDetailPage
              equipmentId={selectedEquipmentId}
              onBack={() => navigateTo('equipment')}
              onEditClick={(id) => handleEditEquipment(id)}
            />
          )}

          {(activeTab === 'add-equipment' || activeTab === 'edit-equipment') && (
            <AddEditEquipmentPage
              editId={editingEquipmentId}
              onBack={() => navigateTo('equipment')}
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

          {activeTab === 'users' && (user?.role === 'Admin' ? <UsersPage /> : <DashboardPage onNavigate={handleSidebarNavigate} />)}
        </div>
      </main>
    </div>
  );
}
