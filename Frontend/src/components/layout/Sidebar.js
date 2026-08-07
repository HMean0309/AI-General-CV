'use client';
// ============================================================
// Sidebar - Thanh điều hướng dọc (Hỗ trợ Desktop & Mobile Drawer)
// Persist collapse state vào localStorage (sidebar_collapsed)
// Bổ sung nút đổi Theme Dark/Light ở Chân Nav trên Mobile
// ============================================================

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Home,
  UserCheck,
  FileSpreadsheet,
  ClipboardList,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cpu,
  ShieldCheck,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { SIDEBAR_ITEMS, ROLES } from '@/lib/constants';

const iconMap = {
  Home,
  UserCheck,
  FileSpreadsheet,
  ClipboardList,
  Settings,
  ShieldCheck,
};

export default function Sidebar({
  isCollapsed = false,
  onToggleCollapse = () => {},
  isMobileOpen = false,
  onMobileClose = () => {},
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();

  // Đóng Mobile Drawer khi chuyển trang
  useEffect(() => {
    onMobileClose();
  }, [pathname]);

  // Lọc mục menu theo Role
  const visibleItems = SIDEBAR_ITEMS.filter((item) => {
    if (item.adminOnly) return user?.role === ROLES.ADMIN;
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 90,
            transition: 'opacity 0.3s ease',
          }}
          className="show-on-mobile"
        />
      )}

      <aside
        className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          height: '100vh',
          background: 'var(--color-sidebar-bg)',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease, width 0.25s ease, background-color 300ms ease',
          boxShadow: '2px 0 12px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Logo / Brand Header */}
        <div
          style={{
            padding: isCollapsed ? 'var(--space-6) var(--space-4)' : 'var(--space-6) var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            minHeight: 'var(--header-height)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: 36,
                height: 36,
                minWidth: 36,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cpu size={20} color="white" />
            </div>
            {!isCollapsed && (
              <div style={{ overflow: 'hidden' }}>
                <h3
                  style={{
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  AI General CV
                </h3>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '11px',
                    fontWeight: 400,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Hệ thống tối ưu CV
                </p>
              </div>
            )}
          </div>

          {/* Mobile Close Icon */}
          <button
            onClick={onMobileClose}
            className="show-on-mobile"
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            flex: 1,
            padding: 'var(--space-4) var(--space-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
            overflowY: 'auto',
          }}
        >
          {visibleItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.key}
                href={item.href}
                title={item.label}
                onClick={onMobileClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: isCollapsed ? 'var(--space-3)' : 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                  background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all var(--transition-fast)',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  position: 'relative',
                }}
              >
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3,
                      height: 16,
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-primary)',
                    }}
                  />
                )}
                {Icon && <Icon size={20} style={{ minWidth: 20 }} />}
                {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions: Mobile Theme Switcher + Desktop Collapse Toggle */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-3)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          {/* Mobile Theme Toggle Button — Đặt trong chân Nav theo yêu cầu */}
          {mounted && (
            <button
              onClick={toggleTheme}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.08)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all var(--transition-fast)',
                fontFamily: 'var(--font-family)',
              }}
            >
              {theme === 'dark' ? <Sun size={18} color="#FBBF24" /> : <Moon size={18} color="#93C5FD" />}
              {!isCollapsed && (
                <span>{theme === 'dark' ? 'Giao diện Sáng' : 'Giao diện Tối'}</span>
              )}
            </button>
          )}

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className="hide-on-mobile"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.5)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all var(--transition-fast)',
              fontFamily: 'var(--font-family)',
            }}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!isCollapsed && <span>Thu gọn</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
