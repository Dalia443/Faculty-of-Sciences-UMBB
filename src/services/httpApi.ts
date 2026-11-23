import type {
  Announcement,
  AnnouncementInput,
  ContactMessage,
  Department,
  LoginRequest,
  LoginResponse,
} from '../types';
import { config } from './config';
import { session } from './session';
import { ApiError, type AnnouncementQuery, type ApiClient } from './types';

/**
 * Real REST client. Used when VITE_USE_DEMO=false.
 * Expected backend: REST API + PostgreSQL. Authentication/authorization
 * MUST be enforced server-side (the frontend only forwards the token).
 */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = session.get()?.token;
  const response = await fetch(`${config.apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message || 'Request failed', response.status);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const httpApi: ApiClient = {
  getDepartments: () => request<Department[]>('/api/departments'),

  getAnnouncements: (query: AnnouncementQuery = {}) =>
    request<Announcement[]>(`/api/announcements${query.includeDrafts ? '?status=all' : ''}`),

  getAnnouncement: (id) => request<Announcement>(`/api/announcements/${encodeURIComponent(id)}`),

  createAnnouncement: (input: AnnouncementInput) =>
    request<Announcement>('/api/announcements', { method: 'POST', body: JSON.stringify(input) }),

  updateAnnouncement: (id, input: AnnouncementInput) =>
    request<Announcement>(`/api/announcements/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  deleteAnnouncement: (id) =>
    request<void>(`/api/announcements/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  login: (credentials: LoginRequest) =>
    request<LoginResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

  sendContactMessage: (message: ContactMessage) =>
    request<void>('/api/contact', { method: 'POST', body: JSON.stringify(message) }),
};
