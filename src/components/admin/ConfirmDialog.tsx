import { useState } from 'react';
import { useI18n } from '../../i18n';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: Props) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function run() {
    setBusy(true);
    setFailed(false);
    try {
      await onConfirm();
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  return (
    <Modal title={title} onClose={onCancel}>
      <p>{message}</p>
      {failed && <p className="form__error" role="alert">{t('common.error')}</p>}
      <div className="form__actions">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>{t('common.cancel')}</Button>
        <Button variant="danger" onClick={run} disabled={busy}>{busy ? t('common.loading') : confirmLabel}</Button>
      </div>
    </Modal>
  );
}
