// ============================================================
// Student Service - AIGeneralCV
// Gọi API lấy thông tin sinh viên, điểm, đánh giá PLO/CLO
// Dữ liệu trả về dạng phẳng (Flat Data) → cần map thủ công
// ============================================================

import api, { extractPaginationHeaders } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';

/**
 * Lấy thông tin user theo ID
 * Student chỉ xem được chính mình (theo backend README)
 */
export async function getUserById(userId) {
  const response = await api.get(`${API_ENDPOINTS.USERS}/${userId}`);
  return response.data;
}

/**
 * Lấy danh sách toàn bộ Users thô (để map thông tin tên sinh viên khi test)
 */
export async function getUsers(params = {}) {
  const response = await api.get(API_ENDPOINTS.USERS, { params });
  return {
    data: response.data,
    pagination: extractPaginationHeaders(response),
  };
}

/**
 * Lấy thông tin Student record theo StudentId hoặc lấy danh sách
 * Bảng Students chứa MajorId, AcademicYearId, Gender, v.v.
 */
export async function getStudents(params = {}) {
  const response = await api.get(API_ENDPOINTS.STUDENTS, { params });
  return {
    data: response.data,
    pagination: extractPaginationHeaders(response),
  };
}

/**
 * Lấy thông tin 1 sinh viên theo ID
 */
export async function getStudentById(studentId) {
  const response = await api.get(`${API_ENDPOINTS.STUDENTS}/${studentId}`);
  return response.data;
}

/**
 * Lấy danh sách ngành học (Majors)
 */
export async function getMajors(params = {}) {
  const response = await api.get(API_ENDPOINTS.MAJORS, { params });
  return {
    data: response.data,
    pagination: extractPaginationHeaders(response),
  };
}

/**
 * Lấy danh sách niên khóa (Academic Years)
 */
export async function getAcademicYears(params = {}) {
  const response = await api.get(API_ENDPOINTS.ACADEMIC_YEARS, { params });
  return {
    data: response.data,
    pagination: extractPaginationHeaders(response),
  };
}

/**
 * Lấy danh sách khoa (Faculties)
 */
export async function getFaculties(params = {}) {
  const response = await api.get(API_ENDPOINTS.FACULTIES, { params });
  return {
    data: response.data,
    pagination: extractPaginationHeaders(response),
  };
}

/**
 * Lấy kết quả thi (ExamResults)
 * Dữ liệu phẳng: chứa StudentId, SubjectTeachingExamId, Result
 */
export async function getExamResults(params = {}) {
  const response = await api.get(API_ENDPOINTS.EXAM_RESULTS, { params });
  return {
    data: response.data,
    pagination: extractPaginationHeaders(response),
  };
}

/**
 * Lấy danh sách môn học (Subjects)
 */
export async function getSubjects(params = {}) {
  const response = await api.get(API_ENDPOINTS.SUBJECTS, { params });
  return {
    data: response.data,
    pagination: extractPaginationHeaders(response),
  };
}

/**
 * Lấy danh sách kỳ thi (SubjectTeachingExams)
 * Chứa Name (tên kỳ thi), StartDate, EndDate, Type
 */
export async function getSubjectTeachingExams(params = {}) {
  const response = await api.get(API_ENDPOINTS.SUBJECT_TEACHING_EXAMS, { params });
  return {
    data: response.data,
    pagination: extractPaginationHeaders(response),
  };
}

/**
 * Lấy danh sách lớp học phần (SubjectTeachings)
 * Chứa SubjectId, Name (tên lớp)
 */
export async function getSubjectTeachings(params = {}) {
  const response = await api.get(API_ENDPOINTS.SUBJECT_TEACHINGS, { params });
  return {
    data: response.data,
    pagination: extractPaginationHeaders(response),
  };
}

/**
 * Lấy chi tiết đánh giá sinh viên (StudentEvaluationDetails)
 * Chứa EvaluationCriteriaId, StudentScore → cần map với EvaluationCriterias
 */
export async function getStudentEvaluationDetails(params = {}) {
  const response = await api.get(API_ENDPOINTS.STUDENT_EVALUATION_DETAILS, { params });
  return {
    data: response.data,
    pagination: extractPaginationHeaders(response),
  };
}

/**
 * Lấy tiêu chí đánh giá (EvaluationCriterias)
 */
export async function getEvaluationCriterias(params = {}) {
  const response = await api.get(API_ENDPOINTS.EVALUATION_CRITERIAS, { params });
  return {
    data: response.data,
    pagination: extractPaginationHeaders(response),
  };
}

/**
 * Lấy danh sách đánh giá sinh viên (StudentEvaluations)
 */
export async function getStudentEvaluations(params = {}) {
  const response = await api.get(API_ENDPOINTS.STUDENT_EVALUATIONS, { params });
  return {
    data: response.data,
    pagination: extractPaginationHeaders(response),
  };
}

/**
 * Lấy danh sách đồ án của sinh viên theo StudentId
 */
export async function getStudentProjects(studentId) {
  try {
    const response = await api.get(`${API_ENDPOINTS.PROJECTS}/student/${studentId}`);
    return response.data;
  } catch {
    return [];
  }
}

/**
 * Thêm mới đồ án
 */
export async function createProject(payload) {
  const response = await api.post(API_ENDPOINTS.PROJECTS, payload);
  return response.data;
}

/**
 * Xóa đồ án
 */
export async function deleteProject(id) {
  const response = await api.delete(`${API_ENDPOINTS.PROJECTS}/${id}`);
  return response.data;
}

/**
 * Lấy danh sách chứng chỉ của sinh viên theo StudentId
 * Backend route: GET /api/certificates?studentId={id}
 * (Student role tự động lọc theo user đang đăng nhập)
 */
export async function getStudentCertificates(studentId) {
  try {
    const response = await api.get(API_ENDPOINTS.CERTIFICATES, {
      params: studentId ? { studentId } : {},
    });
    return response.data;
  } catch {
    return [];
  }
}

/**
 * Thêm mới chứng chỉ
 */
export async function createCertificate(payload) {
  const response = await api.post(API_ENDPOINTS.CERTIFICATES, payload);
  return response.data;
}

/**
 * Xóa chứng chỉ
 */
export async function deleteCertificate(id) {
  const response = await api.delete(`${API_ENDPOINTS.CERTIFICATES}/${id}`);
  return response.data;
}

/**
 * Cập nhật thông tin sinh viên
 */
export async function updateStudent(id, payload) {
  const response = await api.put(`${API_ENDPOINTS.STUDENTS}/${id}`, payload);
  return response.data;
}

/**
 * Cập nhật thông tin user (email, mobile...)
 */
export async function updateUserApi(id, payload) {
  const response = await api.put(`${API_ENDPOINTS.USERS}/${id}`, payload);
  return response.data;
}

