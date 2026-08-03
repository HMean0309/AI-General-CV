'use client';
// ============================================================
// Cài đặt (Settings) - 3 Tabs
// Tab 1: Quản lý tài khoản (đổi mật khẩu)
// Tab 2: Cấu hình API Key
// Tab 3: Quản lý Mẫu CV Template
// ============================================================

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import SubTabs from '@/components/ui/SubTabs';
import { useAuth } from '@/contexts/AuthContext';
import useCvStore from '@/stores/cvStore';
import {
  User, Key, Layout, Eye, EyeOff,
  Save, Check, AlertCircle,
} from 'lucide-react';
import { changePassword } from '@/services/authService';

const TABS = [
  { key: 'account', label: 'Tài khoản' },
  { key: 'api-key', label: 'API Key' },
  { key: 'templates', label: 'Mẫu CV' },
];

const CV_TEMPLATES = [
  {
    id: 'modern',
    name: 'Hiện đại',
    description: 'Bố cục gọn gàng, phân cấp rõ ràng, phù hợp với ngành Công nghệ',
    color: '#2563EB',
  },
  {
    id: 'classic',
    name: 'Cổ điển',
    description: 'Truyền thống, trang trọng, phù hợp với tổ chức lớn và ngành tài chính',
    color: '#1E293B',
  },
  {
    id: 'creative',
    name: 'Sáng tạo',
    description: 'Nổi bật, cá tính, phù hợp với startup và ngành thiết kế',
    color: '#7C3AED',
  },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { selectedTemplate, setSelectedTemplate } = useCvStore();
  const [activeTab, setActiveTab] = useState('account');

  // Account form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  // API Key
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyMsg, setApiKeyMsg] = useState({ type: '', text: '' });

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400 || status === 401) {
        setPasswordMsg({ type: 'error', text: 'Mật khẩu hiện tại không chính xác' });
      } else {
        setPasswordMsg({ type: 'error', text: 'Đã xảy ra lỗi, vui lòng thử lại' });
      }
    } finally {
      setSavingPassword(false);
    }
  }

  function handleSaveApiKey() {
    if (!apiKey.trim()) {
      setApiKeyMsg({ type: 'error', text: 'Vui lòng nhập API Key' });
      return;
    }
    // Lưu vào localStorage (hoặc gọi API nếu backend hỗ trợ)
    localStorage.setItem('custom_api_key', apiKey);
    setApiKeyMsg({ type: 'success', text: 'Đã lưu API Key thành công!' });
    setTimeout(() => setApiKeyMsg({ type: '', text: '' }), 3000);
  }

  return (
    <MainLayout>
      <div className="fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
        <SubTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* TAB 1: Tài khoản */}
        {activeTab === 'account' && (
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <User size={20} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Thông tin tài khoản</h3>
            </div>

            {/* Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', marginBottom: 'var(--space-8)', padding: 'var(--space-5)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)' }}>
              <InfoField label="Họ và tên" value={user?.fullName || '—'} />
              <InfoField label="Mã SV" value={user?.userInternalId || '—'} />
              <InfoField label="Tên đăng nhập" value={user?.userName || '—'} />
              <InfoField label="Vai trò" value={user?.role === 1 ? 'Quản trị viên' : user?.role === 2 ? 'Giảng viên' : 'Sinh viên'} />
            </div>

            {/* Đổi mật khẩu */}
            <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-6)' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: 'var(--space-5)' }}>
                Đổi mật khẩu
              </h4>

              {passwordMsg.text && (
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-4)', fontSize: '13px', fontWeight: 500,
                    background: passwordMsg.type === 'error' ? 'var(--color-danger-light)' : 'var(--color-success-light)',
                    color: passwordMsg.type === 'error' ? 'var(--color-danger)' : '#047857',
                  }}
                >
                  {passwordMsg.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
                  {passwordMsg.text}
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div className="input-group">
                    <label className="input-label">Mật khẩu hiện tại</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="input-field"
                        type={showPasswords ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Nhập mật khẩu hiện tại..."
                        style={{ paddingRight: 44 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4, display: 'flex' }}
                      >
                        {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Mật khẩu mới</label>
                    <input
                      className="input-field"
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Ít nhất 6 ký tự..."
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Xác nhận mật khẩu mới</label>
                    <input
                      className="input-field"
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                    style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
                  >
                    <Save size={14} />
                    <span>{savingPassword ? 'Đang lưu...' : 'Cập nhật mật khẩu'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: API Key */}
        {activeTab === 'api-key' && (
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <Key size={20} style={{ color: 'var(--color-accent-ai)' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Cấu hình API Key</h3>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>
              Nhập API Key cá nhân nếu bạn muốn sử dụng mô hình AI riêng thay vì mô hình mặc định của hệ thống.
            </p>

            {apiKeyMsg.text && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-4)', fontSize: '13px', fontWeight: 500,
                  background: apiKeyMsg.type === 'error' ? 'var(--color-danger-light)' : 'var(--color-success-light)',
                  color: apiKeyMsg.type === 'error' ? 'var(--color-danger)' : '#047857',
                }}
              >
                {apiKeyMsg.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
                {apiKeyMsg.text}
              </div>
            )}

            <div className="input-group" style={{ marginBottom: 'var(--space-5)' }}>
              <label className="input-label">API Key (OpenAI / Groq / Gemini)</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-field"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  style={{ paddingRight: 44, fontFamily: 'monospace', fontSize: '13px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4, display: 'flex' }}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button className="btn btn-ai" onClick={handleSaveApiKey}>
              <Save size={14} />
              <span>Lưu API Key</span>
            </button>
          </div>
        )}

        {/* TAB 3: Mẫu CV */}
        {activeTab === 'templates' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <Layout size={20} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Chọn mẫu CV mặc định</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-5)' }}>
              {CV_TEMPLATES.map((template) => {
                const isSelected = selectedTemplate === template.id;
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    style={{
                      background: 'var(--color-surface)',
                      border: isSelected ? `2px solid ${template.color}` : '2px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-6)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)',
                      position: 'relative',
                      fontFamily: 'var(--font-family)',
                    }}
                  >
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute', top: 12, right: 12,
                          width: 24, height: 24, borderRadius: '50%',
                          background: template.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Check size={14} color="white" />
                      </div>
                    )}

                    {/* Template preview bar */}
                    <div
                      style={{
                        width: '100%', height: 6, borderRadius: 3,
                        background: template.color, marginBottom: 'var(--space-5)', opacity: isSelected ? 1 : 0.4,
                      }}
                    />

                    <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)' }}>
                      {template.name}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      {template.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)', fontWeight: 500 }}>
        {label}
      </p>
      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
        {value}
      </p>
    </div>
  );
}
