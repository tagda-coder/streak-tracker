import type { HeatmapWeek } from '../types';

const LEVEL_VARS = ['var(--heat-0)', 'var(--heat-1)', 'var(--heat-2)', 'var(--heat-3)', 'var(--heat-4)'];

interface HeatmapProps {
  weeks: HeatmapWeek[];
  compact?: boolean;
}

export default function Heatmap({ weeks, compact = false }: HeatmapProps) {
  const cellPx = compact ? 7 : 10;
  const gap = compact ? 2 : 3;

  return (
    <div style={{ display: 'flex', gap, paddingTop: 14 }}>
      {weeks.map((week) => (
        <div key={week.key} style={{ display: 'flex', flexDirection: 'column', gap, position: 'relative' }}>
          {week.monthLabel && (
            <div style={{ position: 'absolute', top: -16, left: 0, fontSize: 10, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              {week.monthLabel}
            </div>
          )}
          {week.days.map((day) => (
            <div
              key={day.key}
              title={day.date}
              style={{ width: cellPx, height: cellPx, borderRadius: 2, background: LEVEL_VARS[day.level] ?? LEVEL_VARS[0] }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function HeatmapLegend() {
  const colors = ['var(--heat-0)', 'var(--heat-1)', 'var(--heat-2)', 'var(--heat-3)', 'var(--heat-4)'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, marginTop: 10, fontSize: 10.5, color: 'var(--text-secondary)' }}>
      Less
      {colors.map((c) => (
        <div key={c} style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
      ))}
      More
    </div>
  );
}
