import React from "react";

interface AlbumBarProps {
  photoCount: number;
  maxSize?: number;
  isSubmitted: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export const AlbumBar: React.FC<AlbumBarProps> = ({
  photoCount,
  maxSize,
  isSubmitted,
  isSubmitting,
  onSubmit,
}) => (
  <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 p-4 z-40">
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400">
        <span className="material-symbols-outlined text-2xl">photo_library</span>
        <span className="font-semibold">
          {isSubmitted
            ? "Album submitted"
            : maxSize != null
              ? `My album (${photoCount} / ${maxSize} photo${maxSize !== 1 ? "s" : ""})`
              : `My album (${photoCount} photo${photoCount !== 1 ? "s" : ""})`}
        </span>
      </div>
      {!isSubmitted && (
        <button
          type="button"
          disabled={photoCount === 0 || isSubmitting}
          onClick={onSubmit}
          className="h-12 px-6 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined animate-spin">
                progress_activity
              </span>
              Submitting…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">send</span>
              Submit album
            </>
          )}
        </button>
      )}
    </div>
  </div>
);
