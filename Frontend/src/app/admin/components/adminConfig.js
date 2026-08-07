import {
  Users,
  UserCheck,
  GraduationCap,
  Building2,
  BookOpen,
  Layers,
  FileCheck2,
  ClipboardList,
  Star,
  Award,
  ListChecks,
} from 'lucide-react';

// ---- Tab definitions (11 tabs bao phủ toàn bộ bảng dữ liệu) ----
export const TABS = [
  { key: 'students', label: 'Sinh viên', icon: Users },
  { key: 'users', label: 'Tài khoản', icon: UserCheck },
  { key: 'majors', label: 'Ngành & Niên khóa', icon: GraduationCap },
  { key: 'faculties', label: 'Khoa', icon: Building2 },
  { key: 'subjects', label: 'Môn học', icon: BookOpen },
  { key: 'subjectTeachings', label: 'Lớp học phần', icon: Layers },
  { key: 'subjectTeachingExams', label: 'Kỳ thi', icon: FileCheck2 },
  { key: 'exams', label: 'Kết quả thi', icon: ClipboardList },
  { key: 'evaluationCriterias', label: 'Tiêu chí đánh giá', icon: Star },
  { key: 'studentEvaluations', label: 'Đánh giá SV', icon: Award },
  { key: 'studentEvaluationDetails', label: 'Chi tiết đánh giá', icon: ListChecks },
];

// ---- Shared Table Styles ----
export const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
};

export const theadRowStyle = {
  borderBottom: '2px solid var(--color-border)',
};

export const thStyle = {
  padding: 'var(--space-3) var(--space-4)',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

export const tdStyle = {
  padding: 'var(--space-3) var(--space-4)',
  fontSize: '13px',
  textAlign: 'center',
  verticalAlign: 'middle',
};

export const trStyle = {
  borderBottom: '1px solid var(--color-border-light)',
  transition: 'background var(--transition-fast)',
};

export const guidCellStyle = {
  padding: 'var(--space-3) var(--space-4)',
  textAlign: 'left',
  fontFamily: 'monospace',
  fontSize: '11px',
  color: 'var(--color-text-muted)',
  verticalAlign: 'middle',
};

export const sectionTitleStyle = {
  fontSize: '14px',
  fontWeight: 600,
  marginBottom: 'var(--space-3)',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
};

export const paginationBtnStyle = {
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '13px',
  color: 'var(--color-text-secondary)',
  fontFamily: 'var(--font-family)',
  transition: 'all var(--transition-fast)',
};

// Row hover handlers
export function trHoverIn(e) {
  e.currentTarget.style.background = 'var(--color-bg)';
}

export function trHoverOut(e) {
  e.currentTarget.style.background = 'transparent';
}
