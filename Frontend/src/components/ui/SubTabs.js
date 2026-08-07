'use client';
// ============================================================
// SubTabs - Thanh điều hướng ngang phân cấp
// Nằm ngay dưới Header, hỗ trợ vuốt cuộn ngang mượt trên Mobile
// ============================================================

export default function SubTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-1)',
        borderBottom: '2px solid var(--color-border-light)',
        marginBottom: 'var(--space-5)',
        paddingBottom: 0,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        maxWidth: '100%',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              background: 'transparent',
              border: 'none',
              borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              fontFamily: 'var(--font-family)',
              marginBottom: '-2px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
