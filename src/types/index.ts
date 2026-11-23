export type Lang = 'fr' | 'en';
export type Localized = Record<Lang, string>;

export type AnnouncementCategory =
  | 'academic'
  | 'exams'
  | 'events'
  | 'research'
  | 'administrative';

export type AnnouncementStatus = 'published' | 'draft';

export const ANNOUNCEMENT_CATEGORIES: AnnouncementCategory[] = [
  'academic',
  'exams',
  'events',
  'research',
  'administrative',
];

export interface Department {
  id: string;
  /** URL-friendly identifier, also used to resolve the local illustration. */
  slug: string;
  name: Localized;
  description: Localized;
  overview: Localized;
}

export interface Announcement {
  id: string;
  title: Localized;
  content: Localized;
  category: AnnouncementCategory;
  status: AnnouncementStatus;
  /** ISO date (YYYY-MM-DD). */
  publishedAt: string;
  /** True for fictional demonstration content. A real API would omit it. */
  isDemo?: boolean;
}

export type AnnouncementInput = Omit<Announcement, 'id' | 'isDemo'>;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  email: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  /** True when produced by the demonstration mode (NOT real authentication). */
  isDemo?: boolean;
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}
