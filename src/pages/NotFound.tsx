import { ButtonLink } from '../components/ui/Button';
import { useI18n } from '../i18n';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <section className="section">
      <div className="container container--narrow not-found">
        <p className="not-found__code">404</p>
        <h1>{t('errors.notFoundTitle')}</h1>
        <p>{t('errors.notFoundText')}</p>
        <ButtonLink to="/">{t('errors.goHome')}</ButtonLink>
      </div>
    </section>
  );
}
