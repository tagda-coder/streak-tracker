import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import Icon from '../components/Icon';
import Heatmap, { HeatmapLegend } from '../components/Heatmap';
import type { Category, HeatmapWeek } from '../types';

type Tab = 'overview' | 'categories' | 'streaks';

interface Overview {
  completionPct: number;
  totalCompletedDays: number;
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  heatmap: HeatmapWeek[];
}

export default function Analytics() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [streaks, setStreaks] = useState<{ id: string; name: string; icon: Category['icon']; color: string; streak: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [overviewRes, categoriesRes, streaksRes] = await Promise.all([
        api.get<Overview>('/analytics/overview'),
        api.get<{ categories: Category[] }>('/analytics/categories'),
        api.get<{ categories: typeof streaks }>('/analytics/streaks')
      ]);
      if (cancelled) return;
      setOverview(overviewRes);
      setCategories(categoriesRes.categories);
      setStreaks(streaksRes.categories);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !overview) return <div style={{ padding: 20, color: 'var(--text-secondary)' }}>Loading…</div>;

  const dashOffset = 163.4 - (163.4 * overview.completionPct) / 100;

  return (
    <div style={{ padding: '16px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0 16px' }}>
        <button className="icon-btn" onClick={() => navigate('/')}>
          <Icon name="back" color="var(--text-primary)" size={22} />
        </button>
        <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)' }}>Analytics</div>
        <button className="icon-btn" onClick={() => navigate('/calendar')}>
          <Icon name="calendarSmall" color="var(--text-primary)" size={19} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, background: 'var(--card)', borderRadius: 14, padding: 4, marginBottom: 18 }}>
        {(['overview', 'categories', 'streaks'] as Tab[]).map((t) => (
          <button
            key={t}
            className="icon-btn"
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: 9,
              borderRadius: 11,
              fontSize: 13,
              fontWeight: 700,
              justifyContent: 'center',
              background: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? 'var(--accent-on)' : 'var(--text-secondary)',
              textTransform: 'capitalize'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="card" style={{ padding: 18, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>Overall Completion</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{overview.completionPct}%</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Past 365 days</div>
            </div>
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" stroke="var(--track-bg)" strokeWidth="7" fill="none" />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="var(--accent)"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="163.4"
                strokeDashoffset={dashOffset}
                transform="rotate(-90 32 32)"
              />
            </svg>
          </div>

          <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
            <div className="card" style={{ flex: 1, padding: 16 }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>Total Completed Days</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{overview.totalCompletedDays}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}> /{overview.totalDays}</span>
                </div>
                <Icon name="calendarSmall" color="var(--accent-strong)" size={20} />
              </div>
            </div>
            <div className="card" style={{ flex: 1, padding: 16 }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>Current Streak</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{overview.currentStreak}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}> days</span>
                </div>
                <Icon name="flame" color="var(--flame-strong)" size={20} />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>Activity Heatmap</div>
            <div style={{ overflowX: 'auto' }}>
              <Heatmap weeks={overview.heatmap} />
            </div>
            <HeatmapLegend />
          </div>
        </>
      )}

      {tab === 'categories' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button
              className="icon-btn"
              onClick={() => navigate('/categories')}
              style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent-strong)' }}
            >
              Manage all →
            </button>
          </div>
          {categories.map((cat) => (
            <div key={cat.id} className="card" style={{ padding: '14px 16px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: cat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon name={cat.icon} color="#fff" bg={cat.color} size={18} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{cat.name}</div>
                <div style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: 'var(--accent-strong)' }}>{cat.pct}%</div>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--track-bg)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: cat.color, width: `${cat.pct}%` }} />
              </div>
            </div>
          ))}
        </>
      )}

      {tab === 'streaks' && (
        <>
          {streaks.map((cat) => (
            <div
              key={cat.id}
              className="card"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', marginBottom: 10 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: cat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon name={cat.icon} color="#fff" bg={cat.color} size={18} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{cat.name}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{cat.streak}</span>
                <Icon name="flame" color="var(--flame-strong)" size={16} />
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
