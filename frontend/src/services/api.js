const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '') + '/api';

async function request(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  // Get user role from localStorage for header auth
  const savedUser = localStorage.getItem('lab_ems_user');
  if (savedUser) {
    try {
      const parsed = JSON.parse(savedUser);
      defaultHeaders['x-user-role'] = parsed.role || 'Admin';
      defaultHeaders['x-user-name'] = parsed.username || 'Administrator';
    } catch (e) {}
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  // Equipment
  getEquipmentStats: () => request('/equipment/stats/summary'),
  getEquipmentList: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/equipment${query ? `?${query}` : ''}`);
  },
  getEquipmentById: (id) => request(`/equipment/${id}`),
  createEquipment: (payload) =>
    request('/equipment', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateEquipment: (id, payload) =>
    request(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteEquipment: (id) =>
    request(`/equipment/${id}`, {
      method: 'DELETE'
    }),

  // Categories & Labs
  getCategories: () => request('/categories'),
  createCategory: (payload) =>
    request('/categories', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getLaboratories: () => request('/laboratories'),
  createLaboratory: (payload) =>
    request('/laboratories', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Allocations
  getAllocations: () => request('/allocations'),
  createAllocation: (payload) =>
    request('/allocations', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  returnAllocation: (id) =>
    request(`/allocations/${id}/return`, {
      method: 'PUT'
    }),
  deleteAllocation: (id) =>
    request(`/allocations/${id}`, {
      method: 'DELETE'
    }),

  // Maintenance & Damage Reporting
  getMaintenanceRecords: () => request('/maintenance'),
  reportDamage: (payload) =>
    request('/maintenance/report', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateMaintenanceStatus: (id, payload) =>
    request(`/maintenance/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteMaintenance: (id) =>
    request(`/maintenance/${id}`, {
      method: 'DELETE'
    }),

  // Reports
  getReportsByLab: () => request('/reports/by-laboratory'),
  getReportsByCategory: () => request('/reports/by-category'),
  getMaintenanceSummary: () => request('/reports/maintenance-summary'),
  getDamagedReports: () => request('/reports/damaged'),

  // Users
  getUsers: (role) => request(`/users${role ? `?role=${role}` : ''}`)
};
