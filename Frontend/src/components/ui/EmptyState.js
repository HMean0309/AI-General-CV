'use client';
// ============================================================
// EmptyState - Trạng thái trống chuẩn
// Theo design.md § 5.1: Icon + message + CTA
// ============================================================

export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: 'var(--space-16) var(--space-8)',
      }}
    >
      {icon && (
        <div style={{ margin: '0 auto var(--space-5)', opacity: 0.3 }}>
          {icon}
        </div>
      )}
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-3)',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            marginBottom: actionLabel ? 'var(--space-6)' : 0,
            maxWidth: 400,
            margin: actionLabel ? '0 auto var(--space-6)' : '0 auto',
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
