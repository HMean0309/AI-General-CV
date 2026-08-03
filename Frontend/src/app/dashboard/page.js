'use client';
// ============================================================
// Dashboard Page - Trang chủ / Bảng điều khiển
// Thiết kế phẳng tối giản, tự nhiên, thân thiện và thiết thực
// ============================================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
  FileSpreadsheet,
  FileText,
  Layers,
  BookOpen,
  User,
  ArrowRight,
  Clock,
  Target,
  GraduationCap
} from 'lucide-react';
import {
  getStudents,
  getMajors,
  getAcademicYears,
  getExamResults,
  getSubjects,
  getSubjectTeachingExams,
  getStudentEvaluationDetails,
  getStudentEvaluations,
  getEvaluationCriterias,
} from '@/services/studentService';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [majorName, setMajorName] = useState('');
  const [academicYearName, setAcademicYearName] = useState('');
  const [examResults, setExamResults] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [evaluationDetails, setEvaluationDetails] = useState([]);
  const [evaluationCriterias, setEvaluationCriterias] = useState([]);
  const [examMap, setExamMap] = useState({});
  const [error, setError] = useState('');

  // Fetch dữ liệu khi mount
  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [user]);

  async function fetchDashboardData() {
    setLoading(true);
    setError('');
    try {
      // 1. Lấy thông tin Student trước theo userId của tài khoản đang đăng nhập
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

        const major = majorsRes.data.find(m => m.id === myStudent.majorId);
        setMajorName(major?.name || 'Chưa xác định');

        const ay = academicYearsRes.data.find(a => a.id === myStudent.academicYearId);
        setAcademicYearName(ay?.name || 'Chưa xác định');

        setExamResults(examResultsRes.data);
        setSubjects(subjectsRes.data);
        setEvaluationCriterias(evaluationCriteriasRes.data);

        // 2b. Lấy tên kỳ thi từ SubjectTeachingExams để hiển thị thay GUID
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
      } else {
        // Fallback nếu không tìm thấy cấu hình student cho user
        const [subjectsRes] = await Promise.all([getSubjects({ pageSize: 500 })]);
        setSubjects(subjectsRes.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
      setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối đến máy chủ backend.');
    } finally {
      setLoading(false);
    }
  }

  function calculateGPA() {
    if (examResults.length === 0) return '—';
    const validResults = examResults.filter(r => r.combinedResult != null || r.result != null);
    if (validResults.length === 0) return '—';
    const sum = validResults.reduce((acc, r) => acc + (r.combinedResult ?? r.result ?? 0), 0);
    return (sum / validResults.length).toFixed(2);
  }

  function getTopSkills() {
    if (evaluationDetails.length === 0) return [];
    return evaluationDetails
      .filter(d => d.studentScore != null && d.studentScore > 0)
      .sort((a, b) => (b.studentScore || 0) - (a.studentScore || 0))
      .slice(0, 5)
      .map(d => {
        const criteria = evaluationCriterias.find(c => c.id === d.evaluationCriteriaId);
        return {
          name: d.evaluationName || criteria?.name || 'N/A',
          score: d.studentScore,
        };
      });
  }

  return (
    <MainLayout>
      <div className="fade-in" style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Error state */}
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
            <span style={{ fontSize: '14px' }}>{error}</span>
            <button className="btn btn-outline" onClick={fetchDashboardData} style={{ marginLeft: 'auto', fontSize: '13px' }}>
              Thử lại
            </button>
          </div>
        )}

        {/* === Banner Khởi động phẳng, sạch sẽ và thân thiện === */}
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: 'var(--space-8) var(--space-8)',
            marginBottom: 'var(--space-8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ maxWidth: '650px' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: 'var(--space-2)' }}>
              {getGreeting()}, {user?.fullName?.split(' ').pop() || 'bạn'}! 👋
            </p>
            <h1 style={{ color: 'var(--color-text-primary)', fontSize: '24px', fontWeight: 700, marginBottom: 'var(--space-3)', lineHeight: 1.3 }}>
              Sẵn sàng tạo CV tối ưu hóa năng lực học tập?
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
              Hệ thống sẽ tự động tổng hợp kết quả học tập và đánh giá các tiêu chuẩn đầu ra để xây dựng một CV phù hợp nhất cho bạn ứng tuyển.
            </p>
            <Link href="/cv-workspace" style={{ textDecoration: 'none' }}>
              <button
                className="btn btn-ai"
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                <span>Bắt đầu tạo CV ngay</span>
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>
          <div style={{ display: 'none', md: 'block', paddingRight: 'var(--space-6)' }}>
            <FileText size={80} style={{ color: 'var(--color-primary)', opacity: 0.15 }} />
          </div>
        </div>

        {/* === Thẻ KPI Phẳng Tối Giản === */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-8)',
          }}
        >
          {loading ? (
            <>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
              ))}
            </>
          ) : (
            <>
              <KPICard
                icon={<FileSpreadsheet size={22} />}
                iconColor="var(--color-primary)"
                iconBg="var(--color-primary-light)"
                label="Điểm GPA tích lũy"
                value={calculateGPA()}
                subtitle={`${examResults.length} kết quả thi`}
              />
              <KPICard
                icon={<Layers size={22} />}
                iconColor="var(--color-accent-ai)"
                iconBg="var(--color-primary-light)"
                label="CV đã tạo"
                value="0"
                subtitle="Chưa xuất bản CV"
              />
              <KPICard
                icon={<BookOpen size={22} />}
                iconColor="var(--color-success)"
                iconBg="var(--color-success-light)"
                label="Môn học hoàn thành"
                value={String(examResults.filter(r => (r.combinedResult ?? r.result) != null).length)}
                subtitle={`/${subjects.length} tổng môn`}
              />
              <KPICard
                icon={<Target size={22} />}
                iconColor="var(--color-warning)"
                iconBg="var(--color-warning-light)"
                label="Năng lực đánh giá"
                value={String(evaluationDetails.length)}
                subtitle="tiêu chí PLO/CLO"
              />
            </>
          )}
        </div>

        {/* === Thông tin cá nhân + Top kỹ năng === */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-6)',
          }}
        >
          {/* Thông tin cá nhân */}
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <User size={20} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Thông tin cá nhân</h3>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="skeleton" style={{ height: 20, width: `${80 - i * 8}%` }} />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <InfoRow label="Họ và tên" value={user?.fullName || '—'} />
                <InfoRow label="Mã SV / UserID" value={user?.userInternalId || '—'} />
                <InfoRow label="Ngành học" value={majorName || '—'} />
                <InfoRow label="Niên khóa" value={academicYearName || '—'} />
                <InfoRow label="Điểm GPA" value={calculateGPA()} highlight />
                <InfoRow
                  label="Vai trò"
                  value={
                    <span className="badge badge-primary">
                      {user?.role === 99 ? 'Quản trị viên' : user?.role === 50 ? 'Giảng viên' : 'Sinh viên'}
                    </span>
                  }
                />
                {studentData && (
                  <>
                    <InfoRow
                      label="Giới tính"
                      value={studentData.gender === 0 ? 'Nam' : studentData.gender === 1 ? 'Nữ' : '—'}
                    />
                    <InfoRow label="Nơi sinh" value={studentData.placeOfBirth || '—'} />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Top kỹ năng */}
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <Target size={20} style={{ color: 'var(--color-accent-ai)' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Năng lực tiêu biểu (PLO)</h3>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="skeleton" style={{ height: 36, borderRadius: 'var(--radius-md)' }} />
                ))}
              </div>
            ) : (
              <>
                {getTopSkills().length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {getTopSkills().map((skill, idx) => (
                      <SkillBar key={idx} name={skill.name} score={skill.score} maxScore={10} />
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-10) var(--space-6)',
                    color: 'var(--color-text-muted)',
                  }}>
                    <GraduationCap size={40} style={{ margin: '0 auto var(--space-4)', opacity: 0.3 }} />
                    <p style={{ fontSize: '14px' }}>Chưa có dữ liệu đánh giá năng lực</p>
                    <p style={{ fontSize: '12px', marginTop: 'var(--space-2)' }}>
                      Dữ liệu sẽ hiển thị khi có kết quả PLO/CLO
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* === Kết quả thi gần đây === */}
        <div className="card" style={{ padding: 'var(--space-8)', marginTop: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Clock size={20} style={{ color: 'var(--color-success)' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Kết quả thi gần đây</h3>
            </div>
            <span className="badge badge-primary" style={{ fontSize: '12px' }}>
              {examResults.length} kết quả
            </span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: 52 }} />
              ))}
            </div>
          ) : examResults.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                    <th style={thStyle}>STT</th>
                    <th style={{ ...thStyle, textAlign: 'left' }}>Kỳ thi</th>
                    <th style={{ ...thStyle, textAlign: 'left' }}>Mô tả</th>
                    <th style={thStyle}>Điểm thi</th>
                    <th style={thStyle}>Điểm tổng kết</th>
                  </tr>
                </thead>
                <tbody>
                  {examResults.slice(0, 10).map((result, idx) => (
                    <tr
                      key={result.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-light)',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={tdStyle}>{idx + 1}</td>
                      <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 500 }}>
                        {examMap[result.subjectTeachingExamId] || result.notes || '—'}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'left', color: 'var(--color-text-secondary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {result.examResultDesc || '—'}
                      </td>
                      <td style={tdStyle}>
                        <span
                          className={`badge ${
                            (result.result ?? 0) >= 8
                              ? 'badge-success'
                              : (result.result ?? 0) >= 5
                              ? 'badge-warning'
                              : 'badge-primary'
                          }`}
                        >
                          {result.result != null ? result.result.toFixed(1) : '—'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600 }}>
                          {result.combinedResult != null ? result.combinedResult.toFixed(1) : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {examResults.length > 10 && (
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', marginTop: 'var(--space-4)' }}>
                  Đang hiển thị 10/{examResults.length} kết quả
                </p>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-muted)' }}>
              <BookOpen size={40} style={{ margin: '0 auto var(--space-4)', opacity: 0.3 }} />
              <p style={{ fontSize: '14px' }}>Chưa có kết quả thi nào</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

// --- Sub-components ---

function KPICard({ icon, iconColor, iconBg, label, value, subtitle }) {
  return (
    <div
      className="card"
      style={{
        padding: 'var(--space-5)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        border: '1px solid var(--color-border)',
        boxShadow: 'none',
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          minWidth: 42,
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
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: 'var(--space-1)' }}>
          {label}
        </p>
        <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.1, marginBottom: 'var(--space-1)' }}>
          {value}
        </p>
        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
          {subtitle}
        </p>
      </div>
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

function SkillBar({ name, score, maxScore }) {
  const percentage = Math.min((score / maxScore) * 100, 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
        <span style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
          {name}
        </span>
        <span style={{ fontSize: '13px', color: 'var(--color-accent-ai)', fontWeight: 600 }}>
          {score?.toFixed?.(1) || score}
        </span>
      </div>
      <div style={{ width: '100%', height: 6, borderRadius: 'var(--radius-full)', background: 'var(--color-bg)' }}>
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-accent-ai)',
            transition: 'width 0.6s ease-out',
          }}
        />
      </div>
    </div>
  );
}

// --- Helpers ---
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

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
  padding: 'var(--space-4)',
  fontSize: '14px',
  textAlign: 'center',
};
