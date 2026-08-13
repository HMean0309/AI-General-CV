'use client';
/**
 * ScoreBreakdownCard — Phân tích 4 Trụ cột Đánh giá CV (Multi-Dimensional Scoring)
 *
 * Hiển thị:
 * 1. 4 thanh tiến trình (Progress bar) với trọng số
 * 2. Biểu đồ Radar Chart (recharts) cho trực quan nhanh
 */

import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts';

const PILLARS = [
  { key: 'technicalSkillScore', label: 'Kỹ năng kỹ thuật', weight: '35%', color: '#6366f1' },
  { key: 'projectRelevanceScore', label: 'Đồ án liên quan', weight: '30%', color: '#f59e0b' },
  { key: 'academicPloScore', label: 'Học tập & PLO', weight: '20%', color: '#10b981' },
  { key: 'softSkillCertScore', label: 'Chứng chỉ & Mềm', weight: '15%', color: '#ec4899' },
];

function getBarColor(score) {
  if (score >= 80) return 'var(--color-success)';
  if (score >= 60) return 'var(--color-primary)';
  if (score >= 40) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

export default function ScoreBreakdownCard({ scoreBreakdown }) {
  if (!scoreBreakdown) return null;

  const radarData = PILLARS.map((p) => ({
    subject: p.label,
    score: scoreBreakdown[p.key] || 0,
    fullMark: 100,
  }));

  return (
    <div className="card" style={{ padding: 'var(--space-4)' }}>
      <h4 style={{
        fontSize: '13px',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-3)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        📊 Phân tích đánh giá đa chiều
      </h4>

      {/* Radar Chart */}
      <div style={{ width: '100%', height: 200, marginBottom: 'var(--space-3)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke="var(--color-border)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: 'var(--color-text-muted)' }}
              tickCount={5}
            />
            <Radar
              name="Điểm"
              dataKey="score"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-card-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--color-text-primary)',
              }}
              formatter={(value) => [`${value}/100`, 'Điểm']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Progress Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {PILLARS.map((pillar) => {
          const score = scoreBreakdown[pillar.key] || 0;
          return (
            <div key={pillar.key}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}>
                  {pillar.label}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: '10px',
                    color: 'var(--color-text-muted)',
                    background: 'var(--color-bg-muted)',
                    padding: '1px 6px',
                    borderRadius: 4,
                    fontWeight: 500,
                  }}>
                    ×{pillar.weight}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: getBarColor(score),
                    minWidth: 32,
                    textAlign: 'right',
                  }}>
                    {score}%
                  </span>
                </div>
              </div>
              <div style={{
                width: '100%',
                height: 6,
                background: 'var(--color-border)',
                borderRadius: 3,
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${score}%`,
                  height: '100%',
                  background: pillar.color,
                  borderRadius: 3,
                  transition: 'width 0.8s ease-out',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
