import mathematics from './departments/mathematics.svg';
import physics from './departments/physics.svg';
import chemistry from './departments/chemistry.svg';
import computerScience from './departments/computer-science.svg';
import biology from './departments/biology.svg';
import foreignLanguages from './departments/foreign-languages.svg';

/** Local illustration per department slug (replace with photos if desired). */
export const departmentImages: Record<string, string> = {
  mathematics,
  physics,
  chemistry,
  'computer-science': computerScience,
  biology,
  'foreign-languages': foreignLanguages,
};

export const fallbackDepartmentImage = mathematics;
