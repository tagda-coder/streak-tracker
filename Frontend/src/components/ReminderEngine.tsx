import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { todayStr } from '../utils/date';
import type { Category } from '../types';

const POLL_INTERVAL_MS = 20_000;

function currentHHmm(): string {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function firedKey(): string {
  return `streak_reminders_fired_${todayStr()}`;
}

function getFiredIds(): string[] {
  try {
    const raw = localStorage.getItem(firedKey());
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function markFired(categoryId: string) {
  const ids = getFiredIds();
  if (!ids.includes(categoryId)) {
    localStorage.setItem(firedKey(), JSON.stringify([...ids, categoryId]));
  }
}

export default function ReminderEngine() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    async function tick() {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

      let categories: Category[];
      try {
        const res = await api.get<{ categories: Category[] }>('/categories');
        categories = res.categories;
      } catch {
        return;
      }

      const nowHHmm = currentHHmm();
      const firedIds = getFiredIds();
      for (const cat of categories) {
        if (!cat.reminderEnabled) continue;
        if (cat.reminderTime !== nowHHmm) continue;
        if (firedIds.includes(cat.id)) continue;
        new Notification('Streak Tracker', {
          body: `Time for "${cat.name}"`,
          tag: `streak-reminder-${cat.id}-${todayStr()}`
        });
        markFired(cat.id);
      }
    }

    tick();
    const intervalId = window.setInterval(tick, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [user]);

  return null;
}
