import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AnnouncementCard } from '../components/announcements/AnnouncementCard';
import { Button } from '../components/ui/Button';
import { PageHero } from '../components/ui/PageHero';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StateViews';
import { useAsync } from '../hooks/useAsync';
import { useI18n } from '../i18n';
import { api } from '../services/api';
import { ANNOUNCEMENT_CATEGORIES, type AnnouncementCategory } from '../types';

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function News() {
  const { t, l } = useI18n();
  const { data, loading, error, reload } = useAsync(() => api.getAnnouncements());
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory | ''>('');

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return (data ?? []).filter(
      (a) =>
        (!category || a.category === category) &&
        (!q || normalize(`${l(a.title)} ${l(a.content)}`).includes(q)),
    );
  }, [data, query, category, l]);

  const filtering = query.trim() !== '' || category !== '';
  const featured = !filtering ? filtered[0] : undefined;
  const rest = featured ? filtered.slice(1) : filtered;

  return (
    <>
      <PageHero title={t('news.title')} subtitle={t('news.subtitle')} />
      <section className="section">
        <div className="container">
          <div className="toolbar">
            <div className="search">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('news.searchPlaceholder')}
                aria-label={t('news.searchLabel')}
              />
            </div>
            <div className="chips" role="group" aria-label={t('news.categoryLabel')}>
              <button type="button" className="chip" aria-pressed={category === ''} onClick={() => setCategory('')}>
                {t('news.allCategories')}
              </button>
              {ANNOUNCEMENT_CATEGORIES.map((c) => (
                <button key={c} type="button" className="chip" aria-pressed={category === c} onClick={() => setCategory(c)}>
                  {t(`categories.${c}`)}
                </button>
              ))}
            </div>
          </div>

          {loading && <LoadingState />}
          {error && <ErrorState onRetry={reload} />}
          {data && (
            <p className="result-count" aria-live="polite">{t('news.count', { count: filtered.length })}</p>
          )}
          {data && filtered.length === 0 && (
            <EmptyState
              message={t('news.noResults')}
              action={
                filtering ? (
                  <Button variant="secondary" size="sm" onClick={() => { setQuery(''); setCategory(''); }}>
                    {t('news.resetFilters')}
                  </Button>
                ) : undefined
              }
            />
          )}
          {featured && (
            <div className="featured">
              <h2 className="featured__label">{t('news.recent')}</h2>
              <AnnouncementCard announcement={featured} featured />
            </div>
          )}
          {rest.length > 0 && (
            <div className="grid grid--3">
              {rest.map((a) => <AnnouncementCard key={a.id} announcement={a} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
