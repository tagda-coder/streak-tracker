import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import Icon from '../components/Icon';
import type { IconName } from '../types';

const ICON_CYCLE: IconName[] = ['calendarSmall', 'flame', 'book', 'dumbbell', 'code', 'flower', 'user'];
const COLOR_SWATCHES = ['#2563eb', '#ef4444', '#8b5cf6', '#22c55e', '#f97316', '#eab308', '#14b8a6'];

export default function AddCategory() {
  const navigate = useNavigate();
  const [icon, setIcon] = useState<IconName>('calendarSmall');
  const [color, setColor] = useState(COLOR_SWATCHES[3]);
  const [name, setName] = useState('');
  const [reminder, setReminder] = useState(true);
  const [time, setTime] = useState('09:00');
  const [saving, setSaving] = useState(false);

  function cycleIcon() {
    const idx = ICON_CYCLE.indexOf(icon);
    setIcon(ICON_CYCLE[(idx + 1) % ICON_CYCLE.length]);
  }

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.post('/categories', { name: name.trim(), icon, color, reminderEnabled: reminder, reminderTime: time });
      navigate('/categories');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: '16px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0 22px' }}>
        <button className="icon-btn" onClick={() => navigate('/categories')}>
          <Icon name="back" color="var(--text-primary)" size={22} />
        </button>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Add New Category</div>
        <div style={{ width: 22 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 22 }}>
        <button
          className="icon-btn"
          onClick={cycleIcon}
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: color,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon name={icon} color="#fff" bg={color} size={30} />
        </button>
        <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600 }}>Choose Icon</div>
      </div>

      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>Category Name</div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Morning Run"
        style={{ width: '100%', marginBottom: 20 }}
      />

      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 10 }}>Choose Color</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
        {COLOR_SWATCHES.map((hex) => (
          <button
            key={hex}
            className="icon-btn"
            onClick={() => setColor(hex)}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: hex,
              boxShadow: color === hex ? '0 0 0 2px var(--swatch-ring-bg), 0 0 0 4px var(--text-primary)' : 'none'
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Reminder (Optional)</div>
        <button
          className="icon-btn"
          onClick={() => setReminder((r) => !r)}
          style={{
            width: 44,
            height: 26,
            borderRadius: 13,
            background: reminder ? 'var(--accent)' : 'var(--check-off)',
            position: 'relative'
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: 3,
              left: reminder ? 21 : 3,
              transition: 'left 0.15s'
            }}
          />
        </button>
      </div>

      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        style={{ width: '100%', marginBottom: 26, opacity: reminder ? 1 : 0.45 }}
      />

      <button className="btn-primary" onClick={save} disabled={saving || !name.trim()}>
        {saving ? 'Saving…' : 'Save Category'}
      </button>
    </div>
  );
}
