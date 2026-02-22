import React, { memo } from "react";
import type { UploadingItem } from "../types";

interface UploadProgressCardProps {
  uploading: UploadingItem[];
  /** Total files in this batch (for "X of Y" and overall 0–100%). */
  totalBatchSize: number;
  /** Overall batch progress 0–100 (all files combined). */
  overallPercent: number;
}

const UploadProgressCardInner: React.FC<UploadProgressCardProps> = ({
  uploading,
  totalBatchSize,
  overallPercent,
}) => {
  if (uploading.length === 0) return null;
  const total = totalBatchSize || uploading.length;
  const completed = total - uploading.length;
  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm mb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary animate-spin">
            sync
          </span>
          <p className="text-lg font-bold">
            Uploading {total} photo{total !== 1 ? "s" : ""}…{" "}
            {total > 1 && (
              <span className="text-slate-500 font-normal text-base">
                ({completed} of {total} complete)
              </span>
            )}
          </p>
        </div>
        <div className="text-primary font-black uppercase tracking-widest text-sm">
          {Math.round(overallPercent)}% Complete
        </div>
      </div>
      <div className="h-2.5 w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 rounded-full"
          style={{ width: `${Math.min(100, overallPercent)}%` }}
        />
      </div>
    </div>
  );
};

export const UploadProgressCard = memo(UploadProgressCardInner);
