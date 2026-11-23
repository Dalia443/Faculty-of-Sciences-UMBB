import { FileCheck2, FilePen, Layers, Newspaper } from 'lucide-react';
import { useI18n } from '../../i18n';
import type { Announcement } from '../../types';

export function StatsCards({ items }: { items: Announcement[] }) {
  const { t } = useI18n();
  const published = items.filter((a) => a.status === 'published').length;
  const categories = new Set(items.map((a) => a.category)).size;
  const stats = [
    { label: t('dashboard.statTotal'), value: items.length, Icon: Newspaper },
    { label: t('dashboard.statPublished'), value: published, Icon: FileCheck2 },
    { label: t('dashboard.statDrafts'), value: items.length - published, Icon: FilePen },
    { label: t('dashboard.statCategories'), value: categories, Icon: Layers },
  ];
  return (
    <div className="stats">
      {stats.map(({ label, value, Icon }) => (
        <div className="card stat" key={label}>
          <span className="stat__icon"><Icon size={22} aria-hidden="true" /></span>
          <div>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
