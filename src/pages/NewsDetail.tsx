import { ArrowLeft, CalendarDays } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { AnnouncementCard } from '../components/announcements/AnnouncementCard';
import { Badge } from '../components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StateViews';
import { useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { useI18n } from '../i18n';
import { ApiError, api } from '../services/api';
import { formatDate } from '../utils/format';

export default function NewsDetail() {
  const { id = '' } = useParams();
  const { t, l, lang } = useI18n();
  const { isAuthenticated } = useAuth();
  const item = useAsync(() => api.getAnnouncement(id), [id]);
  const others = useAsync(() => api.getAnnouncements(), []);

  const a = item.data;
  const hidden = a?.status === 'draft' && !isAuthenticated;
  const notFound = (item.error instanceof ApiError && item.error.status === 404) || hidden;
  const more = (others.data ?? []).filter((x) => x.id !== id).slice(0, 3);

  return (
    <section className="section">
      <div className="container container--narrow">
        <Link to="/news" className="link-arrow link-arrow--back">
          <ArrowLeft size={16} aria-hidden="true" /> {t('news.backToNews')}
        </Link>
        {item.loading && <LoadingState />}
        {notFound && <EmptyState message={t('news.notFound')} />}
        {item.error && !notFound && <ErrorState onRetry={item.reload} />}
        {a && !hidden && (
          <article className="article">
            <div className="announcement-card__meta">
              <Badge>{t(`categories.${a.category}`)}</Badge>
              {a.isDemo && <Badge tone="amber">{t('common.demoContent')}</Badge>}
            </div>
            <h1>{l(a.title)}</h1>
            <p className="announcement-card__date">
              <CalendarDays size={16} aria-hidden="true" /> {t('news.publishedOn')} {formatDate(a.publishedAt, lang)}
            </p>
            <div className="prose">
              {l(a.content).split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </article>
        )}
      </div>
      {a && !hidden && more.length > 0 && (
        <div className="container more">
          <h2>{t('news.moreTitle')}</h2>
          <div className="grid grid--3">
            {more.map((x) => <AnnouncementCard key={x.id} announcement={x} />)}
          </div>
        </div>
      )}
    </section>
  );
}
