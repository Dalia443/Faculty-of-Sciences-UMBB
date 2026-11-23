import { ExternalLink, Info, MapPin } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '../components/ui/Button';
import { TextAreaField, TextField } from '../components/ui/Fields';
import { PageHero } from '../components/ui/PageHero';
import { siteInfo } from '../data/site';
import { useI18n } from '../i18n';
import { api } from '../services/api';
import { isValidEmail } from '../utils/format';

type Errors = Partial<Record<'name' | 'email' | 'subject' | 'message', string>>;

export default function Contact() {
  const { t, l } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const update = (field: keyof typeof form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!form.name.trim()) next.name = t('contact.nameRequired');
    if (!form.email.trim()) next.email = t('contact.emailRequired');
    else if (!isValidEmail(form.email)) next.email = t('contact.emailInvalid');
    if (!form.subject.trim()) next.subject = t('contact.subjectRequired');
    if (!form.message.trim()) next.message = t('contact.messageRequired');
    else if (form.message.trim().length < 10) next.message = t('contact.messageShort');
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus('sending');
    try {
      await api.sendContactMessage(form);
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <PageHero title={t('contact.title')} subtitle={t('contact.subtitle')} />
      <section className="section">
        <div className="container split split--top">
          <div className="stack">
            <article className="card info-card">
              <MapPin aria-hidden="true" />
              <h2>{t('contact.addressTitle')}</h2>
              <p>
                <strong>{t('contact.addressLine')}</strong><br />
                {siteInfo.address}
              </p>
              <p className="note"><Info size={16} aria-hidden="true" /> {t('contact.verifiedNote')}</p>
              <a href={siteInfo.links.faculty} target="_blank" rel="noopener noreferrer" className="link-arrow">
                {t('contact.officialSite')} <ExternalLink size={14} aria-hidden="true" />
              </a>
            </article>
            <article className="card map-card">
              <h2>{t('contact.locationTitle')}</h2>
              <div className="map-card__visual" aria-hidden="true">
                <MapPin size={36} />
                <span>{l(siteInfo.campus)}</span>
              </div>
              <a className="btn btn--secondary btn--md" href={siteInfo.links.map} target="_blank" rel="noopener noreferrer">
                {t('contact.openMap')} <ExternalLink size={16} aria-hidden="true" />
              </a>
            </article>
          </div>

          <form className="card form form--card" onSubmit={handleSubmit} noValidate>
            <h2>{t('contact.formTitle')}</h2>
            <TextField label={t('contact.name')} value={form.name} onChange={update('name')} error={errors.name} autoComplete="name" />
            <TextField label={t('contact.email')} type="email" value={form.email} onChange={update('email')} error={errors.email} autoComplete="email" />
            <TextField label={t('contact.subject')} value={form.subject} onChange={update('subject')} error={errors.subject} />
            <TextAreaField label={t('contact.message')} rows={5} value={form.message} onChange={update('message')} error={errors.message} />
            {status === 'success' && <p className="form__success" role="status">{t('contact.success')}</p>}
            {status === 'error' && <p className="form__error" role="alert">{t('common.error')}</p>}
            <Button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? t('contact.sending') : t('contact.send')}
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}
