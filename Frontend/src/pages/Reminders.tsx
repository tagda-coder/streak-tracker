import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import Icon from '../components/Icon';
import type { Category } from '../types';

export default function Reminders() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<{ categories: Category[] }>('/categories')
      .then((res) => setCategories(res.categories.filter((c) => c.reminderEnabled)))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Something went wrong'))
      .finally(() => setLoading(false));
  }, []);

  async function enableNotifications() {
    setError('');
    if (typeof Notification === 'undefined') {
      setError('Notifications are not supported in this browser.');
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
  }

  const statusLabel = permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked' : 'Not enabled';
  const statusColor =
    permission === 'granted' ? 'var(--accent-strong)' : permission === 'denied' ? 'var(--danger)' : 'var(--text-secondary)';

  return (
    <div style={{ padding: '16px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0 18px' }}>
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <Icon name="back" color="var(--text-primary)" size={22} />
        </button>
        <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)' }}>Reminders</div>
        <div style={{ width: 22 }} />
      </div>

      {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ padding: 18, marginBottom: 18 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: permission === 'granted' ? 0 : 12
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Browser Notifications</div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: statusColor }}>{statusLabel}</div>
        </div>
        {permission !== 'granted' && (
          <button className="btn-primary" onClick={enableNotifications}>
            Enable Notifications
          </button>
        )}
        {permission === 'denied' && (
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 10 }}>
            Notifications are blocked for this site. Enable them in your browser's site settings to receive reminders.
          </div>
        )}
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 10 }}>
          Reminders only fire while this app is open in a browser tab.
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>Categories with Reminders</div>
      {loading && <div style={{ padding: '16px 4px', color: 'var(--text-secondary)', fontSize: 13.5 }}>Loading…</div>}
      {!loading && categories.length === 0 && (
        <div style={{ padding: '16px 4px', color: 'var(--text-secondary)', fontSize: 13.5 }}>
          No categories have reminders enabled. Set a reminder time when creating a category.
        </div>
      )}
      {!loading && categories.length > 0 && (
        <div className="card" style={{ padding: '4px 16px' }}>
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '13px 0',
                borderBottom: i === categories.length - 1 ? 'none' : '1px solid var(--divider)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name={cat.icon} color="#fff" bg={cat.color} size={17} />
                <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{cat.name}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>{cat.reminderTime}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
