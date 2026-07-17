import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { WEEKDAYS, addDays, formatLong, parseDateStr, toDateStr } from '../utils/date';
import Icon from '../components/Icon';
import type { Category, Entry } from '../types';

export default function DailyView() {
  const { date = '' } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    async function load() {
      const [catsRes, entriesRes, noteRes] = await Promise.all([
        api.get<{ categories: Category[] }>('/categories'),
        api.get<{ entries: Entry[] }>(`/entries?start=${date}&end=${date}`),
        api.get<{ text: string }>(`/notes/${date}`)
      ]);
      if (cancelled) return;
      setCategories(catsRes.categories);
      setEntries(entriesRes.entries);
      setNotes(noteRes.text);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [date]);

  async function toggle(categoryId: string) {
    const existing = entries.find((e) => e.categoryId === categoryId);
    const nextStatus = existing?.status === 'completed' ? 'skipped' : 'completed';
    const res = await api.put<{ entry: Entry }>('/entries', { categoryId, date, status: nextStatus });
    setEntries((prev) => [...prev.filter((e) => e.categoryId !== categoryId), res.entry]);
  }

  async function saveNotes() {
    const res = await api.put<{ text: string }>(`/notes/${date}`, { text: noteDraft });
    setNotes(res.text);
    setEditingNotes(false);
  }

  if (loading) return <div style={{ padding: 20, color: 'var(--text-secondary)' }}>Loading…</div>;

  const d = parseDateStr(date);
  const idx = (d.getDay() + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - idx);
  const weekStrip = Array.from({ length: 7 }, (_, i) => {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    const dateStr = toDateStr(cur);
    return { label: WEEKDAYS[i], day: cur.getDate(), dateStr, selected: dateStr === date };
  });

  const doneCount = entries.filter((e) => e.status === 'completed').length;
  let statusLabel = 'Rest Day';
  let statusBg = 'rgba(148,163,184,0.15)';
  let statusFg = '#94a3b8';
  if (categories.length > 0 && doneCount === categories.length) {
    statusLabel = 'Productive Day';
    statusBg = 'rgba(34,197,94,0.15)';
    statusFg = 'var(--accent-strong)';
  } else if (doneCount > 0) {
    statusLabel = 'Getting There';
    statusBg = 'rgba(234,179,8,0.15)';
    statusFg = '#facc15';
  }

  return (
    <div style={{ padding: '16px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0 18px' }}>
        <button className="icon-btn" onClick={() => navigate('/calendar')}>
          <Icon name="back" color="var(--text-primary)" size={22} />
        </button>
        <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)' }}>Daily View</div>
        <button className="icon-btn" onClick={() => navigate('/calendar')}>
          <Icon name="calendarSmall" color="var(--text-primary)" size={19} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
        <button className="icon-btn" onClick={() => navigate(`/day/${addDays(date, -1)}`)}>
          <Icon name="chevLeft" color="var(--text-secondary)" size={16} />
        </button>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{formatLong(date)}</div>
        <button className="icon-btn" onClick={() => navigate(`/day/${addDays(date, 1)}`)}>
          <Icon name="chevRight" color="var(--text-secondary)" size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
        {weekStrip.map((wc) => (
          <button
            key={wc.dateStr}
            className="icon-btn"
            onClick={() => navigate(`/day/${wc.dateStr}`)}
            style={{ flexDirection: 'column', alignItems: 'center', gap: 6, width: 38 }}
          >
            <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)', fontWeight: 600 }}>{wc.label}</div>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                background: wc.selected ? 'var(--accent)' : 'transparent',
                color: wc.selected ? 'var(--accent-on)' : 'var(--text-primary)'
              }}
            >
              {wc.day}
            </div>
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: '16px 18px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Today's Tasks</div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent-strong)' }}>
            {doneCount} / {categories.length} completed
          </div>
        </div>
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
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>{cat.reminderTime}</div>
                </div>
              </div>
              <button className="icon-btn" onClick={() => toggle(cat.id)}>
                <Icon name="check" color={done ? 'var(--accent)' : 'var(--check-off)'} bg="var(--card)" size={24} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: '16px 18px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Notes</div>
          <button
            className="icon-btn"
            onClick={() => {
              setNoteDraft(notes);
              setEditingNotes(true);
            }}
            style={{ alignItems: 'center', gap: 5, color: 'var(--accent-strong)', fontSize: 12.5, fontWeight: 600 }}
          >
            <Icon name="edit" color="var(--accent-strong)" size={14} /> Edit
          </button>
        </div>
        {!editingNotes && (
          <div style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
            {notes || 'No notes yet.'}
          </div>
        )}
        {editingNotes && (
          <>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              style={{ width: '100%', minHeight: 80, resize: 'none' }}
            />
            <button
              className="btn-primary"
              onClick={saveNotes}
              style={{ marginTop: 10, padding: 9, fontSize: 13 }}
            >
              Save Notes
            </button>
          </>
        )}
      </div>

      <div className="card" style={{ padding: '16px 18px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Day Status</div>
        <div style={{ background: statusBg, color: statusFg, fontWeight: 700, fontSize: 14, padding: '10px 14px', borderRadius: 12 }}>
          {statusLabel}
        </div>
      </div>
    </div>
  );
}
