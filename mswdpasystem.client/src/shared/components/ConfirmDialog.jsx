import { AlertTriangle, Archive, LogOut, Trash2, HelpCircle, PowerOff } from 'lucide-react';
import Modal from './Modal';
import Button from './ui/Button';

/**
 * The single confirmation dialog for every destructive or session-ending action:
 * delete, deactivate, archive and sign-out.
 *
 * `intent` sets the icon, colour and default wording so the same action always
 * looks the same wherever it is triggered — a staff member should recognise a
 * delete prompt instantly rather than reading it fresh each time.
 */
const INTENTS = {
  delete: {
    icon: Trash2,
    tone: 'bg-accent-100 text-accent-700',
    button: 'danger',
    title: 'Delete this record?',
    confirmLabel: 'Delete',
  },
  deactivate: {
    icon: PowerOff,
    tone: 'bg-gold-100 text-gold-800',
    button: 'danger',
    title: 'Deactivate this record?',
    confirmLabel: 'Deactivate',
  },
  archive: {
    icon: Archive,
    tone: 'bg-gold-100 text-gold-800',
    button: 'primary',
    title: 'Archive this record?',
    confirmLabel: 'Archive',
  },
  logout: {
    icon: LogOut,
    tone: 'bg-primary-100 text-primary-700',
    button: 'primary',
    title: 'Sign out?',
    confirmLabel: 'Sign out',
  },
  warning: {
    icon: AlertTriangle,
    tone: 'bg-gold-100 text-gold-800',
    button: 'primary',
    title: 'Please confirm',
    confirmLabel: 'Continue',
  },
  info: {
    icon: HelpCircle,
    tone: 'bg-primary-100 text-primary-700',
    button: 'primary',
    title: 'Please confirm',
    confirmLabel: 'Confirm',
  },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  intent = 'info',
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  /** Extra context rendered under the message — consequences, counts, names. */
  details,
  loading = false,
  /** Legacy prop: `danger` still maps onto the delete styling. */
  danger = false,
}) {
  const preset = INTENTS[danger && intent === 'info' ? 'delete' : intent] ?? INTENTS.info;
  const Icon = preset.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      title={title ?? preset.title}
      size="sm"
    >
      <div className="flex gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${preset.tone}`}>
          <Icon size={20} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-700">{message}</p>
          {details && <div className="mt-3 text-sm text-gray-500">{details}</div>}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={preset.button} onClick={onConfirm} loading={loading}>
          {loading ? 'Please wait…' : (confirmLabel ?? preset.confirmLabel)}
        </Button>
      </div>
    </Modal>
  );
}
