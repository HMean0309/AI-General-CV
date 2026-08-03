// ============================================================
// Auth Service - AIGeneralCV
// Các hàm gọi API liên quan đến xác thực
// ============================================================

import api from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';

/**
 * Đăng nhập
 * @param {string} userName 
 * @param {string} password 
 * @returns {{ token, expiresAt, user }}
 */
export async function loginUser(userName, password) {
  const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
    userName,
    password,
  });
  return response.data;
}

/**
 * Đổi mật khẩu
 * @param {string} currentPassword 
 * @param {string} newPassword 
 */
export async function changePassword(currentPassword, newPassword) {
  const response = await api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
    currentPassword,
    newPassword,
  });
  return response.data;
}
