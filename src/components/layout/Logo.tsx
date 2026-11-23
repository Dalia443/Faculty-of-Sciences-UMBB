import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';

/**
 * Official logo of the Faculty of Sciences, loaded UNMODIFIED from
 * /public/logo.png. It is shown inside a white badge so it stays readable on
 * dark backgrounds. If the file is missing, a plain text wordmark is shown.
 */
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  /** Link target; use null for a non-clickable logo. */
  to?: string | null;
  showText?: boolean;
  inverted?: boolean;
}

export function Logo({ size = 'md', to = '/', showText = true, inverted = false }: LogoProps) {
  const { t } = useI18n();
  const [failed, setFailed] = useState(false);

  const content = (
    <>
      {failed ? (
        <span className={`logo__fallback logo__fallback--${size}`}>{t('brand.short')}</span>
      ) : (
        <span className={`logo__badge logo__badge--${size}`}>
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt={t('brand.logoAlt')}
            onError={() => setFailed(true)}
          />
        </span>
      )}
      {showText && (
        <span className="logo__text">
          <strong>{t('brand.faculty')}</strong>
          <small>{t('brand.university')}</small>
        </span>
      )}
    </>
  );

  const className = `logo ${inverted ? 'logo--inverted' : ''}`;
  return to ? (
    <Link to={to} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}
