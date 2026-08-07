'use client';

export default function KPICard({ icon, iconColor, iconBg, label, value }) {
  return (
    <div
      className="card"
      style={{
        padding: 'var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        border: '1px solid var(--color-border)',
        boxShadow: 'none',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          minWidth: 40,
          borderRadius: 'var(--radius-md)',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: iconColor,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: 2 }}>
          {label}
        </p>
        <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
          {value}
        </p>
      </div>
    </div>
  );
}
