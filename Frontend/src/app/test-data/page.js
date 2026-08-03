'use client';
// ============================================================
// Admin Dashboard — Quản trị hệ thống
// Trang dành riêng cho Admin (role=99) xem tổng quan toàn bộ
// dữ liệu trong hệ thống ngay sau khi đăng nhập.
// Cấu trúc: MainLayout (Sidebar + TopHeader + Content)
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES, ROLE_LABELS } from '@/lib/constants';
import {
  getStudents,
  getMajors,
  getAcademicYears,
  getExamResults,
  getSubjects,
  getUsers,
  getFaculties,
  getSubjectTeachings,
  getSubjectTeachingExams,
  getStudentEvaluations,
  getStudentEvaluationDetails,
  getEvaluationCriterias,
} from '@/services/studentService';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  UserCheck,
  Search,
  RefreshCw,
  AlertTriangle,
  Database,
  ChevronLeft,
  ChevronRight,
  Building2,
  Layers,
  FileCheck2,
  Star,
  ListChecks,
  Award,
} from 'lucide-react';

// ---- Tab definitions (11 tabs bao phủ toàn bộ bảng dữ liệu) ----
const TABS = [
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

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const [searchQuery, setSearchQuery] = useState('');

  // Raw data states — tất cả các bảng
  const [rawStudents, setRawStudents] = useState([]);
  const [rawMajors, setRawMajors] = useState([]);
  const [rawAcademicYears, setRawAcademicYears] = useState([]);
  const [rawExamResults, setRawExamResults] = useState([]);
  const [rawSubjects, setRawSubjects] = useState([]);
  const [rawUsers, setRawUsers] = useState([]);
  const [rawFaculties, setRawFaculties] = useState([]);
  const [rawSubjectTeachings, setRawSubjectTeachings] = useState([]);
  const [rawSubjectTeachingExams, setRawSubjectTeachingExams] = useState([]);
  const [rawStudentEvaluations, setRawStudentEvaluations] = useState([]);
  const [rawStudentEvaluationDetails, setRawStudentEvaluationDetails] = useState([]);
  const [rawEvaluationCriterias, setRawEvaluationCriterias] = useState([]);

  // Pagination states per tab
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // ---- Auto-load data on mount ----
  useEffect(() => {
    fetchAllData();
  }, []);

  // Reset page on tab/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  async function fetchAllData() {
    setLoading(true);
    setError('');
    try {
      // Gọi tất cả API song song — tải hết 1 lần để phân trang client-side
      const [
        studentsRes1,
        studentsRes2,
        majorsRes,
        academicYearsRes,
        examResultsRes,
        subjectsRes,
        usersRes1,
        usersRes2,
        facultiesRes,
        subjectTeachingsRes,
        subjectTeachingExamsRes,
        studentEvaluationsRes,
        studentEvaluationDetailsRes,
        evaluationCriteriasRes,
      ] = await Promise.all([
        getStudents({ page: 1, pageSize: 500 }),
        getStudents({ page: 2, pageSize: 500 }),
        getMajors({ pageSize: 500 }),
        getAcademicYears({ pageSize: 500 }),
        getExamResults({ pageSize: 500 }),
        getSubjects({ pageSize: 500 }),
        getUsers({ page: 1, pageSize: 500 }),
        getUsers({ page: 2, pageSize: 500 }),
        getFaculties({ pageSize: 500 }).catch(() => ({ data: [] })),
        getSubjectTeachings({ pageSize: 500 }).catch(() => ({ data: [] })),
        getSubjectTeachingExams({ pageSize: 500 }).catch(() => ({ data: [] })),
        getStudentEvaluations({ pageSize: 500 }).catch(() => ({ data: [] })),
        getStudentEvaluationDetails({ pageSize: 500 }).catch(() => ({ data: [] })),
        getEvaluationCriterias({ pageSize: 500 }).catch(() => ({ data: [] })),
      ]);

      setRawStudents([...(studentsRes1.data || []), ...(studentsRes2.data || [])]);
      setRawMajors(majorsRes.data || []);
      setRawAcademicYears(academicYearsRes.data || []);
      setRawExamResults(examResultsRes.data || []);
      setRawSubjects(subjectsRes.data || []);
      setRawUsers([...(usersRes1.data || []), ...(usersRes2.data || [])]);
      setRawFaculties(facultiesRes.data || []);
      setRawSubjectTeachings(subjectTeachingsRes.data || []);
      setRawSubjectTeachingExams(subjectTeachingExamsRes.data || []);
      setRawStudentEvaluations(studentEvaluationsRes.data || []);
      setRawStudentEvaluationDetails(studentEvaluationDetailsRes.data || []);
      setRawEvaluationCriterias(evaluationCriteriasRes.data || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.status === 401
          ? 'Không có quyền truy cập. Vui lòng đăng nhập với tài khoản Admin.'
          : 'Lỗi khi tải dữ liệu: ' + (err.message || 'Không xác định')
      );
    } finally {
      setLoading(false);
    }
  }

  // ---- Helper maps ----
  function getMajorName(majorId) {
    const major = rawMajors.find((m) => m.id === majorId);
    return major ? major.name : '—';
  }

  function getUserFullName(userId) {
    const u = rawUsers.find((x) => x.id === userId);
    return u ? u.fullName : '—';
  }

  function getSubjectName(subjectId) {
    const s = rawSubjects.find((x) => x.id === subjectId);
    return s ? s.name : '—';
  }

  function getCriteriaName(criteriaId) {
    const c = rawEvaluationCriterias.find((x) => x.id === criteriaId);
    return c ? c.name : '—';
  }

  function getStudentNameById(studentId) {
    const st = rawStudents.find((x) => x.id === studentId);
    if (!st) return '—';
    return getUserFullName(st.userId);
  }

  // ---- Filtered data based on search ----
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const filterStudents = () => {
      if (!q) return rawStudents;
      return rawStudents.filter((st) => {
        const userDetail = rawUsers.find((u) => u.id === st.userId);
        const name = (userDetail?.fullName || '').toLowerCase();
        const mssv = (userDetail?.userInternalId || '').toLowerCase();
        const major = getMajorName(st.majorId).toLowerCase();
        return name.includes(q) || mssv.includes(q) || major.includes(q);
      });
    };

    const filterMajors = () => {
      if (!q) return rawMajors;
      return rawMajors.filter((m) => m.name?.toLowerCase().includes(q));
    };

    const filterSubjects = () => {
      if (!q) return rawSubjects;
      return rawSubjects.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.subjectCode?.toLowerCase().includes(q)
      );
    };

    const filterExams = () => {
      if (!q) return rawExamResults;
      return rawExamResults.filter((r) => {
        const student = rawStudents.find((st) => st.id === r.studentId);
        const u = student ? rawUsers.find((x) => x.id === student.userId) : null;
        const name = (u?.fullName || '').toLowerCase();
        return name.includes(q) || (r.notes || '').toLowerCase().includes(q);
      });
    };

    const filterUsers = () => {
      if (!q) return rawUsers;
      return rawUsers.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.userName?.toLowerCase().includes(q) ||
          u.userInternalId?.toLowerCase().includes(q)
      );
    };

    const filterFaculties = () => {
      if (!q) return rawFaculties;
      return rawFaculties.filter((f) => f.name?.toLowerCase().includes(q));
    };

    const filterSubjectTeachings = () => {
      if (!q) return rawSubjectTeachings;
      return rawSubjectTeachings.filter(
        (st) => st.name?.toLowerCase().includes(q) || getSubjectName(st.subjectId).toLowerCase().includes(q)
      );
    };

    const filterSubjectTeachingExams = () => {
      if (!q) return rawSubjectTeachingExams;
      return rawSubjectTeachingExams.filter(
        (e) => e.name?.toLowerCase().includes(q)
      );
    };

    const filterStudentEvaluations = () => {
      if (!q) return rawStudentEvaluations;
      return rawStudentEvaluations.filter((ev) => {
        const name = getStudentNameById(ev.studentId).toLowerCase();
        return name.includes(q);
      });
    };

    const filterStudentEvaluationDetails = () => {
      if (!q) return rawStudentEvaluationDetails;
      return rawStudentEvaluationDetails.filter(
        (d) =>
          (d.evaluationName || '').toLowerCase().includes(q) ||
          getCriteriaName(d.evaluationCriteriaId).toLowerCase().includes(q)
      );
    };

    const filterEvaluationCriterias = () => {
      if (!q) return rawEvaluationCriterias;
      return rawEvaluationCriterias.filter(
        (c) => c.name?.toLowerCase().includes(q)
      );
    };

    return {
      students: filterStudents(),
      majors: filterMajors(),
      subjects: filterSubjects(),
      exams: filterExams(),
      users: filterUsers(),
      faculties: filterFaculties(),
      subjectTeachings: filterSubjectTeachings(),
      subjectTeachingExams: filterSubjectTeachingExams(),
      studentEvaluations: filterStudentEvaluations(),
      studentEvaluationDetails: filterStudentEvaluationDetails(),
      evaluationCriterias: filterEvaluationCriterias(),
    };
  }, [searchQuery, rawStudents, rawMajors, rawSubjects, rawExamResults, rawUsers, rawFaculties, rawSubjectTeachings, rawSubjectTeachingExams, rawStudentEvaluations, rawStudentEvaluationDetails, rawEvaluationCriterias]);

  // ---- Pagination helpers ----
  function getCurrentTabData() {
    switch (activeTab) {
      case 'students': return filteredData.students;
      case 'majors': return filteredData.majors;
      case 'subjects': return filteredData.subjects;
      case 'exams': return filteredData.exams;
      case 'users': return filteredData.users;
      case 'faculties': return filteredData.faculties;
      case 'subjectTeachings': return filteredData.subjectTeachings;
      case 'subjectTeachingExams': return filteredData.subjectTeachingExams;
      case 'studentEvaluations': return filteredData.studentEvaluations;
      case 'studentEvaluationDetails': return filteredData.studentEvaluationDetails;
      case 'evaluationCriterias': return filteredData.evaluationCriterias;
      default: return [];
    }
  }

  const totalItems = getCurrentTabData().length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const paginatedData = getCurrentTabData().slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ---- Check admin role ----
  const isAdmin = user?.role === ROLES.ADMIN;

  // ---- Tổng hợp tất cả bản ghi cho KPI ----
  const totalRecords =
    rawStudents.length + rawUsers.length + rawMajors.length + rawAcademicYears.length +
    rawSubjects.length + rawExamResults.length + rawFaculties.length +
    rawSubjectTeachings.length + rawSubjectTeachingExams.length +
    rawStudentEvaluations.length + rawStudentEvaluationDetails.length +
    rawEvaluationCriterias.length;

  return (
    <MainLayout>
      <div className="fade-in" style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Non-admin warning */}
        {!isAdmin && (
          <div
            style={{
              padding: 'var(--space-6)',
              background: 'var(--color-warning-light)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-6)',
              border: '1px solid var(--color-warning)',
            }}
          >
            <AlertTriangle size={22} style={{ color: 'var(--color-warning)', minWidth: 22 }} />
            <div>
              <p style={{ fontWeight: 600, color: '#92400E', fontSize: '14px' }}>
                Cảnh báo: Tài khoản hiện tại không phải Quản trị viên
              </p>
              <p style={{ fontSize: '13px', color: '#A16207', marginTop: 'var(--space-1)' }}>
                Một số dữ liệu có thể bị hạn chế quyền truy cập từ phía server.
              </p>
            </div>
          </div>
        )}

        {/* ===== BANNER ===== */}
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: 'var(--space-8)',
            marginBottom: 'var(--space-8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--color-accent-ai), var(--color-primary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={22} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                  Bảng điều khiển quản trị
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                  Tổng quan toàn bộ dữ liệu hệ thống AIGeneralCV — {TABS.length} bảng dữ liệu
                </p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Xin chào, <strong>{user?.fullName || 'Admin'}</strong>
              </p>
              <span className="badge badge-ai" style={{ fontSize: '11px', marginTop: 'var(--space-1)' }}>
                {ROLE_LABELS[user?.role] || 'N/A'}
              </span>
            </div>
            <button
              className="btn btn-outline"
              onClick={fetchAllData}
              disabled={loading}
              style={{ fontSize: '13px', gap: 'var(--space-2)' }}
            >
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              <span>{loading ? 'Đang tải...' : 'Làm mới'}</span>
            </button>
          </div>
        </div>

        {/* ===== ERROR STATE ===== */}
        {error && (
          <div
            style={{
              padding: 'var(--space-6)',
              background: 'var(--color-danger-light)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--color-danger)',
              marginBottom: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
            }}
          >
            <AlertTriangle size={20} style={{ minWidth: 20 }} />
            <span style={{ fontSize: '14px', flex: 1 }}>{error}</span>
            <button className="btn btn-outline" onClick={fetchAllData} style={{ fontSize: '13px' }}>
              Thử lại
            </button>
          </div>
        )}

        {/* ===== KPI CARDS ===== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-8)',
          }}
        >
          {loading ? (
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />
              ))}
            </>
          ) : (
            <>
              <KPICard
                icon={<Users size={20} />}
                iconColor="var(--color-primary)"
                iconBg="var(--color-primary-light)"
                label="Sinh viên"
                value={rawStudents.length}
              />
              <KPICard
                icon={<UserCheck size={20} />}
                iconColor="var(--color-secondary)"
                iconBg="var(--color-border-light)"
                label="Tài khoản"
                value={rawUsers.length}
              />
              <KPICard
                icon={<GraduationCap size={20} />}
                iconColor="var(--color-accent-ai)"
                iconBg="#EDE9FE"
                label="Ngành đào tạo"
                value={rawMajors.length}
              />
              <KPICard
                icon={<BookOpen size={20} />}
                iconColor="var(--color-success)"
                iconBg="var(--color-success-light)"
                label="Môn học"
                value={rawSubjects.length}
              />
              <KPICard
                icon={<ClipboardList size={20} />}
                iconColor="var(--color-warning)"
                iconBg="var(--color-warning-light)"
                label="Kết quả thi"
                value={rawExamResults.length}
              />
              <KPICard
                icon={<Database size={20} />}
                iconColor="var(--color-danger)"
                iconBg="var(--color-danger-light)"
                label="Tổng bản ghi"
                value={totalRecords}
              />
            </>
          )}
        </div>

        {/* ===== MAIN DATA SECTION ===== */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {/* Tab header + Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-4) var(--space-6)',
              borderBottom: '1px solid var(--color-border)',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
            }}
          >
            {/* Tabs — scrollable khi có nhiều tabs */}
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-1)',
                overflowX: 'auto',
                flex: 1,
                paddingBottom: 'var(--space-1)',
              }}
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                // Hiển thị count badge cho mỗi tab
                const tabCount = (() => {
                  switch (tab.key) {
                    case 'students': return rawStudents.length;
                    case 'users': return rawUsers.length;
                    case 'majors': return rawMajors.length;
                    case 'faculties': return rawFaculties.length;
                    case 'subjects': return rawSubjects.length;
                    case 'subjectTeachings': return rawSubjectTeachings.length;
                    case 'subjectTeachingExams': return rawSubjectTeachingExams.length;
                    case 'exams': return rawExamResults.length;
                    case 'evaluationCriterias': return rawEvaluationCriterias.length;
                    case 'studentEvaluations': return rawStudentEvaluations.length;
                    case 'studentEvaluationDetails': return rawStudentEvaluationDetails.length;
                    default: return 0;
                  }
                })();

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: isActive ? 'var(--color-primary-light)' : 'transparent',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-family)',
                      transition: 'all var(--transition-fast)',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'var(--color-bg)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                    {!loading && tabCount > 0 && (
                      <span
                        style={{
                          fontSize: '10px',
                          background: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                          color: isActive ? 'white' : 'var(--color-text-muted)',
                          borderRadius: 'var(--radius-full)',
                          padding: '1px 6px',
                          fontWeight: 600,
                          lineHeight: '16px',
                        }}
                      >
                        {tabCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', minWidth: 220 }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{
                  paddingLeft: 36,
                  fontSize: '13px',
                  height: 36,
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                }}
              />
            </div>
          </div>

          {/* Table content */}
          <div style={{ padding: 'var(--space-6)', minHeight: 400 }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="skeleton" style={{ height: 44 }} />
                ))}
              </div>
            ) : (
              <>
                {/* Data count badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Database size={16} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      <strong>{totalItems}</strong> bản ghi
                      {searchQuery && ` (lọc từ "${searchQuery}")`}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Trang {currentPage}/{totalPages}
                  </span>
                </div>

                {/* Table */}
                {totalItems === 0 ? (
                  <EmptyState />
                ) : (
                  <>
                    {activeTab === 'students' && (
                      <StudentsTable
                        data={paginatedData}
                        offset={(currentPage - 1) * ITEMS_PER_PAGE}
                        rawUsers={rawUsers}
                        getMajorName={getMajorName}
                      />
                    )}
                    {activeTab === 'majors' && (
                      <MajorsAcademicTable
                        majors={paginatedData}
                        academicYears={rawAcademicYears}
                        offset={(currentPage - 1) * ITEMS_PER_PAGE}
                      />
                    )}
                    {activeTab === 'subjects' && (
                      <SubjectsTable data={paginatedData} offset={(currentPage - 1) * ITEMS_PER_PAGE} />
                    )}
                    {activeTab === 'exams' && (
                      <ExamResultsTable
                        data={paginatedData}
                        offset={(currentPage - 1) * ITEMS_PER_PAGE}
                        rawStudents={rawStudents}
                        rawUsers={rawUsers}
                      />
                    )}
                    {activeTab === 'users' && (
                      <UsersTable data={paginatedData} offset={(currentPage - 1) * ITEMS_PER_PAGE} />
                    )}
                    {activeTab === 'faculties' && (
                      <FacultiesTable data={paginatedData} offset={(currentPage - 1) * ITEMS_PER_PAGE} />
                    )}
                    {activeTab === 'subjectTeachings' && (
                      <SubjectTeachingsTable
                        data={paginatedData}
                        offset={(currentPage - 1) * ITEMS_PER_PAGE}
                        getSubjectName={getSubjectName}
                      />
                    )}
                    {activeTab === 'subjectTeachingExams' && (
                      <SubjectTeachingExamsTable data={paginatedData} offset={(currentPage - 1) * ITEMS_PER_PAGE} />
                    )}
                    {activeTab === 'evaluationCriterias' && (
                      <EvaluationCriteriasTable data={paginatedData} offset={(currentPage - 1) * ITEMS_PER_PAGE} />
                    )}
                    {activeTab === 'studentEvaluations' && (
                      <StudentEvaluationsTable
                        data={paginatedData}
                        offset={(currentPage - 1) * ITEMS_PER_PAGE}
                        getStudentNameById={getStudentNameById}
                      />
                    )}
                    {activeTab === 'studentEvaluationDetails' && (
                      <StudentEvaluationDetailsTable
                        data={paginatedData}
                        offset={(currentPage - 1) * ITEMS_PER_PAGE}
                        getCriteriaName={getCriteriaName}
                      />
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Inline styles for spin animation */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </MainLayout>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

// ---- KPI Card ----
function KPICard({ icon, iconColor, iconBg, label, value }) {
  return (
    <div
      className="card"
      style={{
        padding: 'var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        border: '1px solid var(--color-border)',
        boxShadow: 'none',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          minWidth: 40,
          borderRadius: 'var(--radius-md)',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: iconColor,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: 2 }}>
          {label}
        </p>
        <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ---- Empty State ----
function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-6)', color: 'var(--color-text-muted)' }}>
      <Database size={48} style={{ margin: '0 auto var(--space-4)', opacity: 0.2 }} />
      <p style={{ fontSize: '15px', fontWeight: 500 }}>Không tìm thấy dữ liệu</p>
      <p style={{ fontSize: '13px', marginTop: 'var(--space-2)' }}>Bảng này chưa có dữ liệu hoặc thử thay đổi từ khóa tìm kiếm</p>
    </div>
  );
}

// ---- Pagination ----
function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    if (end - start < 4) {
      if (start === 1) end = Math.min(totalPages, start + 4);
      else start = Math.max(1, end - 4);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        marginTop: 'var(--space-6)',
        paddingTop: 'var(--space-4)',
        borderTop: '1px solid var(--color-border-light)',
      }}
    >
      <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={paginationBtnStyle}>
        <ChevronLeft size={16} />
      </button>
      {getPageNumbers().map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            ...paginationBtnStyle,
            background: p === currentPage ? 'var(--color-primary)' : 'transparent',
            color: p === currentPage ? 'white' : 'var(--color-text-secondary)',
            fontWeight: p === currentPage ? 600 : 400,
            border: p === currentPage ? 'none' : '1px solid var(--color-border)',
          }}
        >
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} style={paginationBtnStyle}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ============================================================
// TABLE COMPONENTS — 11 bảng dữ liệu
// ============================================================

// ---- 1. Students Table ----
function StudentsTable({ data, offset, rawUsers, getMajorName }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr style={theadRowStyle}>
            <th style={thStyle}>STT</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Họ và tên</th>
            <th style={thStyle}>MSSV</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Ngành học</th>
            <th style={thStyle}>Quê quán</th>
            <th style={thStyle}>Giới tính</th>
            <th style={thStyle}>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {data.map((st, idx) => {
            const userDetail = rawUsers.find((u) => u.id === st.userId);
            return (
              <tr key={st.id} style={trStyle} onMouseEnter={trHoverIn} onMouseLeave={trHoverOut}>
                <td style={tdStyle}>{offset + idx + 1}</td>
                <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 600, color: 'var(--color-secondary)' }}>
                  {userDetail?.fullName || '—'}
                </td>
                <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px' }}>
                  {userDetail?.userInternalId || '—'}
                </td>
                <td style={{ ...tdStyle, textAlign: 'left' }}>{getMajorName(st.majorId)}</td>
                <td style={tdStyle}>{st.hometown || st.placeOfBirth || '—'}</td>
                <td style={tdStyle}>
                  <span className={`badge ${st.gender === 0 ? 'badge-primary' : st.gender === 1 ? 'badge-warning' : ''}`}>
                    {st.gender === 0 ? 'Nam' : st.gender === 1 ? 'Nữ' : '—'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span className={`badge ${st.studyStatus === 1 ? 'badge-success' : 'badge-warning'}`}>
                    {st.studyStatus === 1 ? 'Đang học' : st.studyStatus || '—'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---- 2. Users Table ----
function UsersTable({ data, offset }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr style={theadRowStyle}>
            <th style={thStyle}>STT</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Họ và tên</th>
            <th style={thStyle}>Tên đăng nhập</th>
            <th style={thStyle}>Mã nội bộ</th>
            <th style={thStyle}>Vai trò</th>
          </tr>
        </thead>
        <tbody>
          {data.map((u, idx) => (
            <tr key={u.id} style={trStyle} onMouseEnter={trHoverIn} onMouseLeave={trHoverOut}>
              <td style={tdStyle}>{offset + idx + 1}</td>
              <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 600 }}>{u.fullName || '—'}</td>
              <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px' }}>{u.userName || '—'}</td>
              <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px' }}>{u.userInternalId || '—'}</td>
              <td style={tdStyle}>
                <span className={`badge ${u.role === 99 ? 'badge-ai' : u.role === 50 ? 'badge-warning' : 'badge-primary'}`}>
                  {ROLE_LABELS[u.role] || `Role ${u.role}`}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- 3. Majors + Academic Years Table ----
function MajorsAcademicTable({ majors, academicYears, offset }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
      {/* Majors */}
      <div>
        <h4 style={sectionTitleStyle}>
          <GraduationCap size={16} style={{ color: 'var(--color-accent-ai)' }} />
          Danh sách ngành ({majors.length})
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRowStyle}>
                <th style={thStyle}>STT</th>
                <th style={{ ...thStyle, textAlign: 'left' }}>Tên ngành</th>
                <th style={{ ...thStyle, textAlign: 'left', fontSize: '11px', color: 'var(--color-text-muted)' }}>ID</th>
              </tr>
            </thead>
            <tbody>
              {majors.map((m, idx) => (
                <tr key={m.id} style={trStyle} onMouseEnter={trHoverIn} onMouseLeave={trHoverOut}>
                  <td style={tdStyle}>{offset + idx + 1}</td>
                  <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 500 }}>{m.name}</td>
                  <td style={guidCellStyle}>{m.id?.substring(0, 8)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Academic Years */}
      <div>
        <h4 style={sectionTitleStyle}>
          <ClipboardList size={16} style={{ color: 'var(--color-success)' }} />
          Danh sách niên khóa ({academicYears.length})
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRowStyle}>
                <th style={thStyle}>STT</th>
                <th style={{ ...thStyle, textAlign: 'left' }}>Niên khóa</th>
                <th style={{ ...thStyle, textAlign: 'left', fontSize: '11px', color: 'var(--color-text-muted)' }}>ID</th>
              </tr>
            </thead>
            <tbody>
              {academicYears.map((ay, idx) => (
                <tr key={ay.id} style={trStyle} onMouseEnter={trHoverIn} onMouseLeave={trHoverOut}>
                  <td style={tdStyle}>{idx + 1}</td>
                  <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 500 }}>{ay.name}</td>
                  <td style={guidCellStyle}>{ay.id?.substring(0, 8)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---- 4. Faculties Table ----
function FacultiesTable({ data, offset }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr style={theadRowStyle}>
            <th style={thStyle}>STT</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Tên khoa</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>ID</th>
          </tr>
        </thead>
        <tbody>
          {data.map((f, idx) => (
            <tr key={f.id} style={trStyle} onMouseEnter={trHoverIn} onMouseLeave={trHoverOut}>
              <td style={tdStyle}>{offset + idx + 1}</td>
              <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 500 }}>{f.name || '—'}</td>
              <td style={guidCellStyle}>{f.id?.substring(0, 8)}...</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- 5. Subjects Table ----
function SubjectsTable({ data, offset }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr style={theadRowStyle}>
            <th style={thStyle}>STT</th>
            <th style={thStyle}>Mã môn</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Tên môn học</th>
            <th style={thStyle}>Tín chỉ</th>
          </tr>
        </thead>
        <tbody>
          {data.map((s, idx) => (
            <tr key={s.id} style={trStyle} onMouseEnter={trHoverIn} onMouseLeave={trHoverOut}>
              <td style={tdStyle}>{offset + idx + 1}</td>
              <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 500 }}>{s.subjectCode || '—'}</td>
              <td style={{ ...tdStyle, textAlign: 'left' }}>{s.name}</td>
              <td style={tdStyle}>
                <span className="badge badge-primary">{s.creditPoint ?? '—'}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- 6. SubjectTeachings Table (Lớp học phần) ----
function SubjectTeachingsTable({ data, offset, getSubjectName }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr style={theadRowStyle}>
            <th style={thStyle}>STT</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Tên lớp học phần</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Môn học</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>ID</th>
          </tr>
        </thead>
        <tbody>
          {data.map((st, idx) => (
            <tr key={st.id} style={trStyle} onMouseEnter={trHoverIn} onMouseLeave={trHoverOut}>
              <td style={tdStyle}>{offset + idx + 1}</td>
              <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 500 }}>{st.name || '—'}</td>
              <td style={{ ...tdStyle, textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                {getSubjectName(st.subjectId)}
              </td>
              <td style={guidCellStyle}>{st.id?.substring(0, 8)}...</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- 7. SubjectTeachingExams Table (Kỳ thi) ----
function SubjectTeachingExamsTable({ data, offset }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr style={theadRowStyle}>
            <th style={thStyle}>STT</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Tên kỳ thi</th>
            <th style={thStyle}>Loại</th>
            <th style={thStyle}>Ngày bắt đầu</th>
            <th style={thStyle}>Ngày kết thúc</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>ID</th>
          </tr>
        </thead>
        <tbody>
          {data.map((e, idx) => (
            <tr key={e.id} style={trStyle} onMouseEnter={trHoverIn} onMouseLeave={trHoverOut}>
              <td style={tdStyle}>{offset + idx + 1}</td>
              <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 500 }}>{e.name || '—'}</td>
              <td style={tdStyle}>
                <span className="badge badge-primary">{e.type ?? '—'}</span>
              </td>
              <td style={tdStyle}>{e.startDate ? new Date(e.startDate).toLocaleDateString('vi-VN') : '—'}</td>
              <td style={tdStyle}>{e.endDate ? new Date(e.endDate).toLocaleDateString('vi-VN') : '—'}</td>
              <td style={guidCellStyle}>{e.id?.substring(0, 8)}...</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- 8. ExamResults Table ----
function ExamResultsTable({ data, offset, rawStudents, rawUsers }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr style={theadRowStyle}>
            <th style={thStyle}>STT</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Sinh viên</th>
            <th style={thStyle}>Điểm thi</th>
            <th style={thStyle}>Tổng kết</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, idx) => {
            const student = rawStudents.find((st) => st.id === r.studentId);
            const u = student ? rawUsers.find((x) => x.id === student.userId) : null;
            const score = r.result;
            const combined = r.combinedResult;
            return (
              <tr key={r.id} style={trStyle} onMouseEnter={trHoverIn} onMouseLeave={trHoverOut}>
                <td style={tdStyle}>{offset + idx + 1}</td>
                <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 600 }}>{u?.fullName || '—'}</td>
                <td style={tdStyle}>
                  <span
                    className={`badge ${score >= 8 ? 'badge-success' : score >= 5 ? 'badge-warning' : 'badge-primary'}`}
                  >
                    {score != null ? Number(score).toFixed(1) : '—'}
                  </span>
                </td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>
                  {combined != null ? Number(combined).toFixed(1) : '—'}
                </td>
                <td style={{ ...tdStyle, textAlign: 'left', color: 'var(--color-text-secondary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.notes || '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---- 9. EvaluationCriterias Table (Tiêu chí đánh giá PLO/CLO) ----
function EvaluationCriteriasTable({ data, offset }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr style={theadRowStyle}>
            <th style={thStyle}>STT</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Tên tiêu chí</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Mô tả</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>ID</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c, idx) => (
            <tr key={c.id} style={trStyle} onMouseEnter={trHoverIn} onMouseLeave={trHoverOut}>
              <td style={tdStyle}>{offset + idx + 1}</td>
              <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 500 }}>{c.name || '—'}</td>
              <td style={{ ...tdStyle, textAlign: 'left', color: 'var(--color-text-secondary)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.description || '—'}
              </td>
              <td style={guidCellStyle}>{c.id?.substring(0, 8)}...</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- 10. StudentEvaluations Table ----
function StudentEvaluationsTable({ data, offset, getStudentNameById }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr style={theadRowStyle}>
            <th style={thStyle}>STT</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Sinh viên</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Tên đánh giá</th>
            <th style={thStyle}>Điểm tổng</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>ID</th>
          </tr>
        </thead>
        <tbody>
          {data.map((ev, idx) => (
            <tr key={ev.id} style={trStyle} onMouseEnter={trHoverIn} onMouseLeave={trHoverOut}>
              <td style={tdStyle}>{offset + idx + 1}</td>
              <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 600 }}>
                {getStudentNameById(ev.studentId)}
              </td>
              <td style={{ ...tdStyle, textAlign: 'left' }}>{ev.name || '—'}</td>
              <td style={tdStyle}>
                {ev.totalScore != null ? (
                  <span className={`badge ${ev.totalScore >= 8 ? 'badge-success' : ev.totalScore >= 5 ? 'badge-warning' : 'badge-primary'}`}>
                    {Number(ev.totalScore).toFixed(1)}
                  </span>
                ) : '—'}
              </td>
              <td style={guidCellStyle}>{ev.id?.substring(0, 8)}...</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- 11. StudentEvaluationDetails Table ----
function StudentEvaluationDetailsTable({ data, offset, getCriteriaName }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr style={theadRowStyle}>
            <th style={thStyle}>STT</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Tên đánh giá</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Tiêu chí</th>
            <th style={thStyle}>Điểm SV</th>
            <th style={thStyle}>Điểm tối đa</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>ID</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, idx) => (
            <tr key={d.id} style={trStyle} onMouseEnter={trHoverIn} onMouseLeave={trHoverOut}>
              <td style={tdStyle}>{offset + idx + 1}</td>
              <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 500 }}>{d.evaluationName || '—'}</td>
              <td style={{ ...tdStyle, textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                {getCriteriaName(d.evaluationCriteriaId)}
              </td>
              <td style={tdStyle}>
                {d.studentScore != null ? (
                  <span className={`badge ${d.studentScore >= 8 ? 'badge-success' : d.studentScore >= 5 ? 'badge-warning' : 'badge-primary'}`}>
                    {Number(d.studentScore).toFixed(1)}
                  </span>
                ) : '—'}
              </td>
              <td style={tdStyle}>{d.maxScore != null ? d.maxScore : '—'}</td>
              <td style={guidCellStyle}>{d.id?.substring(0, 8)}...</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// SHARED STYLES
// ============================================================

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
};

const theadRowStyle = {
  borderBottom: '2px solid var(--color-border)',
};

const thStyle = {
  padding: 'var(--space-3) var(--space-4)',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyle = {
  padding: 'var(--space-3) var(--space-4)',
  fontSize: '13px',
  textAlign: 'center',
  verticalAlign: 'middle',
};

const trStyle = {
  borderBottom: '1px solid var(--color-border-light)',
  transition: 'background var(--transition-fast)',
};

const guidCellStyle = {
  padding: 'var(--space-3) var(--space-4)',
  textAlign: 'left',
  fontFamily: 'monospace',
  fontSize: '11px',
  color: 'var(--color-text-muted)',
  verticalAlign: 'middle',
};

const sectionTitleStyle = {
  fontSize: '14px',
  fontWeight: 600,
  marginBottom: 'var(--space-3)',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
};

const paginationBtnStyle = {
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
function trHoverIn(e) {
  e.currentTarget.style.background = 'var(--color-bg)';
}
function trHoverOut(e) {
  e.currentTarget.style.background = 'transparent';
}
