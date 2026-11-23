import { ArrowRight, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';
import type { Announcement } from '../../types';
import { formatDate } from '../../utils/format';
import { Badge } from '../ui/Badge';

interface Props {
  announcement: Announcement;
  featured?: boolean;
}

export function AnnouncementCard({ announcement, featured = false }: Props) {
  const { t, l, lang } = useI18n();
  const excerpt = l(announcement.content).replace(/\s+/g, ' ').slice(0, featured ? 260 : 120);
  return (
    <article className={`card card--hover announcement-card ${featured ? 'announcement-card--featured' : ''}`}>
      <div className="card__body">
        <div className="announcement-card__meta">
          <Badge>{t(`categories.${announcement.category}`)}</Badge>
          {announcement.isDemo && <Badge tone="amber">{t('common.demo')}</Badge>}
        </div>
        <h3>{l(announcement.title)}</h3>
        <p className="announcement-card__date">
          <CalendarDays size={15} aria-hidden="true" /> {formatDate(announcement.publishedAt, lang)}
        </p>
        <p>{excerpt}{excerpt.length >= (featured ? 260 : 120) ? '…' : ''}</p>
        <Link to={`/news/${announcement.id}`} className="link-arrow">
          {t('common.readMore')} <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
