'use client';
// ============================================================
// Sidebar - Thanh điều hướng dọc cố định bên trái
// Nền Navy Deep (#1E3A8A), 5 mục điều hướng
// Theo AIGeneralCV_Specification.md § 3.1
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Lọc các mục sidebar: chỉ hiển thị adminOnly cho admin
  const visibleItems = SIDEBAR_ITEMS.filter(item => {
    if (item.adminOnly) return user?.role === ROLES.ADMIN;
    return true;
  });

  return (
    <aside
      className="sidebar"
      style={{
        width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        minHeight: '100vh',
        background: 'var(--color-secondary)', /* Màu phẳng Slate sẫm */
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-normal)',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Logo / Brand */}
      <div
        style={{
          padding: isCollapsed ? 'var(--space-6) var(--space-4)' : 'var(--space-6) var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          minHeight: 'var(--header-height)',
        }}
      >
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

      {/* Navigation Items */}
      <nav style={{ flex: 1, padding: 'var(--space-4) var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        {visibleItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.key}
              href={item.href}
              title={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: isCollapsed ? 'var(--space-3)' : 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                background: isActive
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'transparent',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                transition: 'all var(--transition-fast)',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                }
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

      {/* Collapse Toggle */}
      <div style={{ padding: 'var(--space-4) var(--space-3)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
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
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!isCollapsed && <span>Thu gọn</span>}
        </button>
      </div>
    </aside>
  );
}
