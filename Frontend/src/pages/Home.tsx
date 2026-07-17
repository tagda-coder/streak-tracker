import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { todayStr } from '../utils/date';
import Icon from '../components/Icon';
import Heatmap, { HeatmapLegend } from '../components/Heatmap';
import type { Category, Entry, HeatmapWeek } from '../types';

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapWeek[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const today = todayStr();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [catsRes, entriesRes, heatmapRes, overviewRes] = await Promise.all([
        api.get<{ categories: Category[] }>('/categories'),
        api.get<{ entries: Entry[] }>(`/entries?start=${today}&end=${today}`),
        api.get<{ heatmap: HeatmapWeek[] }>('/analytics/home-heatmap'),
        api.get<{ currentStreak: number }>('/analytics/overview')
      ]);
      if (cancelled) return;
      setCategories(catsRes.categories);
      setEntries(entriesRes.entries);
      setHeatmap(heatmapRes.heatmap);
      setCurrentStreak(overviewRes.currentStreak);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [today]);

  async function toggle(categoryId: string) {
    const existing = entries.find((e) => e.categoryId === categoryId);
    const nextStatus = existing?.status === 'completed' ? 'skipped' : 'completed';
    const res = await api.put<{ entry: Entry }>('/entries', { categoryId, date: today, status: nextStatus });
    setEntries((prev) => {
      const others = prev.filter((e) => e.categoryId !== categoryId);
      return [...others, res.entry];
    });
  }

  if (loading) {
    return <div style={{ padding: 20, color: 'var(--text-secondary)' }}>Loading…</div>;
  }

  const doneCount = entries.filter((e) => e.status === 'completed').length;

  return (
    <div style={{ padding: '16px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0 22px' }}>
        <div style={{ width: 22 }} />
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Home</div>
        <button className="icon-btn" onClick={() => navigate('/reminders')}>
          <Icon name="bell" color="var(--text-primary)" size={21} />
        </button>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(249,115,22,0.15)',
            color: 'var(--flame-strong)',
            padding: '5px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700
          }}
        >
          <Icon name="flame" color="var(--flame-strong)" size={13} />
          Current Streak
        </div>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--accent-strong)', letterSpacing: '-1px' }}>{currentStreak}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>days</div>
        </div>
        <div style={{ marginTop: 8, fontSize: 13, fontStyle: 'italic', color: 'var(--text-tertiary)' }}>
          "Discipline today, Success tomorrow."
        </div>
      </div>

      <div className="card" style={{ padding: '18px 18px 14px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Year Overview</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{new Date().getFullYear()}</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <Heatmap weeks={heatmap} compact />
        </div>
        <HeatmapLegend />
      </div>

      <div className="card" style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Today's Progress</div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent-strong)' }}>
            {doneCount} / {categories.length} completed
          </div>
        </div>
        {categories.length === 0 && (
          <div style={{ padding: '16px 0', color: 'var(--text-secondary)', fontSize: 13.5 }}>
            No categories yet — add one from the + button below.
          </div>
        )}
        {categories.map((cat) => {
          const entry = entries.find((e) => e.categoryId === cat.id);
          const done = entry?.status === 'completed';
          return (
            <div
              key={cat.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 0',
                borderBottom: '1px solid var(--divider)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: cat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon name={cat.icon} color="#fff" bg={cat.color} size={20} />
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</div>
              </div>
              <button className="icon-btn" onClick={() => toggle(cat.id)}>
                <Icon name="check" color={done ? 'var(--accent)' : 'var(--check-off)'} bg="var(--card)" size={24} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
