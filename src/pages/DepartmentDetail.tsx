import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { departmentImages, fallbackDepartmentImage } from '../assets';
import { PageHero } from '../components/ui/PageHero';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StateViews';
import { siteInfo } from '../data/site';
import { useAsync } from '../hooks/useAsync';
import { useI18n } from '../i18n';
import { api } from '../services/api';

export default function DepartmentDetail() {
  const { slug } = useParams();
  const { t, l } = useI18n();
  const { data, loading, error, reload } = useAsync(() => api.getDepartments(), []);
  const department = data?.find((d) => d.slug === slug);

  return (
    <>
      <PageHero title={department ? l(department.name) : t('departments.title')} subtitle={department ? l(department.description) : undefined} />
      <section className="section">
        <div className="container">
          <Link to="/departments" className="link-arrow link-arrow--back">
            <ArrowLeft size={16} aria-hidden="true" /> {t('departments.all')}
          </Link>
          {loading && <LoadingState />}
          {error && <ErrorState onRetry={reload} />}
          {data && !department && <EmptyState message={t('departments.notFound')} />}
          {department && (
            <div className="split split--top detail">
              <img className="detail__image" src={departmentImages[department.slug] ?? fallbackDepartmentImage} alt="" />
              <div className="prose">
                <h2>{t('departments.overview')}</h2>
                <p>{l(department.overview)}</p>
                <p className="note">{t('departments.officialNote')}</p>
                <a className="btn btn--primary btn--md" href={siteInfo.links.faculty} target="_blank" rel="noopener noreferrer">
                  {t('departments.officialLink')} <ExternalLink size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
