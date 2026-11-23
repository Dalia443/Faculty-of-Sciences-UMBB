/** Verified institutional information (see the project brief). */
export const siteInfo = {
  established: { fr: '2 juin 1998', en: 'June 2, 1998' },
  campus: { fr: 'Campus Sud, Boumerdès, Algérie', en: 'South Campus, Boumerdes, Algeria' },
  address: 'Route de la Gare Ferroviaire, 35000 Boumerdes, Algeria',
  links: {
    faculty: 'https://fs.univ-boumerdes.dz/',
    university: 'https://umbb.univ-boumerdes.dz/',
    presentation: 'https://umbb.univ-boumerdes.dz/universite/presentation/',
    faculties: 'https://umbb.univ-boumerdes.dz/universite/facultes-et-instituts/',
    map: 'https://www.openstreetmap.org/search?query=Route%20de%20la%20Gare%20Ferroviaire%2C%20Boumerdes',
  },
} as const;

/** Demonstration credentials, displayed on the login page. NOT secure. */
export const demoCredentials = { email: 'admin@demo.local', password: 'demo1234' } as const;
