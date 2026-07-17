import { api } from '../api/client';
import { todayStr } from './date';

export interface ExportPayload {
  version: number;
  exportedAt: string;
  profile: { name: string; email: string; tagline: string; theme: string };
  categories: {
    id: string;
    name: string;
    icon: string;
    color: string;
    reminderEnabled: boolean;
    reminderTime: string;
  }[];
  entries: { categoryId: string; date: string; status: 'completed' | 'skipped' }[];
  notes: { date: string; text: string }[];
}

export async function downloadBackup(): Promise<void> {
  const data = await api.get<ExportPayload>('/export');
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `streak-tracker-backup-${todayStr()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function readBackupFile(file: File): Promise<ExportPayload> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  const p = parsed as Partial<ExportPayload>;
  if (!p || !Array.isArray(p.categories) || !Array.isArray(p.entries) || !Array.isArray(p.notes)) {
    throw new Error('That file is not a valid Streak Tracker backup.');
  }
  return p as ExportPayload;
}

export async function restoreBackup(
  payload: ExportPayload
): Promise<{ ok: boolean; categoriesRestored: number; entriesRestored: number; notesRestored: number }> {
  return api.post('/export/restore', {
    categories: payload.categories,
    entries: payload.entries,
    notes: payload.notes
  });
}
