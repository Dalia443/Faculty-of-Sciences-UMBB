import type {
  Announcement,
  AnnouncementInput,
  ContactMessage,
  Department,
  LoginRequest,
  LoginResponse,
} from '../types';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface AnnouncementQuery {
  /** Admin dashboard: also return drafts (backend must enforce authorization). */
  includeDrafts?: boolean;
}

/** Contract implemented by both the demo client and the HTTP client. */
export interface ApiClient {
  /** GET /api/departments */
  getDepartments(): Promise<Department[]>;
  /** GET /api/announcements */
  getAnnouncements(query?: AnnouncementQuery): Promise<Announcement[]>;
  /** GET /api/announcements/:id */
  getAnnouncement(id: string): Promise<Announcement>;
  /** POST /api/announcements */
  createAnnouncement(input: AnnouncementInput): Promise<Announcement>;
  /** PUT /api/announcements/:id */
  updateAnnouncement(id: string, input: AnnouncementInput): Promise<Announcement>;
  /** DELETE /api/announcements/:id */
  deleteAnnouncement(id: string): Promise<void>;
  /** POST /api/auth/login */
  login(credentials: LoginRequest): Promise<LoginResponse>;
  /** POST /api/contact (proposed endpoint, not in the initial brief) */
  sendContactMessage(message: ContactMessage): Promise<void>;
}
