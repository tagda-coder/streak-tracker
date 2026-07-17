import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { MONTHS, WEEKDAYS, pad, todayStr } from '../utils/date';
import Icon from '../components/Icon';
import { HeatmapLegend } from '../components/Heatmap';
import type { Entry } from '../types';

const HEAT_COLORS = ['var(--heat-0)', 'var(--heat-1)', 'var(--heat-2)', 'var(--heat-3)', 'var(--heat-4)'];

interface Cell {
  empty: boolean;
  day?: number;
  dateStr?: string;
  level?: number;
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [dailyCounts, setDailyCounts] = useState<Record<string, number>>({});
  const [categoryCount, setCategoryCount] = useState(1);
  const today = todayStr();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const first = new Date(year, month, 1);
      const last = new Date(year, month + 1, 0);
      const start = `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}`;
      const end = `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`;
      const [entriesRes, catsRes] = await Promise.all([
        api.get<{ entries: Entry[] }>(`/entries?start=${start}&end=${end}`),
        api.get<{ categories: unknown[] }>('/categories')
      ]);
      if (cancelled) return;
      const counts: Record<string, number> = {};
      entriesRes.entries
        .filter((e) => e.status === 'completed')
        .forEach((e) => {
          counts[e.date] = (counts[e.date] ?? 0) + 1;
        });
      setDailyCounts(counts);
      setCategoryCount(Math.max(catsRes.categories.length, 1));
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  function levelFor(count: number) {
    if (count === 0) return 0;
    const ratio = count / categoryCount;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  }

  function buildGrid(): Cell[] {
    const first = new Date(year, month, 1);
    const startIdx = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Cell[] = [];
    for (let i = 0; i < startIdx; i++) cells.push({ empty: true });
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
      cells.push({ empty: false, day, dateStr, level: levelFor(dailyCounts[dateStr] ?? 0) });
    }
    while (cells.length % 7 !== 0) cells.push({ empty: true });
    return cells;
  }

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const cells = buildGrid();

  return (
    <div style={{ padding: '16px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0 18px' }}>
        <button className="icon-btn" onClick={() => navigate('/')}>
          <Icon name="back" color="var(--text-primary)" size={22} />
        </button>
        <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)' }}>Calendar</div>
        <div style={{ width: 19 }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, marginBottom: 6 }}>
        <button className="icon-btn" onClick={() => setYear((y) => y - 1)}>
          <Icon name="chevLeft" color="var(--text-secondary)" size={18} />
        </button>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{year}</div>
        <button className="icon-btn" onClick={() => setYear((y) => y + 1)}>
          <Icon name="chevRight" color="var(--text-secondary)" size={18} />
        </button>
      </div>

      <div className="card" style={{ padding: '16px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 14 }}>
          <button className="icon-btn" onClick={prevMonth}>
            <Icon name="chevLeft" color="var(--text-primary)" size={16} />
          </button>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', width: 110, textAlign: 'center' }}>
            {MONTHS[month]} {year}
          </div>
          <button className="icon-btn" onClick={nextMonth}>
            <Icon name="chevRight" color="var(--text-primary)" size={16} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 6 }}>
          {WEEKDAYS.map((wd, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>
              {wd}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
          {cells.map((cell, i) =>
            cell.empty ? (
              <div key={i} />
            ) : (
              <div
                key={i}
                onClick={() => navigate(`/day/${cell.dateStr}`)}
                style={{
                  aspectRatio: '1',
                  borderRadius: 8,
                  background: HEAT_COLORS[cell.level ?? 0],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  boxShadow: cell.dateStr === today ? '0 0 0 2px var(--accent-strong) inset' : 'none'
                }}
              >
                {cell.day}
              </div>
            )
          )}
        </div>
        <HeatmapLegend />
      </div>
    </div>
  );
}
