'use client';
// ============================================================
// Auth Context - AIGeneralCV
// Quản lý trạng thái đăng nhập (user, token, isAuthenticated)
// Persist token vào localStorage
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khởi tạo: Đọc token + user từ localStorage khi mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Login ---
  const login = useCallback(async (userName, password) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      userName,
      password,
    });

    const { token: newToken, user: userData } = response.data;

    // Lưu vào state + localStorage
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(userData));

    return userData;
  }, []);

  // --- Logout ---
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }, []);

  // --- Cập nhật thông tin user ---
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}
