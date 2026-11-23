import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { api } from '../services/api';
import { session, type StoredSession } from '../services/session';
import type { AuthUser, LoginRequest } from '../types';

interface AuthValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True when the current session comes from demonstration mode. */
  isDemoSession: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<StoredSession | null>(() => session.get());

  const login = useCallback(async (credentials: LoginRequest) => {
    const res = await api.login(credentials);
    const stored: StoredSession = { token: res.token, user: res.user, isDemo: Boolean(res.isDemo) };
    session.set(stored);
    setCurrent(stored);
  }, []);

  const logout = useCallback(() => {
    session.clear();
    setCurrent(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user: current?.user ?? null,
      isAuthenticated: current !== null,
      isDemoSession: current?.isDemo ?? false,
      login,
      logout,
    }),
    [current, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
