import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AnnouncementForm } from '../../components/admin/AnnouncementForm';
import { AnnouncementTable } from '../../components/admin/AnnouncementTable';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { StatsCards } from '../../components/admin/StatsCards';
import { Toast } from '../../components/admin/Toast';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/StateViews';
import { config } from '../../services/config';
import { useAsync } from '../../hooks/useAsync';
import { useI18n } from '../../i18n';
import { api } from '../../services/api';
import {
  ANNOUNCEMENT_CATEGORIES,
  type Announcement,
  type AnnouncementCategory,
  type AnnouncementInput,
  type AnnouncementStatus,
} from '../../types';

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const byDate = (a: Announcement, b: Announcement) => b.publishedAt.localeCompare(a.publishedAt);

type Dialog = { kind: 'create' } | { kind: 'edit'; item: Announcement } | { kind: 'delete'; item: Announcement } | null;

export default function AdminDashboard() {
  const { t, l } = useI18n();
  const { data, loading, error, reload, setData } = useAsync(() => api.getAnnouncements({ includeDrafts: true }));
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<AnnouncementStatus | ''>('');
  const [category, setCategory] = useState<AnnouncementCategory | ''>('');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [toast, setToast] = useState<string | null>(null);

  const items = data ?? [];
  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return items.filter(
      (a) =>
        (!status || a.status === status) &&
        (!category || a.category === category) &&
        (!q || normalize(`${a.title.fr} ${a.title.en}`).includes(q)),
    );
  }, [items, query, status, category]);

  async function create(input: AnnouncementInput) {
    const created = await api.createAnnouncement(input);
    setData([created, ...items].sort(byDate));
    setDialog(null);
    setToast(t('dashboard.created'));
  }

  async function update(id: string, input: AnnouncementInput) {
    const updated = await api.updateAnnouncement(id, input);
    setData(items.map((a) => (a.id === id ? updated : a)).sort(byDate));
    setDialog(null);
    setToast(t('dashboard.updated'));
  }

  async function remove(id: string) {
    await api.deleteAnnouncement(id);
    setData(items.filter((a) => a.id !== id));
    setDialog(null);
    setToast(t('dashboard.deleted'));
  }

  async function toggleStatus(a: Announcement) {
    try {
      const updated = await api.updateAnnouncement(a.id, {
        title: a.title,
        content: a.content,
        category: a.category,
        publishedAt: a.publishedAt,
        status: a.status === 'published' ? 'draft' : 'published',
      });
      setData(items.map((x) => (x.id === a.id ? updated : x)));
      setToast(t('dashboard.updated'));
    } catch {
      setToast(t('dashboard.saveError'));
    }
  }

  return (
    <div className="container dashboard">
      <div className="dashboard__head">
        <div>
          <h1>{t('dashboard.title')}</h1>
          <p>{t('dashboard.welcome')}</p>
        </div>
        <Button onClick={() => setDialog({ kind: 'create' })}>
          <Plus size={18} aria-hidden="true" /> {t('dashboard.add')}
        </Button>
      </div>

      {config.useDemo && <div className="alert alert--warning" role="note">{t('dashboard.demoBanner')}</div>}

      {loading && <LoadingState />}
      {error && <ErrorState onRetry={reload} />}

      {data && (
        <>
          <StatsCards items={items} />
          <div className="toolbar toolbar--admin">
            <div className="search">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('dashboard.searchPlaceholder')}
                aria-label={t('dashboard.searchPlaceholder')}
              />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value as AnnouncementStatus | '')} aria-label={t('dashboard.filterStatus')}>
              <option value="">{t('dashboard.allStatuses')}</option>
              <option value="published">{t('dashboard.published')}</option>
              <option value="draft">{t('dashboard.draft')}</option>
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value as AnnouncementCategory | '')} aria-label={t('dashboard.filterCategory')}>
              <option value="">{t('news.allCategories')}</option>
              {ANNOUNCEMENT_CATEGORIES.map((c) => <option key={c} value={c}>{t(`categories.${c}`)}</option>)}
            </select>
          </div>
          {filtered.length === 0 ? (
            <EmptyState message={t('dashboard.empty')} />
          ) : (
            <AnnouncementTable
              items={filtered}
              onEdit={(item) => setDialog({ kind: 'edit', item })}
              onDelete={(item) => setDialog({ kind: 'delete', item })}
              onToggleStatus={toggleStatus}
            />
          )}
        </>
      )}

      {dialog?.kind === 'create' && (
        <Modal title={t('dashboard.formAddTitle')} onClose={() => setDialog(null)} wide>
          <AnnouncementForm onSubmit={create} onCancel={() => setDialog(null)} />
        </Modal>
      )}
      {dialog?.kind === 'edit' && (
        <Modal title={t('dashboard.formEditTitle')} onClose={() => setDialog(null)} wide>
          <AnnouncementForm initial={dialog.item} onSubmit={(input) => update(dialog.item.id, input)} onCancel={() => setDialog(null)} />
        </Modal>
      )}
      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          title={t('dashboard.confirmTitle')}
          message={t('dashboard.confirmText', { title: l(dialog.item.title) })}
          confirmLabel={t('common.delete')}
          onConfirm={() => remove(dialog.item.id)}
          onCancel={() => setDialog(null)}
        />
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
