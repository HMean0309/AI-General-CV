'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircleUserRound, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Nếu đã đăng nhập → redirect dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  // Validation
  function validate() {
    const errors = {};
    if (!userName.trim()) errors.userName = 'Vui lòng nhập tên đăng nhập';
    if (!password) errors.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 4) errors.password = 'Mật khẩu phải có ít nhất 4 ký tự';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(userName, password);
      router.push('/dashboard');
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setError('Tên đăng nhập hoặc mật khẩu không chính xác');
      } else if (status === 403) {
        setError('Tài khoản của bạn đã bị khóa');
      } else if (!err.response) {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading) return null;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        padding: 'var(--space-6)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Login Card */}
      <div
        className="fade-in"
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-6) var(--space-5)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: '0 auto var(--space-5)',
              borderRadius: 'var(--radius-lg)',
              background: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
            }}
          >
            <CircleUserRound size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
            AI General CV
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Đăng nhập để quản lý hồ sơ năng lực của bạn
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-danger-light)',
              color: 'var(--color-danger)',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: 'var(--space-6)',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <AlertCircle size={18} style={{ minWidth: 18 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="input-group" style={{ marginBottom: 'var(--space-5)' }}>
            <label className="input-label" htmlFor="login-username">
              Tên đăng nhập
            </label>
            <input
              id="login-username"
              type="text"
              className={`input-field ${fieldErrors.userName ? 'error' : ''}`}
              placeholder="Nhập tên đăng nhập..."
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                if (fieldErrors.userName) setFieldErrors(prev => ({ ...prev, userName: '' }));
              }}
              autoComplete="username"
              autoFocus
            />
            {fieldErrors.userName && (
              <span className="input-error-text">{fieldErrors.userName}</span>
            )}
          </div>

          {/* Password */}
          <div className="input-group" style={{ marginBottom: 'var(--space-8)' }}>
            <label className="input-label" htmlFor="login-password">
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className={`input-field ${fieldErrors.password ? 'error' : ''}`}
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
                }}
                autoComplete="current-password"
                style={{ paddingRight: 48 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <span className="input-error-text">{fieldErrors.password}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: 'var(--space-4) var(--space-6)',
              fontSize: '15px',
              fontWeight: 600,
              boxShadow: 'none',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {isSubmitting ? (
              <>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }}
                />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Đăng nhập</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p
          style={{
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: '12px',
            marginTop: 'var(--space-8)',
          }}
        >
          Hệ thống quản lý hồ sơ năng lực & tối ưu CV
        </p>
      </div>
    </div>
  );
}
