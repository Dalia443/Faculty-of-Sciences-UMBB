import { ExternalLink, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteInfo } from '../../data/site';
import { useI18n } from '../../i18n';
import { Logo } from './Logo';

export function Footer() {
  const { t, l } = useI18n();
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <Logo inverted />
          <p className="footer__about">{t('footer.about')}</p>
        </div>
        <div>
          <h2>{t('footer.links')}</h2>
          <ul>
            <li><Link to="/about">{t('nav.about')}</Link></li>
            <li><Link to="/departments">{t('nav.departments')}</Link></li>
            <li><Link to="/news">{t('nav.news')}</Link></li>
            <li><Link to="/contact">{t('nav.contact')}</Link></li>
          </ul>
        </div>
        <div>
          <h2>{t('footer.officialSites')}</h2>
          <ul>
            <li>
              <a href={siteInfo.links.faculty} target="_blank" rel="noopener noreferrer">
                fs.univ-boumerdes.dz <ExternalLink size={13} aria-label={t('common.external')} />
              </a>
            </li>
            <li>
              <a href={siteInfo.links.university} target="_blank" rel="noopener noreferrer">
                umbb.univ-boumerdes.dz <ExternalLink size={13} aria-label={t('common.external')} />
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2>{t('footer.contact')}</h2>
          <p className="footer__address">
            <MapPin size={16} aria-hidden="true" />
            <span>
              {l(siteInfo.campus)}
              <br />
              {siteInfo.address}
            </span>
          </p>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} {t('brand.faculty')} — UMBB. {t('footer.rights')}</span>
        <Link to="/admin">{t('footer.admin')}</Link>
      </div>
    </footer>
  );
}
