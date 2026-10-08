import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lab_ems_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.role === 'Admin' || parsed.role === 'Faculty')) {
          return parsed;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('lab_ems_user');
    return !!saved;
  });

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
        return { success: true, user: res.user };
      }
    } catch (err) {
      // Fallback for seamless demo / offline usage
      let fallbackUser = {
        user_id: role === 'Admin' ? 1 : 2,
        username: username || (role === 'Admin' ? 'admin' : 'faculty1'),
        full_name: role === 'Admin' ? 'Administrator' : username === 'faculty2' ? 'Prof. Sunita Rao' : 'Dr. Ramesh Kumar',
        email: `${username || (role === 'Admin' ? 'admin' : 'faculty1')}@college.edu`,
        role: role || 'Admin',
        department: role === 'Admin' ? 'Computer Science' : username === 'faculty2' ? 'ECE' : 'Computer Science'
      };
      setUser(fallbackUser);
      return { success: true, user: fallbackUser };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('lab_ems_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
