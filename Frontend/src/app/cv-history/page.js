'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import EmptyState from '@/components/ui/EmptyState';
import CVPreview from '@/components/cv/CVPreview';
import { getCvHistory, getCvById } from '@/services/cvService';
import {
  Eye, Download, Copy, Archive, FileText, Trash2,
  Calendar, Building2, Briefcase, X, MoreHorizontal,
} from 'lucide-react';

export default function CvHistoryPage() {
  const router = useRouter();
  const [cvList, setCvList] = useState([]);
  const [previewId, setPreviewId] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [loading, setLoading] = useState(true);

  // Đọc danh sách CV thực tế từ API Backend
  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      let apiResults = [];
      try {
        const res = await getCvHistory();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          apiResults = res.data.map((item, idx) => ({
            id: item.id,
            version: `V${res.data.length - idx}.0`,
            position: item.jobTitle || 'Vị trí ứng tuyển',
            company: 'Doanh nghiệp ứng tuyển',
            matchScore: item.matchScore || 85,
            updatedAt: item.createdAt,
            status: 'active',
            cvData: null, // sẽ fetch theo ID khi bấm xem
          }));
        }
      } catch (e) {
        console.warn('Backend API getCvHistory failed, fallback to localStorage:', e);
      }

      try {
        const saved = localStorage.getItem('saved_cv_history');
        const localResults = saved ? JSON.parse(saved) : [];

        // Trộn API results và local results (ưu tiên API, loại bỏ trùng ID)
        const apiIds = new Set(apiResults.map(a => a.id));
        const combined = [...apiResults, ...localResults.filter(l => !apiIds.has(l.id))];
        setCvList(combined);
      } catch (e) {
        setCvList(apiResults);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  // Handler xem trước CV (fetch full cvData nếu cần)
  async function handleOpenPreview(id) {
    setPreviewId(id);
    const target = cvList.find(c => c.id === id);
    if (target && !target.cvData) {
      try {
        const detail = await getCvById(id);
        if (detail?.cvData) {
          setCvList(prev => prev.map(c => c.id === id ? { ...c, cvData: detail.cvData, matchScore: detail.matchScore || c.matchScore } : c));
        }
      } catch (err) {
        console.error('Lỗi khi tải chi tiết CV:', err);
      }
    }
  }

  const previewCV = cvList.find((c) => c.id === previewId);

  // Lưu danh sách mới vào localStorage
  function updateCvList(newList) {
    setCvList(newList);
    localStorage.setItem('saved_cv_history', JSON.stringify(newList));
  }

  // Xóa CV
  function handleDelete(id) {
    if (confirm('Bạn có chắc chắn muốn xóa bản CV này khỏi lịch sử?')) {
      const newList = cvList.filter((c) => c.id !== id);
      updateCvList(newList);
      setActiveMenu(null);
      if (previewId === id) setPreviewId(null);
    }
  }

  // Lưu trữ / Khôi phục
  function handleArchive(id) {
    const newList = cvList.map((c) =>
      c.id === id ? { ...c, status: c.status === 'archived' ? 'active' : 'archived' } : c
    );
    updateCvList(newList);
    setActiveMenu(null);
  }

  // Sao chép phiên bản
  function handleDuplicate(id) {
    const original = cvList.find((c) => c.id === id);
    if (!original) return;
    const newVersion = 'V' + (cvList.length + 1) + '.0';
    const newCv = {
      ...original,
      id: 'cv_' + Date.now(),
      version: newVersion,
      updatedAt: new Date().toISOString(),
    };
    updateCvList([newCv, ...cvList]);
    setActiveMenu(null);
  }

  // Tải PDF từ modal hoặc card
  async function handleExportPDF(cvItem) {
    if (!cvItem) return;

    if (!cvItem.cvData) {
      await handleOpenPreview(cvItem.id);
    }

    const element = document.getElementById(`cv-preview-${cvItem.id}`) || document.getElementById('cv-preview-modal-content');
    if (!element) {
      setPreviewId(cvItem.id);
      setTimeout(() => handleExportPDF(cvItem), 300);
      return;
    }

    const html2pdf = (await import('html2pdf.js')).default;
    const opt = {
      margin: 0,
      filename: `CV_${cvItem.cvData?.personalInfo?.fullName || 'GeneralCV'}_${cvItem.version}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0, scrollX: 0, windowWidth: 794 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
      pagebreak: { mode: 'none' },
    };

    await html2pdf().set(opt).from(element).save();
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  return (
    <MainLayout>
      <div className="fade-in" style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: 'var(--space-1)' }}>Lịch sử ứng tuyển</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {cvList.filter((c) => c.status !== 'archived').length} bản CV đã lưu
            </p>
          </div>
          {cvList.length > 0 && (
            <Link href="/cv-workspace">
              <button className="btn btn-primary" style={{ fontSize: '13px' }}>
                + Tạo CV mới
              </button>
            </Link>
          )}
        </div>

        {cvList.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<FileText size={48} />}
              title="Chưa có lịch sử ứng tuyển nào"
              description="Hãy tạo CV đầu tiên tại Không gian tạo CV, sau đó bấm 'Lưu CV vào Lịch sử' để quản lý các bản CV tại đây."
              actionLabel="Tạo CV ngay"
              onAction={() => router.push('/cv-workspace')}
            />
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 'var(--space-5)',
            }}
          >
            {cvList.map((cv) => (
              <div
                key={cv.id}
                className="card"
                style={{
                  padding: 'var(--space-5)',
                  opacity: cv.status === 'archived' ? 0.6 : 1,
                  position: 'relative',
                }}
              >
                {/* Header: Version + Menu */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div
                      style={{
                        width: 40, height: 40, borderRadius: 'var(--radius-md)',
                        background: 'var(--color-primary-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <FileText size={18} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Phiên bản {cv.version}
                      </span>
                      {cv.status === 'archived' && (
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>
                          (Đã lưu trữ)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Menu ba chấm */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setActiveMenu(activeMenu === cv.id ? null : cv.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: 4, borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {activeMenu === cv.id && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setActiveMenu(null)} />
                        <div
                          style={{
                            position: 'absolute', top: '100%', right: 0, zIndex: 20,
                            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                            padding: 'var(--space-1)', minWidth: 170,
                            animation: 'fadeIn 0.15s ease-out',
                          }}
                        >
                          <MenuBtn icon={<Copy size={14} />} label="Sao chép phiên bản" onClick={() => handleDuplicate(cv.id)} />
                          <MenuBtn icon={<Archive size={14} />} label={cv.status === 'archived' ? 'Khôi phục' : 'Lưu trữ'} onClick={() => handleArchive(cv.id)} />
                          <MenuBtn icon={<Trash2 size={14} style={{ color: 'var(--color-danger)' }} />} label="Xóa bản CV" danger onClick={() => handleDelete(cv.id)} />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)' }}>
                    {cv.position || cv.targetRole || 'Vị trí ứng tuyển'}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    <Building2 size={13} /> {cv.company || 'Doanh nghiệp ứng tuyển'}
                  </div>
                </div>

                {/* Footer: Match score + Date + Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span className="badge badge-success" style={{ fontWeight: 600 }}>
                      {cv.matchScore || 85}% Khớp
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> {formatDate(cv.updatedAt)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <IconBtn icon={<Eye size={14} />} title="Xem CV" onClick={() => handleOpenPreview(cv.id)} />
                    <IconBtn icon={<Download size={14} />} title="Tải PDF" onClick={() => handleExportPDF(cv)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal xem CV chi tiết */}
        {previewCV && (
          <>
            <div
              style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
              }}
              onClick={() => setPreviewId(null)}
            />
            <div
              className="fade-in"
              style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 101,
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                padding: 'var(--space-6)',
                maxWidth: 900, width: '95%', maxHeight: '90vh',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Header Modal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                    Chi tiết CV — {previewCV.version} ({previewCV.position})
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                    Tạo ngày: {formatDate(previewCV.updatedAt)} • Độ khớp: {previewCV.matchScore}%
                  </p>
                </div>
                <button
                  onClick={() => setPreviewId(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body Modal (Chứa CVPreview A4) */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4) 0', display: 'flex', justifyContent: 'center', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                <div id="cv-preview-modal-content">
                  <CVPreview cvData={previewCV.cvData} targetRole={previewCV.targetRole || previewCV.position} />
                </div>
              </div>

              {/* Footer Modal */}
              <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
                <button className="btn btn-outline" onClick={() => setPreviewId(null)} style={{ fontSize: '13px' }}>
                  Đóng
                </button>
                <button className="btn btn-success" onClick={() => handleExportPDF(previewCV)} style={{ fontSize: '13px', fontWeight: 600 }}>
                  <Download size={14} /> Tải PDF
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

// --- Sub-components ---

function IconBtn({ icon, title, onClick }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 32, height: 32, borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)', background: 'var(--color-surface)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-text-secondary)', transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg)'; e.currentTarget.style.borderColor = 'var(--color-text-muted)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
    >
      {icon}
    </button>
  );
}

function MenuBtn({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)',
        border: 'none', background: 'transparent', cursor: 'pointer',
        fontSize: '13px', color: danger ? 'var(--color-danger)' : 'var(--color-text-secondary)',
        fontFamily: 'var(--font-family)', transition: 'background var(--transition-fast)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? 'var(--color-danger-light)' : 'var(--color-bg)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      {icon} {label}
    </button>
  );
}
