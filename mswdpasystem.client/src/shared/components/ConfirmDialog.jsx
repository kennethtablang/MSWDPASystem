import Modal from './Modal';

export default function ConfirmDialog({
  isOpen, onClose, onConfirm,
  title, message,
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={loading ? undefined : onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-60 ${
            danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-700 hover:bg-blue-800'
          }`}
        >
          {loading ? 'Please wait…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
