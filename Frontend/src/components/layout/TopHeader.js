'use client';
// ============================================================
// TopHeader - Thanh đầu trang
// Hiển thị: Nút Hamburger Mobile, Tiêu đề động, Toggle Theme (Desktop), Avatar + Dropdown
// ============================================================

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { LogOut, ChevronDown, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ROLE_LABELS } from '@/lib/constants';

// Map pathname → tiêu đề trang
const PAGE_TITLES = {
  '/dashboard': 'Trang chủ',
  '/student/profile': 'Hồ sơ sinh viên',
  '/cv-workspace': 'Không gian tạo CV',
  '/cv-history': 'Lịch sử ứng tuyển',
  '/settings': 'Cài đặt',
  '/test-data': 'Quản trị hệ thống',
};

export default function TopHeader({ onMobileToggleMenu = () => {} }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  const pageTitle = PAGE_TITLES[pathname] || 'Trang chủ';
  const userInitials = user?.fullName
    ? user.fullName.split(' ').slice(-1)[0]?.[0]?.toUpperCase() || 'U'
    : 'U';

  return (
    <header
      style={{
        height: 'var(--header-height)',
        background: 'var(--header-bg)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-4)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(12px)',
        transition: 'background-color 300ms ease, border-color 300ms ease',
      }}
    >
      {/* Left: Mobile Hamburger Button + Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button
          onClick={onMobileToggleMenu}
          className="show-on-mobile"
          title="Mở menu"
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Menu size={20} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
          {pageTitle}
        </h2>
      </div>

      {/* Right: Theme Switcher (Desktop Only) + Avatar Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* Nút Toggle Dark / Light Theme (Desktop Only — trên Mobile đã chuyển vào chân Nav) */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="hide-on-mobile"
            title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: theme === 'dark' ? '#FBBF24' : 'var(--color-text-secondary)',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {theme === 'dark' ? (
              <Sun size={20} style={{ transition: 'transform 300ms ease' }} />
            ) : (
              <Moon size={20} style={{ transition: 'transform 300ms ease' }} />
            )}
          </button>
        )}

        {/* User Avatar + Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-1) var(--space-2)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-ai))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {userInitials}
            </div>
            <div style={{ textAlign: 'left' }} className="hide-on-mobile">
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2, margin: 0 }}>
                {user?.fullName || 'Người dùng'}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.2, margin: 0 }}>
                {ROLE_LABELS[user?.role] || 'Sinh viên'}
              </p>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                onClick={() => setShowDropdown(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 190,
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--color-border)',
                  padding: 'var(--space-2)',
                  zIndex: 50,
                }}
              >
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                    window.location.href = '/login';
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--color-danger)',
                    fontSize: '13px',
                    fontFamily: 'var(--font-family)',
                  }}
                >
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
