// ============================================================
// CV Service - AIGeneralCV
// Gọi API liên quan đến sinh CV, lịch sử, xuất bản
// Timeout cao hơn (60s) cho endpoint generate do RAG xử lý lâu
// ============================================================

import api, { extractPaginationHeaders } from '@/lib/api';

const CV_ENDPOINTS = {
  GENERATE: '/api/cv/generate',
  HISTORY: '/api/cv',
  DETAIL: '/api/cv',
};

/**
 * Gọi AI sinh CV tối ưu
 * Timeout 60s (gấp đôi mặc định) vì RAG + LLM tốn thời gian
 * @param {{ targetRole: string, jobDescription: string, emphasizeProjects: boolean }} payload
 */
export async function generateCV(payload) {
  const response = await api.post(CV_ENDPOINTS.GENERATE, payload, {
    timeout: 60000, // 60 giây
  });
  return response.data;
}

/**
 * Lấy danh sách CV đã tạo (phân trang qua custom headers)
 */
export async function getCvHistory(params = {}) {
  const response = await api.get(CV_ENDPOINTS.HISTORY, { params });
  return {
    data: response.data,
    pagination: extractPaginationHeaders(response),
  };
}

/**
 * Lấy chi tiết 1 bản CV
 */
export async function getCvById(id) {
  const response = await api.get(`${CV_ENDPOINTS.DETAIL}/${id}`);
  return response.data;
}

/**
 * Sao chép phiên bản CV
 */
export async function duplicateCv(id) {
  const response = await api.post(`${CV_ENDPOINTS.DETAIL}/${id}/duplicate`);
  return response.data;
}

/**
 * Lưu trữ (archive) 1 bản CV
 */
export async function archiveCv(id) {
  const response = await api.put(`${CV_ENDPOINTS.DETAIL}/${id}/archive`);
  return response.data;
}
