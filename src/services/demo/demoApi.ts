import { demoAnnouncements } from '../../data/announcements';
import { demoCredentials } from '../../data/site';
import { demoDepartments } from '../../data/departments';
import type { Announcement, AnnouncementInput } from '../../types';
import { ApiError, type AnnouncementQuery, type ApiClient } from '../types';

/**
 * DEMONSTRATION client: serves fictional in-browser data.
 * Persistence uses localStorage purely so demo edits survive a page refresh.
 * Replaced by httpApi (PostgreSQL-backed) when VITE_USE_DEMO=false.
 */
const STORAGE_KEY = 'umbb.demo.announcements';
const delay = (ms = 350) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function load(): Announcement[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Announcement[];
  } catch {
    /* fall through to seed data */
  }
  return demoAnnouncements.map((a) => ({ ...a }));
}

let store: Announcement[] = load();

function persist(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* storage unavailable: memory only */
  }
}

export const demoApi: ApiClient = {
  async getDepartments() {
    await delay(200);
    return demoDepartments;
  },

  async getAnnouncements({ includeDrafts = false }: AnnouncementQuery = {}) {
    await delay();
    const list = includeDrafts ? store : store.filter((a) => a.status === 'published');
    return [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  },

  async getAnnouncement(id) {
    await delay(200);
    const found = store.find((a) => a.id === id);
    if (!found) throw new ApiError('Announcement not found', 404);
    return found;
  },

  async createAnnouncement(input: AnnouncementInput) {
    await delay();
    const created: Announcement = { ...input, id: `demo-${Date.now()}`, isDemo: true };
    store = [created, ...store];
    persist();
    return created;
  },

  async updateAnnouncement(id, input: AnnouncementInput) {
    await delay();
    const current = store.find((a) => a.id === id);
    if (!current) throw new ApiError('Announcement not found', 404);
    const updated: Announcement = { ...current, ...input };
    store = store.map((a) => (a.id === id ? updated : a));
    persist();
    return updated;
  },

  async deleteAnnouncement(id) {
    await delay();
    store = store.filter((a) => a.id !== id);
    persist();
  },

  async login({ email, password }) {
    await delay(450);
    // DEMO ONLY - not real authentication. Real auth must live in the backend.
    if (email.trim().toLowerCase() !== demoCredentials.email || password !== demoCredentials.password) {
      throw new ApiError('Invalid credentials', 401);
    }
    return { token: 'demo-token-not-secure', user: { email, name: 'Demo Admin' }, isDemo: true };
  },

  async sendContactMessage() {
    await delay(600); // Nothing is sent in demonstration mode.
  },
};
