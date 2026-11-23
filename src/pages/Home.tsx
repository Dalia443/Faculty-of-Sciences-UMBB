import { ArrowRight, Building2, CalendarClock, FlaskConical, Landmark, MapPin, ShieldAlert } from 'lucide-react';
import { AnnouncementCard } from '../components/announcements/AnnouncementCard';
import { DepartmentCard } from '../components/departments/DepartmentCard';
import { ButtonLink } from '../components/ui/Button';
import { SectionHeading } from '../components/ui/SectionHeading';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StateViews';
import { siteInfo } from '../data/site';
import { useAsync } from '../hooks/useAsync';
import { useI18n } from '../i18n';
import { api } from '../services/api';

export default function Home() {
  const { t, l } = useI18n();
  const departments = useAsync(() => api.getDepartments());
  const news = useAsync(() => api.getAnnouncements());
  const latest = (news.data ?? []).slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <p className="hero__eyebrow">{t('home.eyebrow')}</p>
          <h1>{t('home.title')}</h1>
          <p className="hero__text">{t('home.text')}</p>
          <div className="hero__actions">
            <ButtonLink to="/departments" variant="light">
              {t('home.ctaDepartments')} <ArrowRight size={18} aria-hidden="true" />
            </ButtonLink>
            <ButtonLink to="/news" variant="ghost" className="btn--on-dark">{t('home.ctaNews')}</ButtonLink>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <h2>{t('home.welcomeTitle')}</h2>
            <p>{t('home.welcomeText')}</p>
            <h3>{t('home.introTitle')}</h3>
            <p>{t('home.introText')}</p>
          </div>
          <aside className="card facts" aria-label={t('about.factsTitle')}>
            <div className="fact"><Landmark aria-hidden="true" /><div><span>{t('home.factEstablished')}</span><strong>{l(siteInfo.established)}</strong></div></div>
            <div className="fact"><MapPin aria-hidden="true" /><div><span>{t('home.factLocation')}</span><strong>{l(siteInfo.campus)}</strong></div></div>
            <div className="fact"><Building2 aria-hidden="true" /><div><span>{t('home.factDepartments')}</span><strong>6</strong></div></div>
          </aside>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHeading title={t('home.deptTitle')} subtitle={t('home.deptSubtitle')} />
          {departments.loading && <LoadingState />}
          {departments.error && <ErrorState onRetry={departments.reload} />}
          {departments.data && (
            <div className="grid grid--3">
              {departments.data.map((d) => <DepartmentCard key={d.id} department={d} />)}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            title={t('home.latestTitle')}
            subtitle={t('home.latestSubtitle')}
            action={<ButtonLink to="/news" variant="secondary" size="sm">{t('home.viewAll')}</ButtonLink>}
          />
          {news.loading && <LoadingState />}
          {news.error && <ErrorState onRetry={news.reload} />}
          {news.data && latest.length === 0 && <EmptyState />}
          {latest.length > 0 && (
            <div className="grid grid--3">
              {latest.map((a) => <AnnouncementCard key={a.id} announcement={a} />)}
            </div>
          )}
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHeading title={t('home.infoTitle')} />
          <div className="grid grid--3">
            <article className="card info-card"><MapPin aria-hidden="true" /><h3>{t('home.info1Title')}</h3><p>{t('home.info1Text')}</p></article>
            <article className="card info-card"><CalendarClock aria-hidden="true" /><h3>{t('home.info2Title')}</h3><p>{t('home.info2Text')}</p></article>
            <article className="card info-card"><FlaskConical aria-hidden="true" /><h3>{t('home.info3Title')}</h3><p>{t('home.info3Text')}</p><ShieldAlert className="info-card__hint" aria-hidden="true" /></article>
          </div>
        </div>
      </section>
    </>
  );
}
