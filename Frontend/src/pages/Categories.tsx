import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import Icon from '../components/Icon';
import type { Category } from '../types';

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ categories: Category[] }>('/categories')
      .then((res) => setCategories(res.categories))
      .finally(() => setLoading(false));
  }, []);

  async function remove(id: string) {
    if (!confirm('Delete this category and all of its tracked history?')) return;
    await api.delete('/categories/' + id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  if (loading) return <div style={{ padding: 20, color: 'var(--text-secondary)' }}>Loading…</div>;

  return (
    <div style={{ padding: '16px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0 18px' }}>
        <button className="icon-btn" onClick={() => navigate('/analytics')}>
          <Icon name="back" color="var(--text-primary)" size={22} />
        </button>
        <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)' }}>Categories</div>
        <button className="icon-btn" onClick={() => navigate('/categories/new')}>
          <Icon name="plus" color="var(--text-primary)" size={21} />
        </button>
      </div>

      {categories.length === 0 && (
        <div style={{ padding: '16px 4px', color: 'var(--text-secondary)', fontSize: 13.5 }}>
          No categories yet. Tap + to add your first habit.
        </div>
      )}

      {categories.map((cat) => (
        <div
          key={cat.id}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px', borderBottom: '1px solid var(--divider)' }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: cat.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Icon name={cat.icon} color="#fff" bg={cat.color} size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)' }}>{cat.name}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{cat.streak} days</div>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'var(--track-bg)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 3, background: cat.color, width: `${cat.pct}%` }} />
            </div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-strong)', width: 34, textAlign: 'right' }}>{cat.pct}%</div>
          <button className="icon-btn" onClick={() => remove(cat.id)} style={{ marginLeft: 4 }}>
            <Icon name="x" color="var(--text-tertiary)" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
