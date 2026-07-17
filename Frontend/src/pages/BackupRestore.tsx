import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { ApiError } from '../api/client';
import { downloadBackup, readBackupFile, restoreBackup } from '../utils/backup';

export default function BackupRestore() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleDownload() {
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      await downloadBackup();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  function handlePickFile() {
    setError('');
    setSuccess('');
    fileInputRef.current?.click();
  }

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError('');
    setSuccess('');
    setBusy(true);
    try {
      const payload = await readBackupFile(file);
      const confirmed = confirm(
        `This will permanently replace all your current categories, entries and notes with the ${payload.categories.length} categor${
          payload.categories.length === 1 ? 'y' : 'ies'
        } and ${payload.entries.length} entries in this backup (from ${payload.exportedAt}). This cannot be undone. Continue?`
      );
      if (!confirmed) return;
      const result = await restoreBackup(payload);
      setSuccess(`Restored ${result.categoriesRestored} categories, ${result.entriesRestored} entries and ${result.notesRestored} notes.`);
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: '16px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0 18px' }}>
        <button className="icon-btn" onClick={() => navigate('/profile')}>
          <Icon name="back" color="var(--text-primary)" size={22} />
        </button>
        <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)' }}>Backup & Restore</div>
        <div style={{ width: 22 }} />
      </div>

      {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</div>}
      {success && <div style={{ color: 'var(--accent-strong)', fontSize: 13, marginBottom: 16 }}>{success}</div>}

      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Icon name="download" color="var(--text-primary)" size={18} />
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Download Backup</div>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 14 }}>
          Save a JSON file of all your categories, entries and notes.
        </div>
        <button className="btn-primary" onClick={handleDownload} disabled={busy}>
          {busy ? 'Working…' : 'Download Backup'}
        </button>
      </div>

      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Icon name="upload" color="var(--text-primary)" size={18} />
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Restore from File</div>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 14 }}>
          Choose a previously-exported backup file. This will permanently replace all of your current data.
        </div>
        <input ref={fileInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={handleFileChosen} />
        <button className="btn-primary" onClick={handlePickFile} disabled={busy}>
          {busy ? 'Working…' : 'Restore from File'}
        </button>
      </div>
    </div>
  );
}
