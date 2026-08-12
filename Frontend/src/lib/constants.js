// ============================================================
// Design Tokens & Constants - AIGeneralCV
// Theo design.md & AIGeneralCV_Specification.md
// ============================================================

// --- Bảng Màu (Color Palette) ---
export const COLORS = {
  primary: '#3B82F6',
  secondary: '#1E293B',
  accentAi: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#1E293B',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
};

// --- API Endpoints ---
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },
  USERS: '/api/users',
  STUDENTS: '/api/students',
  MAJORS: '/api/majors',
  FACULTIES: '/api/faculties',
  SUBJECTS: '/api/subjects',
  EXAM_RESULTS: '/api/exam-results',
  SUBJECT_TEACHING_EXAMS: '/api/subject-teaching-exams',
  SUBJECT_TEACHINGS: '/api/subject-teachings',
  STUDENT_EVALUATIONS: '/api/student-evaluations',
  STUDENT_EVALUATION_DETAILS: '/api/student-evaluation-details',
  EVALUATION_CRITERIAS: '/api/evaluation-criterias',
  ACADEMIC_YEARS: '/api/academic-years',
  PROJECTS: '/api/projects',
  CERTIFICATES: '/api/certificates',
  CV: {
    GENERATE: '/api/cv/generate',
    HISTORY: '/api/cv',
    DETAIL: '/api/cv',
  },
};

// --- Vai trò người dùng ---
export const ROLES = {
  ADMIN: 99,
  TEACHER: 50,
  STUDENT: 1,
};

export const ROLE_LABELS = {
  99: 'Quản trị viên',
  50: 'Giảng viên',
  1: 'Sinh viên',
};

// --- Sidebar Menu Items ---
// Dùng các icon thiết thực và trực quan hơn
export const SIDEBAR_ITEMS = [
  { key: 'dashboard', label: 'Trang chủ', icon: 'Home', href: '/dashboard' },
  { key: 'profile', label: 'Hồ sơ sinh viên', icon: 'UserCheck', href: '/student/profile' },
  { key: 'cv-workspace', label: 'Không gian tạo CV', icon: 'FileSpreadsheet', href: '/cv-workspace' },
  { key: 'cv-history', label: 'Lịch sử ứng tuyển', icon: 'ClipboardList', href: '/cv-history' },
  { key: 'admin', label: 'Quản trị hệ thống', icon: 'ShieldCheck', href: '/admin', adminOnly: true },
  { key: 'settings', label: 'Cài đặt', icon: 'Settings', href: '/settings' },
];
