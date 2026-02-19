import React from "react";

interface DownloadOptionsModalProps {
  photoCount: number;
  onClose: () => void;
  onSelectOriginal: () => void;
  onSelectZip: () => void;
}

export const DownloadOptionsModal: React.FC<DownloadOptionsModalProps> = ({
  photoCount,
  onClose,
  onSelectOriginal,
  onSelectZip,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-labelledby="download-options-title"
  >
    <div
      className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-xl p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 id="download-options-title" className="text-xl font-bold text-slate-900 dark:text-white">
          Download photos
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">
        {photoCount} photo{photoCount !== 1 ? "s" : ""} will be downloaded.
      </p>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => {
            onSelectOriginal();
            onClose();
          }}
          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors text-left"
        >
          <span className="size-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-2xl">
              folder_open
            </span>
          </span>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Original files</p>
            <p className="text-sm text-slate-500 dark:text-gray-400">
              Each photo as a separate file
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => {
            onSelectZip();
            onClose();
          }}
          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors text-left"
        >
          <span className="size-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-2xl">
              folder_zip
            </span>
          </span>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">ZIP file</p>
            <p className="text-sm text-slate-500 dark:text-gray-400">
              All photos in one ZIP file
            </p>
          </div>
        </button>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);
