import { Modal } from '@/components/ui/Modal';
import { Button, type ButtonVariant } from '@/components/ui/Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel, tone = 'danger' }: ConfirmDialogProps) {
  const variant: ButtonVariant = tone === 'danger' ? 'danger' : 'primary';
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={variant}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
    </Modal>
  );
}
