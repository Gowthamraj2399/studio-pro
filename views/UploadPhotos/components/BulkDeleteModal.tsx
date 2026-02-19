import React, { memo } from "react";

interface BulkDeleteModalProps {
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const BulkDeleteModalInner: React.FC<BulkDeleteModalProps> = ({
  selectedCount,
  onConfirm,
  onCancel,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="bulk-delete-dialog-title"
    onClick={onCancel}
  >
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-800 p-6 max-w-sm w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <h2
        id="bulk-delete-dialog-title"
        className="text-xl font-bold text-slate-900 dark:text-white mb-2"
      >
        Delete {selectedCount} photo{selectedCount !== 1 ? "s" : ""}?
      </h2>
      <p className="text-slate-600 dark:text-gray-400 text-sm mb-6">
        This cannot be undone.
      </p>
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          className="px-4 py-2 rounded-xl font-bold text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
          onClick={onConfirm}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

export const BulkDeleteModal = memo(BulkDeleteModalInner);
