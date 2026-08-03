'use client';
// ============================================================
// MatchScoreCircle - Vòng tròn SVG tiến trình
// Hiển thị % khớp JD (ví dụ 88% Khớp JD)
// ============================================================

export default function MatchScoreCircle({ score = 0, size = 140, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return 'var(--color-success)';
    if (s >= 60) return 'var(--color-primary)';
    if (s >= 40) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: size * 0.22,
            fontWeight: 700,
            color: getColor(score),
            lineHeight: 1,
          }}
        >
          {score}%
        </span>
        <span
          style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
            marginTop: 4,
          }}
        >
          Khớp JD
        </span>
      </div>
    </div>
  );
}
