import React, { memo } from "react";
import type { UploadingItem } from "../types";

interface UploadProgressCardProps {
  uploading: UploadingItem[];
}

const UploadProgressCardInner: React.FC<UploadProgressCardProps> = ({
  uploading,
}) => {
  if (uploading.length === 0) return null;
  const avg =
    uploading.reduce((a, u) => a + u.progress, 0) / (uploading.length || 1);
  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm mb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary animate-spin">
            sync
          </span>
          <p className="text-lg font-bold">
            Uploading {uploading.length} photo(s)...
          </p>
        </div>
        <div className="text-primary font-black uppercase tracking-widest text-sm">
          {Math.round(avg)}% Complete
        </div>
      </div>
      <div className="h-2.5 w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 rounded-full"
          style={{ width: `${avg}%` }}
        />
      </div>
    </div>
  );
};

export const UploadProgressCard = memo(UploadProgressCardInner);
