import React, { memo } from "react";
import type { FailedUpload } from "../types";

interface FailedUploadsCardProps {
  failedUploads: FailedUpload[];
  onRetry: () => void;
  onDismiss: () => void;
  isRetrying?: boolean;
}

const FailedUploadsCardInner: React.FC<FailedUploadsCardProps> = ({
  failedUploads,
  onRetry,
  onDismiss,
  isRetrying = false,
}) => {
  if (failedUploads.length === 0) return null;
  return (
    <div className="mb-6 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-red-600 dark:text-red-400">
            error
          </span>
          <h3 className="font-bold text-red-800 dark:text-red-200">
            {failedUploads.length} upload{failedUploads.length !== 1 ? "s" : ""}{" "}
            failed
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold flex items-center gap-2"
          >
            {isRetrying ? (
              <>
                <span className="material-symbols-outlined animate-spin text-lg">
                  progress_activity
                </span>
                Retrying…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">
                  refresh
                </span>
                Retry failed
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            disabled={isRetrying}
            className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20 text-sm font-bold"
          >
            Dismiss
          </button>
        </div>
      </div>
      <div className="max-h-48 overflow-y-auto rounded-xl bg-white/50 dark:bg-black/20 p-3 space-y-1.5">
        {failedUploads.map((f, i) => (
          <div
            key={`${f.filename}-${i}`}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <span
              className="truncate text-red-900 dark:text-red-100 font-medium"
              title={f.filename}
            >
              {f.filename}
            </span>
            <span
              className="shrink-0 text-red-600 dark:text-red-400 text-xs max-w-[12rem] truncate"
              title={f.error}
            >
              {f.error}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FailedUploadsCard = memo(FailedUploadsCardInner);
