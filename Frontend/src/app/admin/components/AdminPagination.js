'use client';

import { Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { paginationBtnStyle } from './adminConfig';

export function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-6)', color: 'var(--color-text-muted)' }}>
      <Database size={48} style={{ margin: '0 auto var(--space-4)', opacity: 0.2 }} />
      <p style={{ fontSize: '15px', fontWeight: 500 }}>Không tìm thấy dữ liệu</p>
      <p style={{ fontSize: '13px', marginTop: 'var(--space-2)' }}>Bảng này chưa có dữ liệu hoặc thử thay đổi từ khóa tìm kiếm</p>
    </div>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    if (end - start < 4) {
      if (start === 1) end = Math.min(totalPages, start + 4);
      else start = Math.max(1, end - 4);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        marginTop: 'var(--space-6)',
        paddingTop: 'var(--space-4)',
        borderTop: '1px solid var(--color-border-light)',
      }}
    >
      <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={paginationBtnStyle}>
        <ChevronLeft size={16} />
      </button>
      {getPageNumbers().map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            ...paginationBtnStyle,
            background: p === currentPage ? 'var(--color-primary)' : 'transparent',
            color: p === currentPage ? 'white' : 'var(--color-text-secondary)',
            fontWeight: p === currentPage ? 600 : 400,
            border: p === currentPage ? 'none' : '1px solid var(--color-border)',
          }}
        >
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} style={paginationBtnStyle}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
