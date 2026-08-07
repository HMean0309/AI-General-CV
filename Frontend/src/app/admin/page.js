'use client';

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
} from 'lucide-react';

import { TABS } from './components/adminConfig';
import KPICard from './components/AdminKPI';
import { EmptyState, Pagination } from './components/AdminPagination';
import {
  StudentsTable,
  UsersTable,
  MajorsAcademicTable,
  FacultiesTable,
  SubjectsTable,
  SubjectTeachingsTable,
  SubjectTeachingExamsTable,
  ExamResultsTable,
  EvaluationCriteriasTable,
  StudentEvaluationsTable,
  StudentEvaluationDetailsTable,
} from './components/AdminTables';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const [searchQuery, setSearchQuery] = useState('');

  // Raw data states — tất cả các bảng (GET-only để giám sát)
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
      // Gọi tất cả API song song — tải dữ liệu giám sát quan sát hệ thống
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
                  Tổng quan dữ liệu quản lý & giám sát hệ thống AIGeneralCV — {TABS.length} bảng dữ liệu
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
            {/* Tabs */}
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

                {/* Table Views */}
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
