'use client';
// ============================================================
// Pagination - Thanh phân trang
// Đọc từ custom headers: X-Total-Count, X-Page, X-Page-Size
// ============================================================

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalCount === 0) return null;

  const { totalCount, page, pageSize } = pagination;
  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  const btnStyle = (isActive) => ({
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-md)',
    border: isActive ? 'none' : '1px solid var(--color-border)',
    background: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
    color: isActive ? 'white' : 'var(--color-text-secondary)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: isActive ? 600 : 400,
    fontFamily: 'var(--font-family)',
    transition: 'all var(--transition-fast)',
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        marginTop: 'var(--space-6)',
      }}
    >
      <button
        style={btnStyle(false)}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft size={16} />
      </button>

      {start > 1 && (
        <>
          <button style={btnStyle(false)} onClick={() => onPageChange(1)}>1</button>
          {start > 2 && <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>...</span>}
        </>
      )}

      {pages.map((p) => (
        <button key={p} style={btnStyle(p === page)} onClick={() => onPageChange(p)}>
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>...</span>}
          <button style={btnStyle(false)} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button
        style={btnStyle(false)}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        <ChevronRight size={16} />
      </button>

      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: 'var(--space-3)' }}>
        {totalCount} kết quả
      </span>
    </div>
  );
}
