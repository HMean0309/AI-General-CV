'use client';

import { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import SubTabs from '@/components/ui/SubTabs';
import { useAuth } from '@/contexts/AuthContext';
import {
  User, GraduationCap, BookOpen, FolderGit2, Award,
  Lightbulb, ExternalLink, ChevronRight, Clock,
  Plus, Trash2, X, Save, AlertCircle, ShieldCheck,
} from 'lucide-react';
import {
  getStudents, getMajors, getAcademicYears,
  getExamResults, getSubjects,
  getSubjectTeachingExams,
  getStudentEvaluations, getStudentEvaluationDetails,
  getEvaluationCriterias,
  getStudentProjects, createProject, deleteProject,
  getStudentCertificates, createCertificate, deleteCertificate,
  updateStudent, updateUserApi,
} from '@/services/studentService';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, Cell, CartesianGrid,
} from 'recharts';

const TABS = [
  { key: 'overview', label: 'Tổng quan hồ sơ' },
  { key: 'plo', label: 'Chuẩn đầu ra (PLO/CLO)' },
  { key: 'projects', label: 'Dự án & Đồ án' },
  { key: 'certificates', label: 'Chứng chỉ' },
  { key: 'grades', label: 'Kết quả học tập' },
];

export default function StudentProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Data states
  const [studentData, setStudentData] = useState(null);
  const [majorName, setMajorName] = useState('');
  const [academicYearName, setAcademicYearName] = useState('');
  const [examResults, setExamResults] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [evaluationDetails, setEvaluationDetails] = useState([]);
  const [evaluationCriterias, setEvaluationCriterias] = useState([]);
  const [examMap, setExamMap] = useState({});

  // Projects & Certificates states
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [certificatesLoading, setCertificatesLoading] = useState(false);

  // Contact info editing states
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    email: '',
    phone: '',
    githubUrl: '',
    linkedinUrl: '',
  });

  useEffect(() => {
    setInfoForm({
      email: user?.email || user?.userName || '',
      phone: user?.mobile || user?.phoneNumber || '',
      githubUrl: studentData?.githubUrl || '',
      linkedinUrl: studentData?.linkedinUrl || '',
    });
  }, [user, studentData]);

  async function handleSaveInfo() {
    try {
      // 1. Cập nhật Backend cho Student (githubUrl, linkedinUrl)
      if (studentData) {
        const updatedStudentPayload = {
          ...studentData,
          githubUrl: infoForm.githubUrl,
          linkedinUrl: infoForm.linkedinUrl,
        };
        await updateStudent(studentData.id, updatedStudentPayload);
      }

      // 2. Cập nhật Backend cho User (mobile)
      if (user) {
        const updatedUserPayload = {
          ...user,
          mobile: infoForm.phone,
        };
        await updateUserApi(user.id, updatedUserPayload).catch(() => { });
      }

      // 3. Cập nhật AuthContext + localStorage
      if (user && updateUser) {
        updateUser({
          ...user,
          email: infoForm.email,
          mobile: infoForm.phone,
          phoneNumber: infoForm.phone,
        });
      }

      // 4. Cập nhật studentData local
      setStudentData((prev) => ({
        ...(prev || {}),
        githubUrl: infoForm.githubUrl,
        linkedinUrl: infoForm.linkedinUrl,
      }));

      setIsEditingInfo(false);
    } catch (err) {
      console.error('Lỗi khi lưu thông tin:', err);
      alert('Không thể lưu thông tin lên hệ thống. Vui lòng kiểm tra lại backend.');
    }
  }

  useEffect(() => {
    if (user) fetchProfileData();
  }, [user]);

  async function fetchProfileData() {
    setLoading(true);
    setError('');
    try {
      // 1. Lấy Student record bằng userId của user đang đăng nhập
      const studentsRes = await getStudents({ userId: user.id });
      const myStudent = studentsRes.data[0] || null;
      setStudentData(myStudent);

      if (myStudent) {
        // 2. Lọc các bảng liên quan theo studentId trực tiếp tại Database Server
        const [
          majorsRes,
          academicYearsRes,
          examResultsRes,
          subjectsRes,
          evaluationCriteriasRes,
          evalRes
        ] = await Promise.all([
          getMajors({ pageSize: 500 }),
          getAcademicYears({ pageSize: 500 }),
          getExamResults({ studentId: myStudent.id, pageSize: 500 }),
          getSubjects({ pageSize: 500 }),
          getEvaluationCriterias({ pageSize: 500 }),
          getStudentEvaluations({ studentId: myStudent.id, pageSize: 500 })
        ]);

        const major = majorsRes.data.find((m) => m.id === myStudent.majorId);
        setMajorName(major?.name || 'Chưa xác định');

        const ay = academicYearsRes.data.find((a) => a.id === myStudent.academicYearId);
        setAcademicYearName(ay?.name || 'Chưa xác định');

        setExamResults(examResultsRes.data);
        setSubjects(subjectsRes.data);
        setEvaluationCriterias(evaluationCriteriasRes.data);

        // Lấy tên kỳ thi từ SubjectTeachingExams
        const examIds = [...new Set(examResultsRes.data.map(r => r.subjectTeachingExamId).filter(Boolean))];
        const examNameMap = {};
        if (examIds.length > 0) {
          const examPromises = examIds.map(id => getSubjectTeachingExams({ id, pageSize: 1 }).catch(() => ({ data: [] })));
          const examResList = await Promise.all(examPromises);
          examResList.forEach(res => {
            if (res.data?.[0]) {
              examNameMap[res.data[0].id] = res.data[0].name;
            }
          });
        }
        setExamMap(examNameMap);

        // 3. Lấy chi tiết đánh giá (PLO/CLO)
        const myEvals = evalRes.data;
        if (myEvals.length > 0) {
          const detailsPromises = myEvals.map(e =>
            getStudentEvaluationDetails({ studentEvaluationId: e.id, pageSize: 500 })
          );
          const detailsResList = await Promise.all(detailsPromises);
          const myDetails = detailsResList.flatMap(r => r.data);
          setEvaluationDetails(myDetails);
        }

        // 4. Load Projects & Certificates từ API
        await Promise.all([
          fetchProjects(myStudent.id),
          fetchCertificates(myStudent.id),
        ]);
      } else {
        const [subjectsRes] = await Promise.all([getSubjects({ pageSize: 500 })]);
        setSubjects(subjectsRes.data);
      }
    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu hồ sơ. Vui lòng kiểm tra kết nối.');
    } finally {
      setLoading(false);
    }
  }

  // --- Projects CRUD ---
  async function fetchProjects(studentId) {
    setProjectsLoading(true);
    try {
      const data = await getStudentProjects(studentId);
      setProjects(Array.isArray(data) ? data : []);
    } catch { setProjects([]); }
    finally { setProjectsLoading(false); }
  }

  async function handleCreateProject(formData) {
    if (!studentData) return;
    await createProject({ ...formData, studentId: studentData.id });
    await fetchProjects(studentData.id);
  }

  async function handleDeleteProject(id) {
    if (!confirm('Bạn có chắc muốn xóa đồ án này?')) return;
    await deleteProject(id);
    await fetchProjects(studentData.id);
  }

  // --- Certificates CRUD ---
  async function fetchCertificates(studentId) {
    setCertificatesLoading(true);
    try {
      const data = await getStudentCertificates(studentId);
      setCertificates(Array.isArray(data) ? data : []);
    } catch { setCertificates([]); }
    finally { setCertificatesLoading(false); }
  }

  async function handleCreateCertificate(formData) {
    if (!studentData) return;
    await createCertificate({ ...formData, studentId: studentData.id });
    await fetchCertificates(studentData.id);
  }

  async function handleDeleteCertificate(id) {
    if (!confirm('Bạn có chắc muốn xóa chứng chỉ này?')) return;
    await deleteCertificate(id);
    await fetchCertificates(studentData.id);
  }

  // --- Helpers ---
  function calculateGPA() {
    if (examResults.length === 0) return '—';
    const valid = examResults.filter((r) => r.combinedResult != null || r.result != null);
    if (valid.length === 0) return '—';
    const sum = valid.reduce((acc, r) => acc + (r.combinedResult ?? r.result ?? 0), 0);
    return (sum / valid.length).toFixed(2);
  }

  function getTopSkills() {
    return evaluationDetails
      .filter((d) => d.studentScore != null && d.studentScore > 0)
      .sort((a, b) => (b.studentScore || 0) - (a.studentScore || 0))
      .slice(0, 6)
      .map((d) => {
        const criteria = evaluationCriterias.find((c) => c.id === d.evaluationCriteriaId);
        return { name: d.evaluationName || criteria?.name || 'N/A', score: d.studentScore };
      });
  }

  function getRadarData() {
    const skills = getTopSkills();
    if (skills.length === 0) return [];
    return skills.map((s) => ({
      subject: s.name.length > 20 ? s.name.substring(0, 20) + '...' : s.name,
      fullName: s.name,
      score: s.score,
      fullMark: 10,
    }));
  }

  return (
    <MainLayout>
      <div className="fade-in" style={{ maxWidth: 1200, margin: '0 auto' }}>
        {error && (
          <div style={{ padding: 'var(--space-4)', background: 'var(--color-danger-light)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)', marginBottom: 'var(--space-4)', fontSize: '14px' }}>
            {error}
            <button className="btn btn-outline" onClick={fetchProfileData} style={{ marginLeft: 'var(--space-4)', fontSize: '13px' }}>Thử lại</button>
          </div>
        )}

        <SubTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* TAB 1: Tổng quan hồ sơ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            {/* Cột trái: Thẻ cá nhân */}
            <div className="card" style={{ padding: 'var(--space-8)' }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="skeleton" style={{ height: 20, width: `${90 - i * 8}%` }} />
                  ))}
                </div>
              ) : (
                <>
                  {/* Avatar */}
                  <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                    <div
                      style={{
                        width: 80, height: 80, borderRadius: 'var(--radius-full)',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-ai))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto var(--space-4)',
                        color: 'white', fontSize: '28px', fontWeight: 700,
                      }}
                    >
                      {user?.fullName?.split(' ').pop()?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
                      {user?.fullName || 'Sinh viên'}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      {majorName}
                    </p>
                  </div>

                  {/* Thông tin chi tiết & Nút sửa */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                      Thông tin liên hệ
                    </h4>
                    {!isEditingInfo && (
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                        onClick={() => setIsEditingInfo(true)}
                      >
                        Sửa thông tin
                      </button>
                    )}
                  </div>

                  {isEditingInfo ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-4)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 2 }}>
                          Email
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          value={infoForm.email}
                          onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                          style={{ fontSize: '13px', padding: '6px 10px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 2 }}>
                          Số điện thoại
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          value={infoForm.phone}
                          onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                          style={{ fontSize: '13px', padding: '6px 10px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 2 }}>
                          GitHub URL
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          value={infoForm.githubUrl}
                          placeholder="github.com/username"
                          onChange={(e) => setInfoForm({ ...infoForm, githubUrl: e.target.value })}
                          style={{ fontSize: '13px', padding: '6px 10px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 2 }}>
                          LinkedIn URL
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          value={infoForm.linkedinUrl}
                          placeholder="linkedin.com/in/username"
                          onChange={(e) => setInfoForm({ ...infoForm, linkedinUrl: e.target.value })}
                          style={{ fontSize: '13px', padding: '6px 10px' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '12px', padding: '6px 14px', flex: 1 }}
                          onClick={handleSaveInfo}
                        >
                          Lưu thay đổi
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ fontSize: '12px', padding: '6px 14px' }}
                          onClick={() => setIsEditingInfo(false)}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                      <InfoRow label="Mã số SV" value={user?.userInternalId || '—'} />
                      <InfoRow label="Ngành học" value={majorName} />
                      <InfoRow label="Niên khóa" value={academicYearName} />
                      <InfoRow label="Điểm GPA" value={calculateGPA()} highlight />
                      <InfoRow label="Email" value={infoForm.email} />
                      <InfoRow label="Số điện thoại" value={infoForm.phone} />
                      <InfoRow label="GitHub URL" value={infoForm.githubUrl} />
                      <InfoRow label="LinkedIn URL" value={infoForm.linkedinUrl} />
                      {studentData && (
                        <>
                          <InfoRow label="Giới tính" value={studentData.gender === 0 ? 'Nam' : studentData.gender === 1 ? 'Nữ' : '—'} />
                          <InfoRow label="Nơi sinh" value={studentData.placeOfBirth || studentData.hometown || '—'} />
                        </>
                      )}
                    </div>
                  )}

                  {/* Kỹ năng cốt lõi */}
                  {getTopSkills().length > 0 && (
                    <div style={{ marginTop: 'var(--space-6)' }}>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Kỹ năng cốt lõi
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                        {getTopSkills().slice(0, 5).map((skill, i) => (
                          <span key={i} className="badge badge-primary">{skill.name}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Cột phải: AI Đề xuất + Thống kê nhanh */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {/* Khung AI Đề xuất */}
              <div className="card" style={{ padding: 'var(--space-6)', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lightbulb size={16} style={{ color: 'var(--color-accent-ai)' }} />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>AI Đề xuất</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <SuggestionItem text="Cập nhật ảnh chân dung chuyên nghiệp để tạo ấn tượng đầu tiên tốt hơn" />
                  <SuggestionItem text="Thêm liên kết GitHub hoặc Portfolio cá nhân vào hồ sơ" />
                  <SuggestionItem text="Viết mô tả ngắn gọn về mục tiêu nghề nghiệp (2-3 câu)" />
                </div>
              </div>

              {/* Thống kê nhanh */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                <QuickStat label="Đồ án" value={projects.length} icon={<FolderGit2 size={18} />} color="var(--color-primary)" onClick={() => setActiveTab('projects')} />
                <QuickStat label="Chứng chỉ" value={certificates.length} icon={<ShieldCheck size={18} />} color="var(--color-success)" onClick={() => setActiveTab('certificates')} />
                <QuickStat label="Môn học" value={examResults.length} icon={<BookOpen size={18} />} color="var(--color-warning)" onClick={() => setActiveTab('grades')} />
              </div>

              {/* Dự án gần đây */}
              <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <FolderGit2 size={18} style={{ color: 'var(--color-primary)' }} />
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Dự án gần đây</h3>
                  </div>
                  <button
                    style={{ fontSize: '13px', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-family)', fontWeight: 500 }}
                    onClick={() => setActiveTab('projects')}
                  >
                    Xem tất cả <ChevronRight size={14} />
                  </button>
                </div>

                {projects.length > 0 ? projects.slice(0, 2).map((project) => (
                  <div key={project.id} style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', background: 'var(--color-bg)', marginBottom: 'var(--space-3)', transition: 'all var(--transition-fast)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
                      {project.projectName}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-2)' }}>
                      {(project.description || '').substring(0, 100)}{(project.description || '').length > 100 ? '...' : ''}
                    </p>
                    {project.role && (
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {project.role}
                      </span>
                    )}
                  </div>
                )) : !loading && (
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-4)' }}>
                    Chưa có dự án nào. Bấm "Xem tất cả" để thêm mới.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Tiến độ Chuẩn đầu ra PLO/CLO */}
        {activeTab === 'plo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="card" style={{ padding: 'var(--space-8)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <Award size={20} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Biểu đồ năng lực chuẩn đầu ra</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
                Biểu đồ tổng hợp đánh giá các tiêu chuẩn đầu ra (PLO/CLO) theo thang điểm 10
              </p>

              {loading ? (
                <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
              ) : getRadarData().length >= 3 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 'var(--space-6)', alignItems: 'center' }}>
                  <div>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={getRadarData()} outerRadius="75%">
                        <PolarGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)', fontWeight: 500 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} tickCount={6} />
                        <Radar name="Điểm đạt" dataKey="score" stroke="var(--color-accent-ai)" fill="url(#radarGradient)" fillOpacity={0.6} strokeWidth={2.5} dot={{ r: 4, fill: 'var(--color-accent-ai)', strokeWidth: 2, stroke: 'var(--color-surface)' }} />
                        <defs>
                          <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-accent-ai)" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <Tooltip
                          contentStyle={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 13, fontFamily: 'var(--font-family)', boxShadow: 'var(--shadow-md)', padding: '8px 14px' }}
                          formatter={(value, name, props) => [`${value} / 10`, props.payload.fullName]}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Chi tiết điểm từng tiêu chí
                    </p>
                    {getRadarData().map((item, idx) => {
                      const pct = (item.score / 10) * 100;
                      const barColor = item.score >= 9 ? 'var(--color-success)' : item.score >= 7.5 ? 'var(--color-primary)' : item.score >= 5 ? 'var(--color-warning)' : 'var(--color-danger)';
                      return (
                        <div key={idx} style={{ padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', border: '1px solid var(--color-border-light)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.fullName}</span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: barColor }}>{item.score}/10</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: 'var(--color-border)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: barColor, transition: 'width 0.8s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>Điểm trung bình PLO</span>
                        <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)' }}>
                          {(getRadarData().reduce((s, d) => s + d.score, 0) / getRadarData().length).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : getRadarData().length > 0 ? (
                <div style={{ maxWidth: 600, margin: '0 auto' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getRadarData()} layout="vertical" barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border-light)" />
                      <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                      <YAxis type="category" dataKey="fullName" width={180} tick={{ fontSize: 12, fill: '#475569' }} />
                      <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={28}>
                        {getRadarData().map((entry, i) => (
                          <Cell key={i} fill={entry.score >= 9 ? '#10B981' : entry.score >= 7.5 ? '#3B82F6' : '#F59E0B'} />
                        ))}
                      </Bar>
                      <Tooltip contentStyle={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13 }} formatter={(value) => [`${value}/10`, 'Điểm']} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)' }}>
                  <Award size={48} style={{ margin: '0 auto var(--space-4)', opacity: 0.3 }} />
                  <p style={{ fontSize: '15px', fontWeight: 500 }}>Chưa có dữ liệu đánh giá chuẩn đầu ra</p>
                  <p style={{ fontSize: '13px', marginTop: 'var(--space-2)' }}>Dữ liệu PLO/CLO sẽ hiển thị khi có kết quả đánh giá từ hệ thống</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Danh sách Dự án (CRUD) */}
        {activeTab === 'projects' && (
          <ProjectsTab
            projects={projects}
            loading={projectsLoading}
            studentData={studentData}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
          />
        )}

        {/* TAB 4: Chứng chỉ (CRUD) */}
        {activeTab === 'certificates' && (
          <CertificatesTab
            certificates={certificates}
            loading={certificatesLoading}
            studentData={studentData}
            onCreateCertificate={handleCreateCertificate}
            onDeleteCertificate={handleDeleteCertificate}
          />
        )}

        {/* TAB 5: Kết quả học tập */}
        {activeTab === 'grades' && (
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <BookOpen size={20} style={{ color: 'var(--color-success)' }} />
                <h3 style={{ fontSize: '17px', fontWeight: 600, margin: 0 }}>Bảng điểm chuyên ngành</h3>
              </div>
              <span className="badge badge-primary">{examResults.length} kết quả</span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="skeleton" style={{ height: 48 }} />
                ))}
              </div>
            ) : examResults.length > 0 ? (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                      <th style={thStyle}>STT</th>
                      <th style={{ ...thStyle, textAlign: 'left' }}>Kỳ thi</th>
                      <th style={{ ...thStyle, textAlign: 'left' }}>Mô tả</th>
                      <th style={thStyle}>Điểm thi</th>
                      <th style={thStyle}>Điểm tổng kết</th>
                      <th style={thStyle}>Xếp loại</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examResults.map((result, idx) => {
                      const score = result.combinedResult ?? result.result ?? 0;
                      const grade = score >= 8.5 ? 'Giỏi' : score >= 7 ? 'Khá' : score >= 5 ? 'Trung bình' : 'Yếu';
                      const gradeClass = score >= 8.5 ? 'badge-success' : score >= 7 ? 'badge-primary' : score >= 5 ? 'badge-warning' : '';
                      return (
                        <tr key={result.id} style={{ borderBottom: '1px solid var(--color-border-light)', transition: 'background var(--transition-fast)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                          <td style={tdStyle}>{idx + 1}</td>
                          <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 500, whiteSpace: 'nowrap' }}>{examMap[result.subjectTeachingExamId] || result.notes || '—'}</td>
                          <td style={{ ...tdStyle, textAlign: 'left', color: 'var(--color-text-secondary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.examResultDesc || '—'}</td>
                          <td style={tdStyle}>{result.result != null ? result.result.toFixed(1) : '—'}</td>
                          <td style={tdStyle}><span style={{ fontWeight: 600 }}>{result.combinedResult != null ? result.combinedResult.toFixed(1) : '—'}</span></td>
                          <td style={tdStyle}><span className={`badge ${gradeClass}`}>{grade}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)' }}>
                <BookOpen size={48} style={{ margin: '0 auto var(--space-4)', opacity: 0.3 }} />
                <p style={{ fontSize: '15px', fontWeight: 500 }}>Chưa có kết quả thi nào</p>
                <p style={{ fontSize: '13px', marginTop: 'var(--space-2)' }}>Dữ liệu sẽ hiển thị khi có kết quả từ hệ thống đào tạo</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}


// ============================================================
// TAB 3 — Projects Tab Component
// ============================================================
function ProjectsTab({ projects, loading, studentData, onCreateProject, onDeleteProject }) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    projectName: '', description: '', role: '',
    technologies: '', gitUrl: '', demoUrl: '',
  });

  function resetForm() {
    setForm({ projectName: '', description: '', role: '', technologies: '', gitUrl: '', demoUrl: '' });
    setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.projectName.trim()) { setFormError('Tên đồ án không được để trống'); return; }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        projectName: form.projectName.trim(),
        description: form.description.trim() || null,
        role: form.role.trim() || null,
        technologies: form.technologies.trim() ? form.technologies.split(',').map(t => t.trim()).filter(Boolean) : [],
        gitUrl: form.gitUrl.trim() || null,
        demoUrl: form.demoUrl.trim() || null,
      };
      await onCreateProject(payload);
      resetForm();
      setShowForm(false);
    } catch (err) {
      setFormError('Không thể thêm đồ án. Vui lòng thử lại.');
    } finally { setSaving(false); }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <FolderGit2 size={20} style={{ color: 'var(--color-primary)' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 600, margin: 0 }}>Kho dự án & Đồ án</h3>
          <span className="badge badge-primary">{projects.length} dự án</span>
        </div>
        {studentData && (
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }} style={{ fontSize: '12px', padding: '6px 14px' }}>
            <Plus size={15} /> Thêm đồ án
          </button>
        )}
      </div>

      {/* Form thêm mới — Slide-down inline */}
      {showForm && (
        <div className="card fade-in" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', border: '1.5px solid var(--color-primary)', background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-primary)' }}>Thêm đồ án mới</h4>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}>
              <X size={20} />
            </button>
          </div>

          {formError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3)', background: 'var(--color-danger-light)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', border: '1px solid var(--color-danger)' }}>
              <AlertCircle size={14} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--color-danger)' }}>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div className="input-group">
                <label className="input-label">Tên đồ án <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input className="input-field" placeholder="VD: Hệ thống quản lý thư viện online" value={form.projectName} onChange={e => setForm(p => ({ ...p, projectName: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Vai trò</label>
                <input className="input-field" placeholder="VD: Fullstack Developer, Backend Lead" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="input-label">Mô tả dự án</label>
              <textarea className="input-field" rows={3} placeholder="Mô tả ngắn gọn về dự án, chức năng chính, kết quả đạt được..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>

            <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="input-label">Công nghệ sử dụng</label>
              <input className="input-field" placeholder="VD: React, Node.js, SQL Server (phân cách bởi dấu phẩy)" value={form.technologies} onChange={e => setForm(p => ({ ...p, technologies: e.target.value }))} />
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 4 }}>Nhập nhiều công nghệ cách nhau bởi dấu phẩy</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
              <div className="input-group">
                <label className="input-label">Link GitHub</label>
                <input className="input-field" placeholder="https://github.com/..." value={form.gitUrl} onChange={e => setForm(p => ({ ...p, gitUrl: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Link Demo</label>
                <input className="input-field" placeholder="https://demo.example.com" value={form.demoUrl} onChange={e => setForm(p => ({ ...p, demoUrl: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)} style={{ fontSize: '13px' }}>Hủy</button>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ fontSize: '13px', minWidth: 120 }}>
                {saving ? 'Đang lưu...' : <><Save size={14} /> Lưu đồ án</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách Projects */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : projects.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {projects.map((project) => (
            <div key={project.id} className="card" style={{ padding: 'var(--space-6)', transition: 'box-shadow var(--transition-fast)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{project.projectName}</h4>
                    {project.role && <span className="badge badge-primary" style={{ fontSize: '11px' }}>{project.role}</span>}
                  </div>

                  {project.description && (
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-3)' }}>
                      {project.description}
                    </p>
                  )}

                  {/* Technologies */}
                  {project.technologies && (Array.isArray(project.technologies) ? project.technologies : project.technologies.split(',')).filter(Boolean).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                      {(Array.isArray(project.technologies) ? project.technologies : project.technologies.split(',')).filter(Boolean).map((tech, idx) => (
                        <span key={idx} style={{ padding: '2px 10px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: '11px', fontWeight: 500 }}>
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Links */}
                  <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: '12px' }}>
                    {project.gitUrl && (
                      <a href={project.gitUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ExternalLink size={12} /> GitHub
                      </a>
                    )}
                    {project.demoUrl && (
                      <a href={project.demoUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-success)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ExternalLink size={12} /> Demo
                      </a>
                    )}
                  </div>
                </div>

                {/* Nút xóa */}
                <button onClick={() => onDeleteProject(project.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 8, borderRadius: 'var(--radius-md)', transition: 'all var(--transition-fast)', flexShrink: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.background = 'var(--color-danger-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'none'; }}
                  title="Xóa đồ án">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <FolderGit2 size={56} style={{ color: 'var(--color-border)', margin: '0 auto var(--space-5)' }} />
          <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)' }}>Chưa có đồ án nào</h4>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)', maxWidth: 400, margin: '0 auto var(--space-6)' }}>
            Thêm các đồ án và dự án để hệ thống AI có thể tối ưu hóa CV của bạn tốt hơn.
          </p>
          {studentData && (
            <button className="btn btn-primary" onClick={() => { setShowForm(true); }} style={{ fontSize: '14px' }}>
              <Plus size={16} /> Thêm đồ án đầu tiên
            </button>
          )}
        </div>
      )}
    </div>
  );
}


// ============================================================
// TAB 4 — Certificates Tab Component
// ============================================================
function CertificatesTab({ certificates, loading, studentData, onCreateCertificate, onDeleteCertificate }) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    certificateName: '', issuer: '', issueDate: '', certificateUrl: '',
  });

  function resetForm() {
    setForm({ certificateName: '', issuer: '', issueDate: '', certificateUrl: '' });
    setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.certificateName.trim()) { setFormError('Tên chứng chỉ không được để trống'); return; }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        certificateName: form.certificateName.trim(),
        issuer: form.issuer.trim() || null,
        issueDate: form.issueDate || null,
        certificateUrl: form.certificateUrl.trim() || null,
      };
      await onCreateCertificate(payload);
      resetForm();
      setShowForm(false);
    } catch (err) {
      setFormError('Không thể thêm chứng chỉ. Vui lòng thử lại.');
    } finally { setSaving(false); }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch { return dateStr; }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <ShieldCheck size={20} style={{ color: 'var(--color-success)' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Kho chứng chỉ</h3>
          <span className="badge badge-success">{certificates.length} chứng chỉ</span>
        </div>
        {studentData && (
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }} style={{ fontSize: '12px', padding: '6px 14px' }}>
            <Plus size={15} /> Thêm chứng chỉ
          </button>
        )}
      </div>

      {/* Form thêm mới */}
      {showForm && (
        <div className="card fade-in" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', border: '1.5px solid var(--color-success)', background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-success)' }}>Thêm chứng chỉ mới</h4>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}>
              <X size={20} />
            </button>
          </div>

          {formError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3)', background: 'var(--color-danger-light)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', border: '1px solid var(--color-danger)' }}>
              <AlertCircle size={14} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--color-danger)' }}>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div className="input-group">
                <label className="input-label">Tên chứng chỉ <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input className="input-field" placeholder="VD: TOEIC 750, AWS Cloud Practitioner" value={form.certificateName} onChange={e => setForm(p => ({ ...p, certificateName: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Tổ chức cấp</label>
                <input className="input-field" placeholder="VD: ETS, British Council, Amazon" value={form.issuer} onChange={e => setForm(p => ({ ...p, issuer: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
              <div className="input-group">
                <label className="input-label">Ngày cấp</label>
                <input className="input-field" type="date" value={form.issueDate} onChange={e => setForm(p => ({ ...p, issueDate: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Link chứng chỉ (URL)</label>
                <input className="input-field" placeholder="https://credential.example.com/..." value={form.certificateUrl} onChange={e => setForm(p => ({ ...p, certificateUrl: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)} style={{ fontSize: '13px' }}>Hủy</button>
              <button type="submit" className="btn btn-success" disabled={saving} style={{ fontSize: '13px', minWidth: 130 }}>
                {saving ? 'Đang lưu...' : <><Save size={14} /> Lưu chứng chỉ</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách Certificates */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : certificates.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          {certificates.map((cert) => (
            <div key={cert.id} className="card" style={{ padding: 'var(--space-5)', transition: 'box-shadow var(--transition-fast)', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: 'var(--color-success-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Award size={20} style={{ color: 'var(--color-success)' }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                    {cert.certificateName}
                  </h4>
                  {cert.issuer && (
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                      {cert.issuer}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {cert.issueDate && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {formatDate(cert.issueDate)}
                      </span>
                    )}
                    {cert.certificateUrl && (
                      <a href={cert.certificateUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ExternalLink size={12} /> Xem chứng chỉ
                      </a>
                    )}
                  </div>
                </div>

                {/* Nút xóa */}
                <button onClick={() => onDeleteCertificate(cert.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 6, borderRadius: 'var(--radius-md)', transition: 'all var(--transition-fast)', flexShrink: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.background = 'var(--color-danger-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'none'; }}
                  title="Xóa chứng chỉ">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <ShieldCheck size={56} style={{ color: 'var(--color-border)', margin: '0 auto var(--space-5)' }} />
          <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)' }}>Chưa có chứng chỉ nào</h4>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)', maxWidth: 400, margin: '0 auto var(--space-6)' }}>
            Thêm các chứng chỉ nghề nghiệp, ngoại ngữ hoặc tin học để làm nổi bật CV của bạn.
          </p>
          {studentData && (
            <button className="btn btn-success" onClick={() => { resetForm(); setShowForm(true); }} style={{ fontSize: '14px' }}>
              <Plus size={16} /> Thêm chứng chỉ đầu tiên
            </button>
          )}
        </div>
      )}
    </div>
  );
}


// ============================================================
// Sub-components
// ============================================================

function QuickStat({ label, value, icon, color, onClick }) {
  return (
    <div className="card" onClick={onClick}
      style={{ padding: 'var(--space-5)', cursor: 'pointer', transition: 'all var(--transition-fast)', textAlign: 'center' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
      <div style={{ color, marginBottom: 'var(--space-2)', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border-light)' }}>
      <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: highlight ? 700 : 500, color: highlight ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
        {value}
      </span>
    </div>
  );
}

function SuggestionItem({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', border: '1px solid var(--color-border-light)' }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent-ai)', marginTop: 6, flexShrink: 0 }} />
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

const thStyle = {
  padding: 'var(--space-3) var(--space-4)',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: 'var(--space-4)',
  fontSize: '14px',
  textAlign: 'center',
};
