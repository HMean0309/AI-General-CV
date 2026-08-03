'use client';
// ============================================================
// CVPreview - Bản xem trước CV tỷ lệ A4 chuẩn (Strict 1-Page Layout)
// Sửa triệt để khoảng cách đường kẻ: dùng paddingBottom 6px cho h2 để ép khoảng trắng rõ ràng trên cả Web & PDF
// ============================================================

export default function CVPreview({ cvData, template = 'modern', targetRole = '' }) {
  if (!cvData) return null;

  const personalInfo = cvData.personalInfo || {};
  const summary = cvData.summary || cvData.professionalSummary || '';
  const technicalSkills = cvData.skills?.technical || cvData.technicalSkills || [];
  const softSkills = cvData.skills?.soft || [];
  const projects = cvData.projects || [];
  const certificates = cvData.certificates || [];
  const education = cvData.education || {};
  const displayRole = targetRole || personalInfo.title || '';

  return (
    <div
      id="cv-preview-content"
      style={{
        width: '210mm',
        maxWidth: '100%',
        background: '#FFFFFF',
        padding: '28px 32px',
        fontFamily: "'Be Vietnam Pro', 'Inter', Arial, sans-serif",
        fontSize: '10pt',
        lineHeight: 1.5,
        color: '#000000',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        borderRadius: '8px',
        position: 'relative',
        boxSizing: 'border-box',
        margin: '0 auto',
      }}
    >
      {/* ─── Header ─── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h1 style={{ fontSize: '22pt', fontWeight: 700, color: '#000000', margin: 0, lineHeight: 1.2 }}>
            {personalInfo.fullName || 'Họ và tên'}
          </h1>
          {displayRole && (
            <span style={{ fontSize: '11pt', fontWeight: 700, color: '#333333' }}>
              {displayRole}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: 8, paddingBottom: 6, fontSize: '9.5pt', color: '#333333' }}>
          {personalInfo.email && (
            <span>✉ {personalInfo.email}</span>
          )}
          {personalInfo.phone && (
            <span>☎ {personalInfo.phone}</span>
          )}
          {(personalInfo.linkedin || personalInfo.linkedIn) && (
            <span>🔗 {personalInfo.linkedin || personalInfo.linkedIn}</span>
          )}
          {personalInfo.github && (
            <span>⌂ {personalInfo.github}</span>
          )}
        </div>
        {/* Đường kẻ phân cách Header - có khoảng cách rõ ràng */}
        <div style={{ height: '2px', background: '#000000', marginTop: 8, width: '100%' }} />
      </div>

      {/* ─── 1. Tóm tắt Profile ─── */}
      {summary && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="TÓM TẮT PROFILE" />
          <p style={{ fontSize: '9.5pt', color: '#1A1A1A', margin: 0, lineHeight: 1.6, textAlign: 'justify' }}>
            {summary}
          </p>
        </div>
      )}

      {/* ─── 2. Học vấn ─── */}
      {education && (education.school || education.major) && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="HỌC VẤN" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <h3 style={{ fontSize: '10.5pt', fontWeight: 700, color: '#000000', margin: 0 }}>
                {education.school || 'Trường Đại học Tây Đô'}
              </h3>
              <p style={{ fontSize: '9.5pt', color: '#333333', margin: '2px 0 0 0' }}>
                Ngành: <span style={{ fontWeight: 600, color: '#000000' }}>{education.major}</span>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              {education.gpa && (
                <span style={{ fontSize: '9.5pt', fontWeight: 700, color: '#000000' }}>
                  GPA: {education.gpa}
                </span>
              )}
              {(education.duration || education.graduationYear) && (
                <p style={{ fontSize: '9pt', color: '#555555', margin: '2px 0 0 0' }}>
                  {education.duration || education.graduationYear}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. Kỹ năng chuyên môn ─── */}
      {(technicalSkills.length > 0 || softSkills.length > 0) && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="KỸ NĂNG CHUYÊN MÔN" />
          {technicalSkills.length > 0 && (
            <p style={{ fontSize: '9.5pt', color: '#1A1A1A', margin: '0 0 4px 0', lineHeight: 1.5 }}>
              <strong style={{ color: '#000000' }}>Kỹ thuật:</strong>{' '}
              {technicalSkills.map(s => (typeof s === 'string' ? s : s.name)).join('  •  ')}
            </p>
          )}
          {softSkills.length > 0 && (
            <p style={{ fontSize: '9.5pt', color: '#333333', margin: 0, lineHeight: 1.5 }}>
              <strong style={{ color: '#000000' }}>Kỹ năng mềm:</strong>{' '}
              {softSkills.join('  •  ')}
            </p>
          )}
        </div>
      )}

      {/* ─── 4. Dự án tiêu biểu ─── */}
      {projects.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="DỰ ÁN TIÊU BIỂU" />
          {projects.map((proj, idx) => (
            <div key={idx} style={{ marginBottom: idx < projects.length - 1 ? 14 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ fontSize: '10.5pt', fontWeight: 700, color: '#000000', margin: 0 }}>
                  {proj.name}
                  {proj.role && <span style={{ fontWeight: 500, color: '#444444', fontSize: '9.5pt' }}> ({proj.role})</span>}
                </h3>

                <div style={{ display: 'flex', gap: 12, fontSize: '9pt' }}>
                  {(proj.gitUrl || proj.git_url) && (
                    <a
                      href={proj.gitUrl || proj.git_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#000000', fontWeight: 600, textDecoration: 'underline' }}
                    >
                      [Source Code]
                    </a>
                  )}
                  {(proj.demoUrl || proj.demo_url) && (
                    <a
                      href={proj.demoUrl || proj.demo_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#000000', fontWeight: 600, textDecoration: 'underline' }}
                    >
                      [Demo]
                    </a>
                  )}
                </div>
              </div>

              {proj.technologies && (
                <p style={{ fontSize: '9pt', color: '#222222', fontWeight: 600, margin: '2px 0 4px 0' }}>
                  Công nghệ: {proj.technologies}
                </p>
              )}

              {proj.highlights && proj.highlights.length > 0 ? (
                <ul style={{ margin: '2px 0 0 16px', padding: 0, fontSize: '9.5pt', color: '#1A1A1A', lineHeight: 1.5 }}>
                  {proj.highlights.map((hl, hIdx) => (
                    <li key={hIdx} style={{ marginBottom: 2 }}>{hl}</li>
                  ))}
                </ul>
              ) : proj.description ? (
                <p style={{ fontSize: '9.5pt', color: '#1A1A1A', margin: '2px 0 0 0', lineHeight: 1.5 }}>
                  {proj.description}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* ─── 5. Chứng chỉ ─── */}
      {certificates.length > 0 && (
        <div>
          <SectionHeader title="CHỨNG CHỈ" />
          {certificates.map((cert, idx) => (
            <p key={idx} style={{ fontSize: '9.5pt', color: '#000000', margin: '0 0 3px 0', lineHeight: 1.5 }}>
              • <strong style={{ color: '#000000' }}>{cert.name}</strong>
              {cert.issuer && <span style={{ color: '#333333' }}> — {cert.issuer}</span>}
              {cert.year && <span style={{ color: '#555555' }}> ({cert.year})</span>}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// Sub-component cho Tiêu đề Mục + Đường kẻ ngang riêng biệt (Có paddingBottom 6px tạo khoảng trống rõ ràng 100%)
function SectionHeader({ title }) {
  return (
    <div style={{ marginTop: '12px', marginBottom: '10px' }}>
      <h2 style={{
        fontSize: '11pt',
        fontWeight: 700,
        color: '#000000',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        margin: 0,
        paddingBottom: '6px', // Ép buộc khoảng trắng 6px bên dưới chữ trước khi tới đường kẻ
        lineHeight: 1.3,
        display: 'block',
      }}>
        {title}
      </h2>
      <div style={{ height: '1.5px', background: '#000000', width: '100%', clear: 'both' }} />
    </div>
  );
}
