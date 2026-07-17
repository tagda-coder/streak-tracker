import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon';

const TABS: { key: string; path: string; icon: 'home' | 'calendar' | 'chart' | 'user'; label: string }[] = [
  { key: 'home', path: '/', icon: 'home', label: 'Home' },
  { key: 'calendar', path: '/calendar', icon: 'calendar', label: 'Calendar' },
  { key: 'analytics', path: '/analytics', icon: 'chart', label: 'Analytics' },
  { key: 'profile', path: '/profile', icon: 'user', label: 'Profile' }
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey = (() => {
    if (location.pathname === '/') return 'home';
    if (location.pathname.startsWith('/calendar') || location.pathname.startsWith('/day')) return 'calendar';
    if (location.pathname.startsWith('/analytics') || location.pathname.startsWith('/categories')) return 'analytics';
    if (location.pathname.startsWith('/profile')) return 'profile';
    return '';
  })();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 20px calc(env(safe-area-inset-bottom, 0px) + 10px)',
        background: 'var(--nav-bg)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky',
        bottom: 0
      }}
    >
      {TABS.slice(0, 2).map((tab) => {
        const on = activeKey === tab.key;
        const color = on ? 'var(--accent)' : 'var(--nav-off)';
        return (
          <button
            key={tab.key}
            className="icon-btn"
            onClick={() => navigate(tab.path)}
            style={{ flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 8px' }}
          >
            <Icon name={tab.icon} color={color} size={22} />
            <div style={{ fontSize: 10.5, fontWeight: 600, color }}>{tab.label}</div>
          </button>
        );
      })}

      <button className="icon-btn" onClick={() => navigate('/add-entry')} style={{ marginTop: -14 }}>
        <Icon name="plus" color="var(--accent)" bg="var(--nav-bg)" size={46} />
      </button>

      {TABS.slice(2).map((tab) => {
        const on = activeKey === tab.key;
        const color = on ? 'var(--accent)' : 'var(--nav-off)';
        return (
          <button
            key={tab.key}
            className="icon-btn"
            onClick={() => navigate(tab.path)}
            style={{ flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 8px' }}
          >
            <Icon name={tab.icon} color={color} size={22} />
            <div style={{ fontSize: 10.5, fontWeight: 600, color }}>{tab.label}</div>
          </button>
        );
      })}
    </div>
  );
}
