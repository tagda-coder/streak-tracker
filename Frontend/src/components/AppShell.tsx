import type { ReactNode } from 'react';
import BottomNav from './BottomNav';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        justifyContent: 'center',
        background: 'var(--bg)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg)'
        }}
      >
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>{children}</div>
        <BottomNav />
      </div>
    </div>
  );
}
