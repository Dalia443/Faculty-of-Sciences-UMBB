import { ExternalLink } from 'lucide-react';
import { Logo } from '../components/layout/Logo';
import { PageHero } from '../components/ui/PageHero';
import { siteInfo } from '../data/site';
import { useI18n } from '../i18n';

export default function About() {
  const { t, l } = useI18n();
  const sources = [
    { href: siteInfo.links.presentation, label: t('about.sourcePresentation') },
    { href: siteInfo.links.faculties, label: t('about.sourceFaculties') },
    { href: siteInfo.links.faculty, label: t('about.sourceFaculty') },
  ];
  return (
    <>
      <PageHero title={t('about.title')} subtitle={t('about.subtitle')} />
      <section className="section">
        <div className="container split split--top">
          <div className="prose">
            <h2>{t('about.introTitle')}</h2>
            <p>{t('about.introText')}</p>
            <h2>{t('about.historyTitle')}</h2>
            <p>{t('about.historyText')}</p>
            <h2>{t('about.missionTitle')}</h2>
            <p>{t('about.missionText')}</p>
            <h2>{t('about.researchTitle')}</h2>
            <p>{t('about.researchText')}</p>
            <p className="note">{t('about.validateNote')}</p>
          </div>
          <aside className="card about-card">
            <Logo size="lg" to={null} showText={false} />
            <h3>{t('about.factsTitle')}</h3>
            <dl className="dl">
              <dt>{t('about.factUniversity')}</dt><dd>{t('brand.university')}</dd>
              <dt>{t('about.factFaculty')}</dt><dd>{t('brand.faculty')}</dd>
              <dt>{t('about.factCreated')}</dt><dd>{l(siteInfo.established)}</dd>
              <dt>{t('about.factAddress')}</dt><dd>{siteInfo.address}</dd>
              <dt>{t('about.factDepartments')}</dt><dd>6</dd>
            </dl>
            <h3>{t('about.sourcesTitle')}</h3>
            <ul className="link-list">
              {sources.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label} <ExternalLink size={13} aria-label={t('common.external')} />
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
