import { ExternalLink, LogOut } from 'lucide-react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher';
import { Logo } from '../components/layout/Logo';
import { ScrollToTop } from '../components/layout/ScrollToTop';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';

export function AdminLayout() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="admin-shell">
      <ScrollToTop />
      <a className="skip-link" href="#main-content">{t('common.skip')}</a>
      <header className="admin-bar">
        <div className="container admin-bar__inner">
          <Logo to="/admin" inverted />
          <div className="admin-bar__right">
            <span className="admin-bar__user">{user?.email}</span>
            <Link to="/" className="admin-bar__link">
              {t('dashboard.viewSite')} <ExternalLink size={14} aria-hidden="true" />
            </Link>
            <LanguageSwitcher />
            <Button
              variant="light"
              size="sm"
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
            >
              <LogOut size={15} aria-hidden="true" /> {t('auth.logout')}
            </Button>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
