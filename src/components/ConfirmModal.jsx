import { AlertTriangle, X } from 'lucide-react';

/**
 * A reusable confirmation dialog - replaces window.confirm() everywhere.
 * Controlled from the parent: pass `open`, and handlers for confirm/cancel.
 */
export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-hive-panel rounded-2xl p-5 w-full max-w-sm shadow-xl"
      >
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <X size={18} />
        </button>

        <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-3 ${danger ? 'bg-red-500/10 text-red-500' : 'bg-hive-yellow/20 text-hive-yellow'}`}>
          <AlertTriangle size={20} />
        </div>

        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
        {message && <p className="text-sm text-gray-500 mb-5">{message}</p>}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-hive-yellow text-black hover:brightness-95'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
