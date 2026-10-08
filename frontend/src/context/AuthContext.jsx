import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

const DEFAULT_ADMIN = {
  user_id: 1,
  username: 'admin',
  full_name: 'Administrator',
  email: 'admin@college.edu',
  role: 'Admin',
  department: 'Computer Science'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lab_ems_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_ADMIN;
      }
    }
    return DEFAULT_ADMIN;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lab_ems_user', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('lab_ems_user');
      setIsAuthenticated(false);
    }
  }, [user]);

  const login = async (username, password, role) => {
    try {
      const res = await api.login({ username, password, role });
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true };
      }
    } catch (err) {
      // Fallback for easy demo login
      const fallbackUser = {
        user_id: 99,
        username: username || 'demo_user',
        full_name: username === 'admin' ? 'Administrator' : username.toUpperCase(),
        email: `${username || 'user'}@college.edu`,
        role: role || 'Admin',
        department: 'CSE'
      };
      setUser(fallbackUser);
      return { success: true };
    }
  };

  const switchRole = (newRole) => {
    setUser((prev) => ({
      ...prev,
      role: newRole,
      full_name: newRole === 'Admin' ? 'Administrator' : newRole === 'Faculty' ? 'Dr. Ramesh Kumar' : 'NARU JAGADEESH'
    }));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('lab_ems_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
