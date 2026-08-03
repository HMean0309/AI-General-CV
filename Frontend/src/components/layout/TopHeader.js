'use client';
// ============================================================
// TopHeader - Thanh đầu trang
// Hiển thị: Tiêu đề trang động, Avatar + Dropdown đăng xuất
// Theo AIGeneralCV_Specification.md § 3.1
// ============================================================

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
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

export default function TopHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const pageTitle = PAGE_TITLES[pathname] || 'Trang chủ';
  const userInitials = user?.fullName
    ? user.fullName.split(' ').slice(-1)[0]?.[0]?.toUpperCase() || 'U'
    : 'U';

  return (
    <header
      style={{
        height: 'var(--header-height)',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-8)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
      }}
    >
      {/* Left: Page Title */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {pageTitle}
        </h2>
      </div>

      {/* Right: Avatar + Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {/* User Avatar + Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg)'; }}
            onMouseLeave={(e) => { if (!showDropdown) e.currentTarget.style.background = 'transparent'; }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-ai))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
              }}
            >
              {userInitials}
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
              }}>
                {user?.fullName || 'Người dùng'}
              </p>
              <p style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                lineHeight: 1.3,
              }}>
                {ROLE_LABELS[user?.role] || 'Sinh viên'}
              </p>
            </div>
            <ChevronDown
              size={16}
              style={{
                color: 'var(--color-text-muted)',
                transition: 'transform var(--transition-fast)',
                transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)',
              }}
            />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 40,
                }}
                onClick={() => setShowDropdown(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 200,
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--color-border)',
                  padding: 'var(--space-2)',
                  zIndex: 50,
                  animation: 'fadeIn 0.15s ease-out',
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
                    fontSize: '14px',
                    fontFamily: 'var(--font-family)',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-danger-light)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
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
