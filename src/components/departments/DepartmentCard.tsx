import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { departmentImages, fallbackDepartmentImage } from '../../assets';
import { useI18n } from '../../i18n';
import type { Department } from '../../types';

export function DepartmentCard({ department }: { department: Department }) {
  const { t, l } = useI18n();
  const name = l(department.name);
  return (
    <article className="card card--hover department-card">
      <img
        className="department-card__image"
        src={departmentImages[department.slug] ?? fallbackDepartmentImage}
        alt=""
        loading="lazy"
      />
      <div className="card__body">
        <h3>{name}</h3>
        <p>{l(department.description)}</p>
        <Link to={`/departments/${department.slug}`} className="link-arrow" aria-label={`${t('common.details')} — ${name}`}>
          {t('common.details')} <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
