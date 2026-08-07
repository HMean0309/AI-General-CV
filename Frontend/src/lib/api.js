import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      const { status, config } = error.response;
      // Không tự động reload/redirect nếu lỗi 401 xảy ra tại request login hoặc ở trang /login
      const isLoginRequest = config?.url?.includes('/auth/login');
      const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

      if (status === 401 && !isLoginRequest && !isLoginPage) {
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
