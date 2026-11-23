import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '../../components/layout/LanguageSwitcher';
import { Logo } from '../../components/layout/Logo';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/Fields';
import { useAuth } from '../../context/AuthContext';
import { demoCredentials } from '../../data/site';
import { useI18n } from '../../i18n';
import { config } from '../../services/config';
import { isValidEmail } from '../../utils/format';

export default function AdminLogin() {
  const { t } = useI18n();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email.trim()) next.email = t('auth.emailRequired');
    else if (!isValidEmail(email)) next.email = t('auth.emailInvalid');
    if (!password) next.password = t('auth.passwordRequired');
    else if (password.length < 6) next.password = t('auth.passwordShort');
    setErrors(next);
    setFailed(false);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/admin', { replace: true });
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <aside className="login__brand">
        <Logo size="lg" to="/" showText={false} />
        <h1>{t('brand.faculty')}</h1>
        <p>{t('brand.university')}</p>
      </aside>
      <main className="login__panel" id="main-content">
        <div className="login__top">
          <Link to="/" className="link-arrow link-arrow--back">
            <ArrowLeft size={16} aria-hidden="true" /> {t('auth.backToSite')}
          </Link>
          <LanguageSwitcher />
        </div>
        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <h2>{t('auth.title')}</h2>
          <p className="login__subtitle">{t('auth.subtitle')}</p>
          {config.useDemo && (
            <div className="alert alert--warning" role="note">
              <AlertTriangle size={18} aria-hidden="true" />
              <div>
                <p>{t('auth.demoWarning')}</p>
                <p>
                  <strong>{t('auth.demoCredentials')} :</strong> <code>{demoCredentials.email}</code> / <code>{demoCredentials.password}</code>
                </p>
              </div>
            </div>
          )}
          <TextField label={t('auth.email')} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
          <TextField label={t('auth.password')} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
          {failed && <p className="form__error" role="alert">{t('auth.invalid')}</p>}
          <Button type="submit" className="btn--block" disabled={busy}>
            {busy ? t('auth.signingIn') : t('auth.signIn')}
          </Button>
        </form>
      </main>
    </div>
  );
}
