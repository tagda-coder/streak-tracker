import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: 24
      }}
    >
      <form onSubmit={onSubmit} style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, textAlign: 'center' }}>Streak Tracker</div>
        <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 28, textAlign: 'center' }}>
          Discipline today, success tomorrow.
        </div>

        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>Email</div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          style={{ width: '100%', marginBottom: 16 }}
        />

        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>Password</div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          style={{ width: '100%', marginBottom: 20 }}
        />

        {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? 'Logging in…' : 'Log In'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13.5, color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent-strong)', fontWeight: 700 }}>
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
