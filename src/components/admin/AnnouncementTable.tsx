import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { useI18n } from '../../i18n';
import type { Announcement } from '../../types';
import { formatDate } from '../../utils/format';
import { Badge } from '../ui/Badge';

interface Props {
  items: Announcement[];
  onEdit: (a: Announcement) => void;
  onDelete: (a: Announcement) => void;
  onToggleStatus: (a: Announcement) => void;
}

export function AnnouncementTable({ items, onEdit, onDelete, onToggleStatus }: Props) {
  const { t, l, lang } = useI18n();
  return (
    <div className="table-wrap card">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">{t('dashboard.tableTitle')}</th>
            <th scope="col">{t('dashboard.tableCategory')}</th>
            <th scope="col">{t('dashboard.tableDate')}</th>
            <th scope="col">{t('dashboard.tableStatus')}</th>
            <th scope="col" className="table__actions-head">{t('dashboard.tableActions')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => {
            const published = a.status === 'published';
            const title = l(a.title);
            return (
              <tr key={a.id}>
                <td data-label={t('dashboard.tableTitle')}>
                  <strong>{title}</strong>
                  {a.isDemo && <> <Badge tone="amber">{t('common.demo')}</Badge></>}
                </td>
                <td data-label={t('dashboard.tableCategory')}>{t(`categories.${a.category}`)}</td>
                <td data-label={t('dashboard.tableDate')}>{formatDate(a.publishedAt, lang)}</td>
                <td data-label={t('dashboard.tableStatus')}>
                  <Badge tone={published ? 'green' : 'gray'}>
                    {published ? t('dashboard.published') : t('dashboard.draft')}
                  </Badge>
                </td>
                <td className="table__actions">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => onToggleStatus(a)}
                    title={published ? t('dashboard.unpublish') : t('dashboard.publish')}
                    aria-label={`${published ? t('dashboard.unpublish') : t('dashboard.publish')} — ${title}`}
                  >
                    {published ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => onEdit(a)}
                    title={t('common.edit')}
                    aria-label={`${t('common.edit')} — ${title}`}
                  >
                    <Pencil size={18} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn--danger"
                    onClick={() => onDelete(a)}
                    title={t('common.delete')}
                    aria-label={`${t('common.delete')} — ${title}`}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
