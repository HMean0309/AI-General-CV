'use client';

import { GraduationCap, ClipboardList } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/constants';
import {
  tableStyle,
  theadRowStyle,
  thStyle,
  tdStyle,
  trStyle,
  guidCellStyle,
  sectionTitleStyle,
  trHoverIn,
  trHoverOut,
} from './adminConfig';

// ---- 1. Students Table ----
export function StudentsTable({ data, offset, rawUsers, getMajorName }) {
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
export function UsersTable({ data, offset }) {
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
export function MajorsAcademicTable({ majors, academicYears, offset }) {
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
export function FacultiesTable({ data, offset }) {
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
export function SubjectsTable({ data, offset }) {
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
export function SubjectTeachingsTable({ data, offset, getSubjectName }) {
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
export function SubjectTeachingExamsTable({ data, offset }) {
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
export function ExamResultsTable({ data, offset, rawStudents, rawUsers }) {
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
export function EvaluationCriteriasTable({ data, offset }) {
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
export function StudentEvaluationsTable({ data, offset, getStudentNameById }) {
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
export function StudentEvaluationDetailsTable({ data, offset, getCriteriaName }) {
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
