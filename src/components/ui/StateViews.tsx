import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useI18n } from '../../i18n';
import { Button } from './Button';

export function LoadingState({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <div className="state" role="status" aria-live="polite">
      <Loader2 className="state__icon spin" aria-hidden="true" />
      <p>{label ?? t('common.loading')}</p>
    </div>
  );
}

export function EmptyState({ message, action }: { message?: string; action?: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="state">
      <Inbox className="state__icon" aria-hidden="true" />
      <p>{message ?? t('common.empty')}</p>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="state state--error" role="alert">
      <AlertTriangle className="state__icon" aria-hidden="true" />
      <p>{message ?? t('common.error')}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
