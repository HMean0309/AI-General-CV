'use client';
// ============================================================
// MainLayout - Layout chính (Sidebar + Header + Content)
// Bọc toàn bộ các trang đã đăng nhập
// ============================================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { useAuth } from '@/contexts/AuthContext';

export default function MainLayout({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarWidth, setSidebarWidth] = useState('var(--sidebar-width)');

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Theo dõi sidebar width thông qua MutationObserver
  useEffect(() => {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const observer = new MutationObserver(() => {
      setSidebarWidth(sidebar.style.width || 'var(--sidebar-width)');
    });

    observer.observe(sidebar, { attributes: true, attributeFilter: ['style'] });
    setSidebarWidth(sidebar.style.width || 'var(--sidebar-width)');

    return () => observer.disconnect();
  }, []);

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
              width: 48,
              height: 48,
              border: '3px solid var(--color-border)',
              borderTop: '3px solid var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto var(--space-4)',
            }}
          />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Đang tải...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập → không render layout
  if (!isAuthenticated) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          marginLeft: sidebarWidth,
          transition: 'margin-left var(--transition-normal)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <TopHeader />
        <main
          style={{
            flex: 1,
            padding: 'var(--space-8)',
            background: 'var(--color-bg)',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
