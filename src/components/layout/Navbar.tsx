import { Menu, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useI18n, type TranslationKey } from '../../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';

const links: { to: string; key: TranslationKey; end?: boolean }[] = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/about', key: 'nav.about' },
  { to: '/departments', key: 'nav.departments' },
  { to: '/news', key: 'nav.news' },
  { to: '/contact', key: 'nav.contact' },
];

export function Navbar() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Logo inverted />
        <nav id="main-nav" className={`navbar__links ${open ? 'is-open' : ''}`} aria-label={t('nav.main')}>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="navbar__link">
              {t(link.key)}
            </NavLink>
          ))}
          <NavLink to="/admin" className="navbar__link navbar__link--admin">
            <ShieldCheck size={16} aria-hidden="true" />
            {t('nav.admin')}
          </NavLink>
        </nav>
        <LanguageSwitcher />
        <button
          type="button"
          className="navbar__burger"
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label={t('nav.menu')}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
