import type { Department } from '../types';

/**
 * Official department list of the Faculty of Sciences (UMBB).
 * Descriptions are short, generic presentation texts. For official
 * programmes and details, always refer to https://fs.univ-boumerdes.dz/
 */
export const demoDepartments: Department[] = [
  {
    id: 'dept-math',
    slug: 'mathematics',
    name: { fr: 'Mathématiques', en: 'Mathematics' },
    description: {
      fr: 'Algèbre, analyse, probabilités et statistiques.',
      en: 'Algebra, analysis, probability and statistics.',
    },
    overview: {
      fr: 'Le département de Mathématiques se consacre à l’enseignement et à la recherche en mathématiques fondamentales et appliquées.',
      en: 'The Mathematics department is dedicated to teaching and research in pure and applied mathematics.',
    },
  },
  {
    id: 'dept-phys',
    slug: 'physics',
    name: { fr: 'Physique', en: 'Physics' },
    description: {
      fr: 'Physique fondamentale et appliquée.',
      en: 'Fundamental and applied physics.',
    },
    overview: {
      fr: 'Le département de Physique couvre l’enseignement et la recherche en physique fondamentale et appliquée.',
      en: 'The Physics department covers teaching and research in fundamental and applied physics.',
    },
  },
  {
    id: 'dept-chem',
    slug: 'chemistry',
    name: { fr: 'Chimie', en: 'Chemistry' },
    description: {
      fr: 'Chimie générale, organique et des matériaux.',
      en: 'General, organic and materials chemistry.',
    },
    overview: {
      fr: 'Le département de Chimie propose des enseignements et des activités de recherche dans les différents domaines de la chimie.',
      en: 'The Chemistry department offers teaching and research activities across the different fields of chemistry.',
    },
  },
  {
    id: 'dept-cs',
    slug: 'computer-science',
    name: { fr: 'Informatique', en: 'Computer Science' },
    description: {
      fr: 'Programmation, systèmes d’information et données.',
      en: 'Programming, information systems and data.',
    },
    overview: {
      fr: 'Le département d’Informatique forme aux fondements et aux applications des sciences informatiques.',
      en: 'The Computer Science department trains students in the foundations and applications of computing.',
    },
  },
  {
    id: 'dept-bio',
    slug: 'biology',
    name: { fr: 'Biologie', en: 'Biology' },
    description: {
      fr: 'Sciences du vivant et de l’environnement.',
      en: 'Life and environmental sciences.',
    },
    overview: {
      fr: 'Le département de Biologie s’intéresse aux sciences du vivant et à l’environnement.',
      en: 'The Biology department focuses on life sciences and the environment.',
    },
  },
  {
    id: 'dept-lang',
    slug: 'foreign-languages',
    name: { fr: 'Langues étrangères', en: 'Foreign Languages' },
    description: {
      fr: 'Langues, communication et traduction.',
      en: 'Languages, communication and translation.',
    },
    overview: {
      fr: 'Le département de Langues étrangères assure l’enseignement des langues et de la communication.',
      en: 'The Foreign Languages department provides language and communication teaching.',
    },
  },
];
