import type { AuthUser } from '../types';

const KEY = 'umbb.session';

export interface StoredSession {
  token: string;
  user: AuthUser;
  isDemo: boolean;
}

export const session = {
  get(): StoredSession | null {
    try {
      const raw = window.sessionStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as StoredSession) : null;
    } catch {
      return null;
    }
  },
  set(value: StoredSession): void {
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify(value));
    } catch {
      /* storage unavailable: session lives in memory only */
    }
  },
  clear(): void {
    try {
      window.sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};
