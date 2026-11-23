import type { Announcement } from '../types';

/**
 * FICTIONAL DEMONSTRATION CONTENT.
 * These announcements are invented to illustrate the interface and are NOT
 * official faculty communications. They will be replaced by the real
 * PostgreSQL-backed API (GET /api/announcements).
 */
export const demoAnnouncements: Announcement[] = [
  {
    id: 'demo-1',
    category: 'academic',
    status: 'published',
    publishedAt: '2026-11-18',
    isDemo: true,
    title: { fr: 'Calendrier pédagogique (exemple)', en: 'Academic calendar (sample)' },
    content: {
      fr: 'Contenu fictif de démonstration. Consultez le calendrier officiel publié par la faculté pour connaître les dates réelles.\n\nCette annonce sert uniquement à illustrer la page de détail.',
      en: 'Fictional demonstration content. Please check the official calendar published by the faculty for the real dates.\n\nThis notice only illustrates the detail page.',
    },
  },
  {
    id: 'demo-2',
    category: 'exams',
    status: 'published',
    publishedAt: '2026-11-12',
    isDemo: true,
    title: { fr: 'Organisation des examens (exemple)', en: 'Exam organisation (sample)' },
    content: {
      fr: 'Annonce fictive pour illustrer la catégorie « Examens » et les filtres de la page Actualités.',
      en: 'Fictional notice illustrating the “Exams” category and the News page filters.',
    },
  },
  {
    id: 'demo-3',
    category: 'events',
    status: 'published',
    publishedAt: '2026-11-05',
    isDemo: true,
    title: { fr: 'Journée scientifique (exemple)', en: 'Science day (sample)' },
    content: {
      fr: 'Événement fictif de démonstration : conférences, ateliers et rencontres entre étudiants et enseignants.',
      en: 'Fictional demonstration event: talks, workshops and meetings between students and teachers.',
    },
  },
  {
    id: 'demo-4',
    category: 'research',
    status: 'published',
    publishedAt: '2026-10-28',
    isDemo: true,
    title: { fr: 'Appel à communications (exemple)', en: 'Call for papers (sample)' },
    content: {
      fr: 'Annonce fictive illustrant la catégorie « Recherche ».',
      en: 'Fictional notice illustrating the “Research” category.',
    },
  },
  {
    id: 'demo-5',
    category: 'administrative',
    status: 'published',
    publishedAt: '2026-10-20',
    isDemo: true,
    title: { fr: 'Inscriptions administratives (exemple)', en: 'Administrative registration (sample)' },
    content: {
      fr: 'Annonce fictive illustrant la catégorie « Administratif ».',
      en: 'Fictional notice illustrating the “Administrative” category.',
    },
  },
  {
    id: 'demo-6',
    category: 'research',
    status: 'draft',
    publishedAt: '2026-10-10',
    isDemo: true,
    title: { fr: 'Appel à projets (brouillon)', en: 'Call for projects (draft)' },
    content: {
      fr: 'Brouillon fictif non publié, visible uniquement dans le tableau de bord.',
      en: 'Fictional unpublished draft, only visible in the dashboard.',
    },
  },
];
