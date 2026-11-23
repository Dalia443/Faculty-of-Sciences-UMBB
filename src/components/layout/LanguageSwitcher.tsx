import { Languages } from 'lucide-react';
import { useI18n } from '../../i18n';

/** Switches FR/EN without touching the router: the current page is kept. */
export function LanguageSwitcher() {
  const { t, toggleLang } = useI18n();
  return (
    <button type="button" className="lang-switch" onClick={toggleLang} aria-label={t('nav.language')}>
      <Languages size={16} aria-hidden="true" />
      <span lang={t('nav.switchTo') === 'English' ? 'en' : 'fr'}>{t('nav.switchTo')}</span>
    </button>
  );
}
