import { useState, type FormEvent } from 'react';
import { useI18n } from '../../i18n';
import {
  ANNOUNCEMENT_CATEGORIES,
  type Announcement,
  type AnnouncementCategory,
  type AnnouncementInput,
  type AnnouncementStatus,
} from '../../types';
import { Button } from '../ui/Button';
import { SelectField, TextAreaField, TextField } from '../ui/Fields';

interface Props {
  initial?: Announcement;
  onSubmit: (input: AnnouncementInput) => Promise<void>;
  onCancel: () => void;
}

type Errors = Partial<Record<'titleFr' | 'titleEn' | 'contentFr' | 'contentEn' | 'date', string>>;

export function AnnouncementForm({ initial, onSubmit, onCancel }: Props) {
  const { t } = useI18n();
  const [titleFr, setTitleFr] = useState(initial?.title.fr ?? '');
  const [titleEn, setTitleEn] = useState(initial?.title.en ?? '');
  const [contentFr, setContentFr] = useState(initial?.content.fr ?? '');
  const [contentEn, setContentEn] = useState(initial?.content.en ?? '');
  const [category, setCategory] = useState<AnnouncementCategory>(initial?.category ?? 'academic');
  const [date, setDate] = useState(initial?.publishedAt ?? new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<AnnouncementStatus>(initial?.status ?? 'draft');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!titleFr.trim()) next.titleFr = t('common.required');
    if (!titleEn.trim()) next.titleEn = t('common.required');
    if (!contentFr.trim()) next.contentFr = t('common.required');
    if (!contentEn.trim()) next.contentEn = t('common.required');
    if (!date) next.date = t('dashboard.dateRequired');
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    setFailed(false);
    try {
      await onSubmit({
        title: { fr: titleFr.trim(), en: titleEn.trim() },
        content: { fr: contentFr.trim(), en: contentEn.trim() },
        category,
        status,
        publishedAt: date,
      });
    } catch {
      setFailed(true);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="form">
      <div className="form__grid">
        <TextField label={t('dashboard.titleFr')} value={titleFr} onChange={(e) => setTitleFr(e.target.value)} error={errors.titleFr} />
        <TextField label={t('dashboard.titleEn')} value={titleEn} onChange={(e) => setTitleEn(e.target.value)} error={errors.titleEn} />
        <TextAreaField label={t('dashboard.contentFr')} rows={4} value={contentFr} onChange={(e) => setContentFr(e.target.value)} error={errors.contentFr} />
        <TextAreaField label={t('dashboard.contentEn')} rows={4} value={contentEn} onChange={(e) => setContentEn(e.target.value)} error={errors.contentEn} />
        <SelectField label={t('dashboard.category')} value={category} onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}>
          {ANNOUNCEMENT_CATEGORIES.map((c) => (
            <option key={c} value={c}>{t(`categories.${c}`)}</option>
          ))}
        </SelectField>
        <TextField label={t('dashboard.date')} type="date" value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} />
        <SelectField label={t('dashboard.status')} value={status} onChange={(e) => setStatus(e.target.value as AnnouncementStatus)}>
          <option value="draft">{t('dashboard.draft')}</option>
          <option value="published">{t('dashboard.published')}</option>
        </SelectField>
      </div>
      {failed && <p className="form__error" role="alert">{t('dashboard.saveError')}</p>}
      <div className="form__actions">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>{t('common.cancel')}</Button>
        <Button type="submit" disabled={saving}>{saving ? t('common.loading') : t('common.save')}</Button>
      </div>
    </form>
  );
}
