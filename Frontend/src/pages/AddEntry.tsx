import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { formatLong, todayStr } from '../utils/date';
import Icon from '../components/Icon';
import type { Category, EntryStatus } from '../types';

export default function AddEntry() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<EntryStatus>('completed');
  const [notes, setNotes] = useState('');
  const [date] = useState(todayStr());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<{ categories: Category[] }>('/categories').then((res) => {
      setCategories(res.categories);
      if (res.categories.length > 0) setCategoryId(res.categories[0].id);
    });
  }, []);

  async function save() {
    if (!categoryId) return;
    setSaving(true);
    try {
      await api.put('/entries', { categoryId, date, status });
      if (notes.trim()) await api.put(`/notes/${date}`, { text: notes.trim() });
      navigate('/');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: '16px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0 18px' }}>
        <button className="icon-btn" onClick={() => navigate('/')}>
          <Icon name="back" color="var(--text-primary)" size={22} />
        </button>
        <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)' }}>Add Entry</div>
        <div style={{ width: 22 }} />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '13px 14px',
          marginBottom: 22
        }}
        className="card"
      >
        <Icon name="calendarSmall" color="var(--text-secondary)" size={17} />
        <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{formatLong(date)}</div>
      </div>

      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 10 }}>Select Category</div>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className="icon-btn"
          onClick={() => setCategoryId(cat.id)}
          style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '11px 4px' }}
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
            <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</div>
          </div>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: `2px solid ${categoryId === cat.id ? 'var(--accent)' : 'var(--text-tertiary)'}`,
              background: categoryId === cat.id ? 'var(--accent)' : 'transparent'
            }}
          />
        </button>
      ))}
      <button
        className="icon-btn"
        onClick={() => navigate('/categories/new')}
        style={{ alignItems: 'center', gap: 12, padding: '11px 4px' }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            border: '1.5px dashed var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon name="plus" color="var(--text-secondary)" bg="var(--bg)" size={18} />
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Add New Category</div>
      </button>

      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600, margin: '20px 0 10px' }}>Status</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          className="icon-btn"
          onClick={() => setStatus('completed')}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: 12,
            borderRadius: 12,
            fontSize: 13.5,
            fontWeight: 700,
            justifyContent: 'center',
            background: status === 'completed' ? 'var(--accent)' : 'var(--card)',
            color: status === 'completed' ? 'var(--accent-on)' : 'var(--text-secondary)'
          }}
        >
          Completed
        </button>
        <button
          className="icon-btn"
          onClick={() => setStatus('skipped')}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: 12,
            borderRadius: 12,
            fontSize: 13.5,
            fontWeight: 700,
            justifyContent: 'center',
            background: status === 'skipped' ? 'var(--danger)' : 'var(--card)',
            color: status === 'skipped' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          Skipped
        </button>
      </div>

      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 10 }}>Notes (Optional)</div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="What did you do?"
        style={{ width: '100%', minHeight: 80, marginBottom: 22, resize: 'none' }}
      />

      <button className="btn-primary" onClick={save} disabled={saving || !categoryId}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}
