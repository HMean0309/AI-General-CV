'use client';
// ============================================================
// SubTabs - Thanh điều hướng ngang phân cấp
// Nằm ngay dưới Header, dùng cho Hồ sơ sinh viên (4 tab)
// và Cài đặt (3 tab)
// ============================================================

export default function SubTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-1)',
        borderBottom: '2px solid var(--color-border-light)',
        marginBottom: 'var(--space-6)',
        paddingBottom: 0,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              padding: 'var(--space-3) var(--space-5)',
              fontSize: '14px',
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
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = 'var(--color-text-primary)';
                e.currentTarget.style.borderBottomColor = 'var(--color-border)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = 'var(--color-text-secondary)';
                e.currentTarget.style.borderBottomColor = 'transparent';
              }
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
