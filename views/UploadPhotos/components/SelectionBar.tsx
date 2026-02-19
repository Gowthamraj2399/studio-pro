import React, { memo } from "react";

interface SelectionBarProps {
  selectedCount: number;
  onBulkDownload: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

const SelectionBarInner: React.FC<SelectionBarProps> = ({
  selectedCount,
  onBulkDownload,
  onBulkDelete,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-4 p-4 rounded-2xl border border-primary/30 bg-primary/5 dark:bg-primary/10">
      <span className="font-bold text-slate-900 dark:text-white">
        {selectedCount} selected
      </span>
      <button
        type="button"
        onClick={onBulkDownload}
        className="px-4 py-2 rounded-xl font-bold bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-lg">download</span>
        Download
      </button>
      <button
        type="button"
        onClick={onBulkDelete}
        className="px-4 py-2 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-lg">delete</span>
        Delete
      </button>
      <button
        type="button"
        onClick={onClearSelection}
        className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800"
      >
        Clear selection
      </button>
    </div>
  );
};

export const SelectionBar = memo(SelectionBarInner);
