import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, getAuthToken, setAuthToken } from '../api/client';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (u: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<{ user: User }>('/auth/me')
      .then((res) => setUser(res.user))
      .catch(() => setAuthToken(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    setAuthToken(res.token);
    setUser(res.user);
  }

  async function signup(name: string, email: string, password: string) {
    const res = await api.post<{ token: string; user: User }>('/auth/register', { name, email, password });
    setAuthToken(res.token);
    setUser(res.user);
  }

  function logout() {
    setAuthToken(null);
    setUser(null);
  }

  useEffect(() => {
    document.documentElement.dataset.theme = user?.theme === 'Light' ? 'light' : 'dark';
  }, [user?.theme]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser: setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
