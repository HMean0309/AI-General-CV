'use client';
// ============================================================
// CV Workspace - Không gian tạo CV (Split Screen)
// 3 Trạng thái: Input → Processing → Editing
// Zustand store đồng bộ real-time giữa panel chỉnh sửa ↔ preview
// ============================================================

import { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import CVPreview from '@/components/cv/CVPreview';
import MatchScoreCircle from '@/components/cv/MatchScoreCircle';
import useCvStore from '@/stores/cvStore';
import { useAuth } from '@/contexts/AuthContext';
import {
  Upload, FileText, Sparkles, ArrowRight,
  AlertTriangle, Share2, FileDown, Download, Save,
  Check, Loader2, RefreshCw, ChevronRight, X, Paperclip,
} from 'lucide-react';
import { generateCV, parseJdFile } from '@/services/cvService';

export default function CvWorkspacePage() {
  const { user } = useAuth();
  const store = useCvStore();
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  // File attachment state
  const [attachedFile, setAttachedFile] = useState(null); // { name, size }
  const [fileParseLoading, setFileParseLoading] = useState(false);
  const [fileParseError, setFileParseError] = useState('');

  // Lưu CV vào Lịch sử ứng tuyển (localStorage)
  function handleSaveCV() {
    try {
      const existingHistory = JSON.parse(localStorage.getItem('saved_cv_history') || '[]');
      const newVersionNum = existingHistory.length + 1;
      const newCvItem = {
        id: 'cv_' + Date.now(),
        version: `V${newVersionNum}.0`,
        position: store.targetRole || 'Backend Developer Intern',
        company: 'Doanh nghiệp ứng tuyển',
        matchScore: store.matchScore || 85,
        cvData: store.cvData,
        targetRole: store.targetRole,
        updatedAt: new Date().toISOString(),
        status: 'active',
      };

      const updatedHistory = [newCvItem, ...existingHistory];
      localStorage.setItem('saved_cv_history', JSON.stringify(updatedHistory));

      setSaveMsg('Đã lưu CV vào Lịch sử ứng tuyển thành công!');
      setTimeout(() => setSaveMsg(''), 4000);
    } catch (e) {
      console.error(e);
    }
  }

  // Xử lý gửi JD để AI phân tích
  async function handleAnalyze() {
    if (!store.jobDescription.trim() || !store.targetRole.trim()) return;

    store.startProcessing();

    try {
      // Simulate processing steps UI
      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 600 + Math.random() * 300));
        store.updateProcessingStep(i);
      }

      // Gọi API thật
      let result;
      try {
        result = await generateCV({
          targetRole: store.targetRole,
          jobDescription: store.jobDescription,
          emphasizeProjects: store.emphasizeProjects,
        });
      } catch (apiErr) {
        console.error('API call error, using store fallback:', apiErr);
      }

      if (result) {
        const updatedData = { ...result.cvData };
        if (user) {
          updatedData.personalInfo = {
            ...updatedData.personalInfo,
            fullName: user.fullName || updatedData.personalInfo?.fullName || 'Nguyễn Văn Test',
            email: user.email || updatedData.personalInfo?.email || 'nguyenvantest@email.com',
            phone: user.phoneNumber || updatedData.personalInfo?.phone || '0909090909',
            github: updatedData.personalInfo?.github || 'github.com/nguyenvantest',
            linkedin: updatedData.personalInfo?.linkedin || updatedData.personalInfo?.linkedIn || 'linkedin.com/in/nguyenvantest',
          };
        }
        store.setCvResult({ ...result, cvData: updatedData });
      } else {
        // Chuyển sang editing state với dữ liệu hiện có trong store
        store.setWorkspaceState('editing');
      }
    } catch (err) {
      console.error('Processing error:', err);
      store.setWorkspaceState('editing');
    }
  }

  // Xử lý kéo thả file JD
  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) readFileContent(file);
  }

  async function readFileContent(file) {
    const ext = file.name.split('.').pop()?.toLowerCase();

    // File .txt → đọc trực tiếp trên client
    if (ext === 'txt') {
      const reader = new FileReader();
      reader.onload = (e) => {
        store.setJobDescription(e.target.result);
        setAttachedFile({ name: file.name, size: file.size });
        setFileParseError('');
      };
      reader.readAsText(file);
      return;
    }

    // File PDF/DOCX → gửi lên server trích xuất text
    const allowedExts = ['pdf', 'docx', 'doc'];
    if (!allowedExts.includes(ext)) {
      setFileParseError(`Định dạng .${ext} không được hỗ trợ. Chỉ hỗ trợ: .pdf, .docx, .txt`);
      return;
    }

    // Giới hạn 5MB
    if (file.size > 5 * 1024 * 1024) {
      setFileParseError('File vượt quá giới hạn 5MB.');
      return;
    }

    setFileParseLoading(true);
    setFileParseError('');
    setAttachedFile({ name: file.name, size: file.size });

    try {
      const result = await parseJdFile(file);
      if (result.success && result.text) {
        store.setJobDescription(result.text);
        setFileParseError('');
      } else {
        setFileParseError('Không thể trích xuất nội dung từ file.');
        setAttachedFile(null);
      }
    } catch (err) {
      console.error('File parse error:', err);
      const msg = err.response?.data?.message || err.message || 'Lỗi xử lý file.';
      setFileParseError(msg);
      setAttachedFile(null);
    } finally {
      setFileParseLoading(false);
    }
  }

  // Xóa file đính kèm
  function handleRemoveFile() {
    setAttachedFile(null);
    setFileParseError('');
    store.setJobDescription('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Xuất PDF chuẩn 1 trang A4 (html2pdf.js)
  async function handleExportPDF() {
    const element = document.getElementById('cv-preview-content');
    if (!element) return;

    const html2pdf = (await import('html2pdf.js')).default;

    // Lưu style cũ
    const originalShadow = element.style.boxShadow;
    const originalRadius = element.style.borderRadius;
    const originalMargin = element.style.margin;

    element.style.boxShadow = 'none';
    element.style.borderRadius = '0';
    element.style.margin = '0';

    const opt = {
      margin: 0,
      filename: `CV_${store.cvData.personalInfo?.fullName || 'GeneralCV'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollY: 0,
        scrollX: 0,
        windowWidth: 794, // 210mm at 96 DPI
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
      pagebreak: { mode: 'none' } // Ngăn tuyệt đối tạo trang 2
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error('PDF generation error:', e);
    } finally {
      element.style.boxShadow = originalShadow;
      element.style.borderRadius = originalRadius;
      element.style.margin = originalMargin;
    }
  }

  return (
    <MainLayout>
      <div className="fade-in" style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', minHeight: 'calc(100vh - 120px)' }}>

        {/* === TRẠNG THÁI 1: Thiết lập đầu vào === */}
        {store.workspaceState === 'input' && (
          <div style={{ maxWidth: 720, margin: 'var(--space-8) auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
              <div
                style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, var(--color-primary-light), #EDE9FE)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto var(--space-4)', color: 'var(--color-primary)',
                }}
              >
                <Sparkles size={24} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                Tạo CV tối ưu theo Job Description
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
                Dán nội dung tin tuyển dụng, hệ thống AI sẽ phân tích và tự động tối ưu CV phù hợp nhất cho bạn.
              </p>
            </div>

            <div className="card" style={{ padding: 'var(--space-8)' }}>
              {/* Vị trí ứng tuyển */}
              <div className="input-group" style={{ marginBottom: 'var(--space-5)' }}>
                <label className="input-label">Vị trí ứng tuyển</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Ví dụ: Backend Developer Intern, Frontend Engineer..."
                  value={store.targetRole}
                  onChange={(e) => store.setTargetRole(e.target.value)}
                />
              </div>

              {/* JD Textarea + Drag&Drop */}
              <div className="input-group" style={{ marginBottom: 'var(--space-5)' }}>
                <label className="input-label">Nội dung tin tuyển dụng (JD)</label>

                {/* File attachment chip */}
                {attachedFile && (
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                      padding: '8px 12px', marginBottom: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-primary-light)',
                      border: '1px solid var(--color-primary)',
                      fontSize: '13px', color: 'var(--color-primary)',
                    }}
                  >
                    <Paperclip size={14} />
                    <span style={{ fontWeight: 600 }}>{attachedFile.name}</span>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                      ({(attachedFile.size / 1024).toFixed(1)} KB)
                    </span>
                    {fileParseLoading && (
                      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', marginLeft: 'auto' }} />
                    )}
                    {!fileParseLoading && (
                      <button
                        onClick={handleRemoveFile}
                        style={{
                          marginLeft: 'auto', background: 'none', border: 'none',
                          cursor: 'pointer', color: 'var(--color-text-secondary)',
                          padding: 2, display: 'flex',
                        }}
                        title="Xóa file đính kèm"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}

                {/* File parse error */}
                {fileParseError && (
                  <div
                    style={{
                      padding: '8px 12px', marginBottom: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-danger-light)', border: '1px solid var(--color-danger)',
                      fontSize: '13px', color: 'var(--color-danger)',
                      display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    }}
                  >
                    <AlertTriangle size={14} />
                    <span>{fileParseError}</span>
                  </div>
                )}

                {/* File parse loading overlay */}
                {fileParseLoading && (
                  <div
                    style={{
                      padding: '16px', marginBottom: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg-secondary)',
                      border: '1px dashed var(--color-primary)',
                      textAlign: 'center', fontSize: '13px',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', margin: '0 auto var(--space-2)' }} />
                    <div>Đang trích xuất nội dung từ <strong>{attachedFile?.name}</strong>...</div>
                  </div>
                )}

                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-md)',
                    border: dragOver ? '2px dashed var(--color-primary)' : '1px solid var(--color-border)',
                    background: dragOver ? 'var(--color-primary-light)' : 'var(--color-bg)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <textarea
                    className="input-field"
                    rows={8}
                    placeholder="Dán toàn bộ nội dung tin tuyển dụng vào đây, hoặc kéo thả / tải file PDF, DOCX, TXT..."
                    value={store.jobDescription}
                    onChange={(e) => store.setJobDescription(e.target.value)}
                    style={{ border: 'none', resize: 'vertical', minHeight: 200 }}
                    disabled={fileParseLoading}
                  />
                  {!store.jobDescription && !fileParseLoading && (
                    <div
                      style={{
                        position: 'absolute', bottom: 12, right: 12,
                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                      }}
                    >
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={14} /> Tải file JD (.pdf, .docx, .txt)
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.doc,.docx,.pdf"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files[0]) readFileContent(e.target.files[0]);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Checkbox */}
              <label
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  marginBottom: 'var(--space-8)', cursor: 'pointer', fontSize: '14px',
                }}
              >
                <input
                  type="checkbox"
                  checked={store.emphasizeProjects}
                  onChange={(e) => store.setEmphasizeProjects(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--color-accent-ai)' }}
                />
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                  Nhấn mạnh đồ án thực tế
                </span>
              </label>

              {/* CTA Button */}
              <button
                className="btn btn-ai"
                disabled={!store.targetRole.trim() || !store.jobDescription.trim()}
                onClick={handleAnalyze}
                style={{
                  width: '100%', padding: 'var(--space-4)', fontSize: '15px', fontWeight: 600,
                }}
              >
                <span>Phân tích JD & Tối ưu hóa CV với AI</span>
                <Sparkles size={18} />
              </button>
            </div>
          </div>
        )}

        {/* === TRẠNG THÁI 2: Processing Progress === */}
        {store.workspaceState === 'processing' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: 'var(--space-8) 0' }}>
            <div
              className="card fade-in"
              style={{
                padding: 'var(--space-8) var(--space-10)', textAlign: 'center',
                maxWidth: 480, width: '100%', boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--color-border)',
              }}
            >
              {/* Spinner */}
              <div
                style={{
                  width: 56, height: 56, margin: '0 auto var(--space-6)',
                  border: '3.5px solid #E2E8F0',
                  borderTop: '3.5px solid var(--color-accent-ai)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)' }}>
                AI đang phân tích & tối ưu CV...
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
                Đang xử lý RAG & so khớp ngữ nghĩa đối với JD
              </p>

              {/* Checklist tiến độ */}
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {store.processingSteps.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: step.done ? 'var(--color-success-light)' : 'var(--color-bg)',
                      border: step.done ? '1px solid var(--color-success)' : '1px solid var(--color-border)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {step.done ? (
                      <Check size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                    ) : (
                      <Loader2 size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, animation: 'spin 1s linear infinite' }} />
                    )}
                    <span style={{
                      fontSize: '13px',
                      color: step.done ? 'var(--color-success)' : 'var(--color-text-secondary)',
                      fontWeight: step.done ? 600 : 400,
                    }}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === TRẠNG THÁI 3: Split Screen Editing === */}
        {store.workspaceState === 'editing' && (
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 'var(--space-6)', alignItems: 'start', paddingBottom: 'var(--space-8)' }}>

            {/* === Bên trái: Panel tinh chỉnh === */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', position: 'sticky', top: 'calc(var(--header-height) + var(--space-6))' }}>

              {/* Vòng tròn Match Score */}
              <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                <MatchScoreCircle score={store.matchScore} />
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: 'var(--space-3)' }}>
                  Độ phù hợp với tin tuyển dụng
                </p>
              </div>

              {/* Cảnh báo từ khóa thiếu */}
              {store.missingKeywords.length > 0 && (
                <div
                  className="card"
                  style={{
                    padding: 'var(--space-5)',
                    border: '1px solid var(--color-warning-border)',
                    background: 'var(--color-warning-light)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                    <AlertTriangle size={16} style={{ color: 'var(--color-warning)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-warning)' }}>Từ khóa còn thiếu</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {store.missingKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="badge badge-warning"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          const skills = [...(store.cvData.technicalSkills || []), kw];
                          store.updateCvField('technicalSkills', skills);
                        }}
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                    Vui lòng bổ sung để đạt điểm cao hơn!
                  </p>
                </div>
              )}

              {/* Ô sửa nhanh thông tin cá nhân */}
              <div className="card" style={{ padding: 'var(--space-5)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                  Thông tin cá nhân
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <MiniInput
                    label="Họ và tên"
                    value={store.cvData.personalInfo?.fullName || ''}
                    onChange={(v) => store.updateCvField('personalInfo.fullName', v)}
                  />
                  <MiniInput
                    label="Email"
                    value={store.cvData.personalInfo?.email || ''}
                    onChange={(v) => store.updateCvField('personalInfo.email', v)}
                  />
                  <MiniInput
                    label="Số điện thoại"
                    value={store.cvData.personalInfo?.phone || ''}
                    onChange={(v) => store.updateCvField('personalInfo.phone', v)}
                  />
                  <MiniInput
                    label="Địa chỉ"
                    value={store.cvData.personalInfo?.address || ''}
                    onChange={(v) => store.updateCvField('personalInfo.address', v)}
                  />
                  <MiniInput
                    label="LinkedIn"
                    value={store.cvData.personalInfo?.linkedIn || store.cvData.personalInfo?.linkedin || ''}
                    onChange={(v) => store.updateCvField('personalInfo.linkedIn', v)}
                  />
                  <MiniInput
                    label="GitHub"
                    value={store.cvData.personalInfo?.github || ''}
                    onChange={(v) => store.updateCvField('personalInfo.github', v)}
                  />
                </div>
              </div>

              {/* Sửa mục tiêu nghề nghiệp */}
              <div className="card" style={{ padding: 'var(--space-5)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                  Mục tiêu nghề nghiệp
                </h4>
                <textarea
                  className="input-field"
                  rows={4}
                  value={store.cvData.professionalSummary || store.cvData.summary || ''}
                  onChange={(e) => {
                    store.updateCvField('professionalSummary', e.target.value);
                    store.updateCvField('summary', e.target.value);
                  }}
                  style={{ resize: 'vertical', fontSize: '13px' }}
                />
              </div>

              {/* Nút tạo lại */}
              <button
                className="btn btn-outline"
                onClick={() => store.resetWorkspace()}
                style={{ width: '100%', fontSize: '13px' }}
              >
                <RefreshCw size={14} />
                <span>Tạo CV mới</span>
              </button>
            </div>

            {/* === Bên phải: CV Preview A4 === */}
            <div>
              {saveMsg && (
                <div
                  className="fade-in"
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-success-light)',
                    border: '1px solid var(--color-success)',
                    color: 'var(--color-success)',
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: 'var(--space-4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                  }}
                >
                  <Check size={18} />
                  <span>{saveMsg}</span>
                </div>
              )}

              <CVPreview cvData={store.cvData} template={store.selectedTemplate} targetRole={store.targetRole} />

              {/* Cụm nút xuất file & lưu */}
              <div
                style={{
                  display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)',
                  marginTop: 'var(--space-5)', padding: 'var(--space-4) 0',
                }}
              >
                <button
                  className="btn btn-primary"
                  onClick={handleSaveCV}
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  <Save size={16} />
                  <span>Lưu CV vào Lịch sử</span>
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleExportPDF}
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  <Download size={16} />
                  <span>Tải PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

// Mini input sub-component
function MiniInput({ label, value, onChange }) {
  return (
    <div>
      <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 2 }}>
        {label}
      </label>
      <input
        type="text"
        className="input-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: '6px 10px', fontSize: '13px' }}
      />
    </div>
  );
}
