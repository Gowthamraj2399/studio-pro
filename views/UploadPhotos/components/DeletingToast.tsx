import React, { memo } from "react";

interface DeletingToastProps {
  message: string;
}

const DeletingToastInner: React.FC<DeletingToastProps> = ({ message }) => (
  <div
    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 dark:bg-gray-700 text-white text-sm font-medium shadow-lg"
    role="status"
    aria-live="polite"
  >
    <span className="material-symbols-outlined text-lg animate-spin">
      progress_activity
    </span>
    {message}
  </div>
);

export const DeletingToast = memo(DeletingToastInner);
