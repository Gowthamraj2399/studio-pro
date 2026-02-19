import React, { memo } from "react";
import type { LayoutMode } from "../types";

interface GridHeaderProps {
  totalCount: number;
  hasSelectablePhotos: boolean;
  layout: LayoutMode;
  onLayoutChange: (layout: LayoutMode) => void;
  onSelectAll: () => void;
}

const GridHeaderInner: React.FC<GridHeaderProps> = ({
  totalCount,
  hasSelectablePhotos,
  layout,
  onLayoutChange,
  onSelectAll,
}) => (
  <div className="flex items-center justify-between mb-8">
    <h2 className="text-2xl font-black flex items-center gap-3">
      Recent Uploads
      <span className="bg-slate-100 dark:bg-gray-800 text-slate-900 dark:text-white px-2.5 py-1 rounded-lg text-sm font-bold">
        {totalCount}
      </span>
    </h2>
    <div className="flex items-center gap-2">
      {hasSelectablePhotos && (
        <button
          type="button"
          onClick={onSelectAll}
          className="p-2 rounded-lg border border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800 text-sm font-bold"
        >
          Select all
        </button>
      )}
      <button
        type="button"
        onClick={() => onLayoutChange("grid")}
        className={`p-2 rounded-lg border transition-colors ${
          layout === "grid"
            ? "bg-primary text-white border-primary"
            : "border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800"
        }`}
        aria-label="Grid view"
      >
        <span className="material-symbols-outlined">grid_view</span>
      </button>
      <button
        type="button"
        onClick={() => onLayoutChange("list")}
        className={`p-2 rounded-lg border transition-colors ${
          layout === "list"
            ? "bg-primary text-white border-primary"
            : "border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800"
        }`}
        aria-label="List view"
      >
        <span className="material-symbols-outlined">view_list</span>
      </button>
    </div>
  </div>
);

export const GridHeader = memo(GridHeaderInner);
