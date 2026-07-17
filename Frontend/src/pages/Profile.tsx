import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import { downloadBackup } from '../utils/backup';

interface Stats {
  totalDaysTracked: number;
  totalCompleted: number;
  completionRate: number;
  longestStreak: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [tagline, setTagline] = useState(user?.tagline ?? '');
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    api.get<Stats>('/profile/stats').then(setStats);
  }, []);

  useEffect(() => {
    setName(user?.name ?? '');
    setTagline(user?.tagline ?? '');
  }, [user]);

  async function saveProfile() {
    const res = await api.put<{ user: typeof user }>('/profile', { name, tagline });
    if (res.user) updateUser(res.user);
    setEditing(false);
  }

  async function toggleTheme() {
    if (!user) return;
    const nextTheme = user.theme === 'Dark' ? 'Light' : 'Dark';
    const res = await api.put<{ user: typeof user }>('/profile', { theme: nextTheme });
    if (res.user) updateUser(res.user);
  }

  async function handleExportData() {
    setExportError('');
    try {
      await downloadBackup();
    } catch (err) {
      setExportError(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  }

  if (!user) return null;

  return (
    <div style={{ padding: '16px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0 18px' }}>
        <button className="icon-btn" onClick={() => navigate('/')}>
          <Icon name="back" color="var(--text-primary)" size={22} />
        </button>
        <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)' }}>Profile</div>
        <Icon name="gear" color="var(--text-primary)" size={20} />
      </div>

      <div className="card" style={{ padding: 18, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--avatar-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 800,
            color: '#fff',
            flexShrink: 0
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        {!editing && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 3 }}>{user.tagline}</div>
            <button
              className="icon-btn"
              onClick={() => setEditing(true)}
              style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: 'var(--accent-strong)' }}
            >
              Edit Profile
            </button>
          </div>
        )}
        {editing && (
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '7px 9px', fontSize: 13.5 }} />
            <input value={tagline} onChange={(e) => setTagline(e.target.value)} style={{ padding: '7px 9px', fontSize: 12 }} />
            <button className="icon-btn" onClick={saveProfile} style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-strong)' }}>
              Save
            </button>
          </div>
        )}
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>Statistics</div>
      <div className="card" style={{ padding: '4px 16px', marginBottom: 20 }}>
        <StatRow icon="calendarSmall" label="Total Days Tracked" value={stats?.totalDaysTracked ?? '—'} />
        <StatRow icon="check" label="Total Completed" value={stats?.totalCompleted ?? '—'} />
        <StatRow icon="chart" label="Completion Rate" value={stats ? `${stats.completionRate}%` : '—'} />
        <StatRow icon="flame" label="Longest Streak" value={stats ? `${stats.longestStreak} days` : '—'} last />
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>Settings</div>
      {exportError && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{exportError}</div>}
      <div className="card" style={{ padding: '4px 16px' }}>
        <SettingRow icon="bell" label="Reminders" onClick={() => navigate('/reminders')} />
        <SettingRow icon="gear" label="Theme" value={user.theme} onClick={toggleTheme} />
        <SettingRow icon="chart" label="Export Data" onClick={handleExportData} />
        <SettingRow icon="clock" label="Backup & Restore" onClick={() => navigate('/backup-restore')} />
        <SettingRow icon="x" label="Log Out" onClick={logout} last />
      </div>
    </div>
  );
}

function StatRow({ icon, label, value, last }: { icon: Parameters<typeof Icon>[0]['name']; label: string; value: string | number; last?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '13px 0',
        borderBottom: last ? 'none' : '1px solid var(--divider)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name={icon} color="var(--text-secondary)" size={17} />
        <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{label}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

function SettingRow({
  icon,
  label,
  value,
  onClick,
  last
}: {
  icon: Parameters<typeof Icon>[0]['name'];
  label: string;
  value?: string;
  onClick?: () => void;
  last?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '13px 0',
        borderBottom: last ? 'none' : '1px solid var(--divider)',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name={icon} color="var(--text-secondary)" size={17} />
        <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {value && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{value}</span>}
        <Icon name="chevRight" color="var(--text-tertiary)" size={15} />
      </div>
    </div>
  );
}
