'use client';
// ============================================================
// MainLayout - Layout chính (Sidebar + Header + Content)
// Quản lý trạng thái thu gọn Sidebar (Desktop) & Drawer Mobile
// Persist collapse state vào localStorage (sidebar_collapsed)
// ============================================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';

export default function MainLayout({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Kiểm tra window width khi resize
  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsMobileOpen(false);
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleToggleCollapse = toggleCollapse;

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--color-bg)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 44,
              height: 44,
              border: '3px solid var(--color-border)',
              borderTop: '3px solid var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto var(--space-4)',
            }}
          />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Đang tải hệ thống...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Tính toán margin-left thực tế cho content
  const mainMarginLeft = isMobile
    ? '0px'
    : isCollapsed
    ? 'var(--sidebar-collapsed-width)'
    : 'var(--sidebar-width)';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <Sidebar
        isCollapsed={isMobile ? false : isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div
        style={{
          flex: 1,
          marginLeft: mainMarginLeft,
          transition: 'margin-left 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        <TopHeader onMobileToggleMenu={() => setIsMobileOpen((prev) => !prev)} />
        <main
          style={{
            flex: 1,
            padding: isMobile ? 'var(--space-4)' : 'var(--space-8)',
            background: 'var(--color-bg)',
            transition: 'padding 0.2s ease',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
