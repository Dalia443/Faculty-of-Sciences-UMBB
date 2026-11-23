import { DepartmentCard } from '../components/departments/DepartmentCard';
import { PageHero } from '../components/ui/PageHero';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StateViews';
import { useAsync } from '../hooks/useAsync';
import { useI18n } from '../i18n';
import { api } from '../services/api';

export default function Departments() {
  const { t } = useI18n();
  const { data, loading, error, reload } = useAsync(() => api.getDepartments());
  return (
    <>
      <PageHero title={t('departments.title')} subtitle={t('departments.subtitle')} />
      <section className="section">
        <div className="container">
          {loading && <LoadingState />}
          {error && <ErrorState onRetry={reload} />}
          {data && data.length === 0 && <EmptyState />}
          {data && data.length > 0 && (
            <div className="grid grid--3">
              {data.map((d) => <DepartmentCard key={d.id} department={d} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
