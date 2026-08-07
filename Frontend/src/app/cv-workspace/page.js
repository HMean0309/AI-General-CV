'use client';
// ============================================================
// CV Workspace - Không gian tạo CV (Split Screen & Mobile Tab Switcher)
// 3 Trạng thái: Input → Processing → Editing
// Tối ưu hóa 100% cho Desktop & Mobile / Tablet
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
  Check, Loader2, RefreshCw, ChevronRight, X, Paperclip, Edit3, Eye,
} from 'lucide-react';
import { generateCV, parseJdFile } from '@/services/cvService';

export default function CvWorkspacePage() {
  const { user } = useAuth();
  const store = useCvStore();
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [fileParseLoading, setFileParseLoading] = useState(false);
  const [fileParseError, setFileParseError] = useState('');

  // Tab switch cho Mobile Editing state ('editor' | 'preview')
  const [mobileTab, setMobileTab] = useState('editor');

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
      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 500 + Math.random() * 250));
        store.updateProcessingStep(i);
      }

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
        store.setWorkspaceState('editing');
      }
    } catch (err) {
      console.error('Processing error:', err);
      store.setWorkspaceState('editing');
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) readFileContent(file);
  }

  async function readFileContent(file) {
    const ext = file.name.split('.').pop()?.toLowerCase();

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

    const allowedExts = ['pdf', 'docx', 'doc'];
    if (!allowedExts.includes(ext)) {
      setFileParseError(`Định dạng .${ext} không được hỗ trợ. Chỉ hỗ trợ: .pdf, .docx, .txt`);
      return;
    }

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

  function handleRemoveFile() {
    setAttachedFile(null);
    setFileParseError('');
    store.setJobDescription('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleExportPDF() {
    const element = document.getElementById('cv-preview-content');
    if (!element) return;

    const html2pdf = (await import('html2pdf.js')).default;
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
      html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0, scrollX: 0, windowWidth: 794 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
      pagebreak: { mode: 'none' },
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

        {/* === TRẠNG THÁI 1: Thiết lập đầu vào (Input State) === */}
        {store.workspaceState === 'input' && (
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <div
                style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, var(--color-primary-light), #EDE9FE)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto var(--space-3)', color: 'var(--color-primary)',
                }}
              >
                <Sparkles size={22} />
              </div>
              <h2 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                Tạo CV tối ưu theo Job Description
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: 520, margin: '0 auto', lineHeight: 1.5 }}>
                Dán nội dung tin tuyển dụng, hệ thống AI sẽ phân tích và tự động tối ưu CV phù hợp nhất cho bạn.
              </p>
            </div>

            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="input-label">Vị trí ứng tuyển</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Ví dụ: Backend Developer Intern, Frontend Engineer..."
                  value={store.targetRole}
                  onChange={(e) => store.setTargetRole(e.target.value)}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="input-label">Nội dung tin tuyển dụng (JD)</label>

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
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}

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
                    rows={7}
                    placeholder="Dán toàn bộ nội dung tin tuyển dụng vào đây, hoặc kéo thả / tải file PDF, DOCX, TXT..."
                    value={store.jobDescription}
                    onChange={(e) => store.setJobDescription(e.target.value)}
                    style={{ border: 'none', resize: 'vertical', minHeight: 180 }}
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

              <label
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  marginBottom: 'var(--space-6)', cursor: 'pointer', fontSize: '14px',
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

              <button
                className="btn btn-ai btn-full-mobile"
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

        {/* === TRẠNG THÁI 2: Processing Progress State === */}
        {store.workspaceState === 'processing' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '55vh', padding: 'var(--space-4) 0' }}>
            <div
              className="card fade-in"
              style={{
                padding: 'var(--space-6)', textAlign: 'center',
                maxWidth: 460, width: '100%', boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  width: 48, height: 48, margin: '0 auto var(--space-4)',
                  border: '3.5px solid #E2E8F0',
                  borderTop: '3.5px solid var(--color-accent-ai)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />

              <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-text-primary)' }}>
                AI đang phân tích & tối ưu CV...
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
                Đang xử lý RAG & so khớp ngữ nghĩa đối với JD
              </p>

              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {store.processingSteps.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                      padding: '8px 12px',
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

        {/* === TRẠNG THÁI 3: Editing State (Split Screen + Mobile Tab Switcher) === */}
        {store.workspaceState === 'editing' && (
          <div>
            {/* Mobile Tab Switcher (Chỉ hiển thị trên Mobile) */}
            <div
              className="show-on-mobile"
              style={{
                display: 'flex',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                padding: 4,
                border: '1px solid var(--color-border)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <button
                onClick={() => setMobileTab('editor')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: mobileTab === 'editor' ? 'var(--color-primary)' : 'transparent',
                  color: mobileTab === 'editor' ? 'white' : 'var(--color-text-secondary)',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <Edit3 size={14} /> Chỉnh sửa
              </button>
              <button
                onClick={() => setMobileTab('preview')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: mobileTab === 'preview' ? 'var(--color-primary)' : 'transparent',
                  color: mobileTab === 'preview' ? 'white' : 'var(--color-text-secondary)',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <Eye size={14} /> Xem trước CV
              </button>
            </div>

            {/* Split Screen Grid (Responsive) */}
            <div
              className="workspace-editing-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(320px, 380px) 1fr',
                gap: 'var(--space-6)',
                alignItems: 'start',
                paddingBottom: 'var(--space-8)',
              }}
            >
              {/* Bên trái: Panel tinh chỉnh */}
              <div
                className={`editing-panel-col ${mobileTab === 'preview' ? 'hide-on-mobile' : ''}`}
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
              >
                <div className="card" style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
                  <MatchScoreCircle score={store.matchScore} />
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                    Độ phù hợp với tin tuyển dụng
                  </p>
                </div>

                {store.missingKeywords.length > 0 && (
                  <div
                    className="card"
                    style={{
                      padding: 'var(--space-4)',
                      border: '1px solid var(--color-warning-border)',
                      background: 'var(--color-warning-light)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                      <AlertTriangle size={15} style={{ color: 'var(--color-warning)' }} />
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
                  </div>
                )}

                <div className="card" style={{ padding: 'var(--space-4)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
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

                <div className="card" style={{ padding: 'var(--space-4)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
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

                <button
                  className="btn btn-outline"
                  onClick={() => store.resetWorkspace()}
                  style={{ width: '100%', fontSize: '13px' }}
                >
                  <RefreshCw size={14} />
                  <span>Tạo CV mới</span>
                </button>
              </div>

              {/* Bên phải: CV Preview A4 */}
              <div className={`preview-panel-col ${mobileTab === 'editor' ? 'hide-on-mobile' : ''}`}>
                {saveMsg && (
                  <div
                    className="fade-in"
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-success-light)',
                      border: '1px solid var(--color-success)',
                      color: 'var(--color-success)',
                      fontSize: '13px',
                      fontWeight: 600,
                      marginBottom: 'var(--space-4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                    }}
                  >
                    <Check size={16} />
                    <span>{saveMsg}</span>
                  </div>
                )}

                <CVPreview cvData={store.cvData} template={store.selectedTemplate} targetRole={store.targetRole} />

                <div
                  style={{
                    display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)',
                    marginTop: 'var(--space-4)', padding: 'var(--space-2) 0',
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    className="btn btn-primary btn-full-mobile"
                    onClick={handleSaveCV}
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    <Save size={15} />
                    <span>Lưu CV vào Lịch sử</span>
                  </button>
                  <button
                    className="btn btn-success btn-full-mobile"
                    onClick={handleExportPDF}
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    <Download size={15} />
                    <span>Tải PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .workspace-editing-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </MainLayout>
  );
}

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
