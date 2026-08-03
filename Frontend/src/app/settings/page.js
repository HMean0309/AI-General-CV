'use client';
// ============================================================
// Cài đặt (Settings)
// Xem thông tin tài khoản, vai trò, đổi mật khẩu
// ============================================================

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
  User, Eye, EyeOff,
  Save, Check, AlertCircle,
} from 'lucide-react';
import { changePassword } from '@/services/authService';

export default function SettingsPage() {
  const { user } = useAuth();

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [savingPassword, setSavingPassword] = useState(false);

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

  return (
    <MainLayout>
      <div className="fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Thông tin tài khoản */}
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
