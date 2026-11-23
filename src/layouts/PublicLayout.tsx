import { Outlet } from 'react-router-dom';
import { Footer } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';
import { ScrollToTop } from '../components/layout/ScrollToTop';
import { useI18n } from '../i18n';

export function PublicLayout() {
  const { t } = useI18n();
  return (
    <>
      <ScrollToTop />
      <a className="skip-link" href="#main-content">{t('common.skip')}</a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
