// ============================================================
// Axios Instance - AIGeneralCV
// Interceptor tự động gắn JWT và xử lý lỗi 401
// Timeout 30s (theo FlowWork.md - do RAG xử lý lâu)
// ============================================================

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5000',
  timeout: 30000, // 30 giây - theo FlowWork.md
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor: Gắn JWT Token ---
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor: Xử lý lỗi 401/403 ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        // Token hết hạn hoặc không hợp lệ → xóa token, redirect login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// --- Helper: Đọc pagination headers ---
export function extractPaginationHeaders(response) {
  return {
    totalCount: parseInt(response.headers['x-total-count'] || '0', 10),
    page: parseInt(response.headers['x-page'] || '1', 10),
    pageSize: parseInt(response.headers['x-page-size'] || '50', 10),
  };
}
