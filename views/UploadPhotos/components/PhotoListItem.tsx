import React, { memo } from "react";
import { PhotoImage } from "./PhotoImage";
import type { Cloudinary } from "@cloudinary/url-gen";
import type { DisplayPhoto } from "../types";

interface PhotoListItemProps {
  photo: DisplayPhoto;
  cld: Cloudinary | null;
  isSelected: boolean;
  isDeleting: boolean;
  onToggleSelect: (id: string) => void;
  onPreview: (photo: DisplayPhoto) => void;
  onDownload: (photo: DisplayPhoto) => void;
  onDelete: (photo: DisplayPhoto) => void;
}

const PhotoListItemInner: React.FC<PhotoListItemProps> = ({
  photo,
  cld,
  isSelected,
  isDeleting,
  onToggleSelect,
  onPreview,
  onDownload,
  onDelete,
}) => (
  <div
    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors group ${
      isSelected
        ? "border-primary bg-primary/5 dark:bg-primary/10"
        : "border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:bg-slate-50 dark:hover:bg-gray-800/50"
    }`}
  >
    {photo.status !== "uploading" ? (
      <label className="shrink-0 flex items-center justify-center cursor-pointer">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(photo.id)}
          className="size-5 rounded text-primary focus:ring-primary border-slate-300"
        />
      </label>
    ) : (
      <div className="shrink-0 size-5" aria-hidden />
    )}
    <div className="relative size-20 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-800">
      {photo.status === "uploading" ? (
        <>
          <div className="absolute inset-0 bg-slate-200 dark:bg-gray-700" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full px-2">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${photo.progress ?? 0}%` }}
                />
              </div>
            </div>
          </div>
          <div className="absolute top-1 right-1 size-5 bg-primary rounded-full flex items-center justify-center animate-spin">
            <span className="material-symbols-outlined text-xs text-white">
              progress_activity
            </span>
          </div>
        </>
      ) : (
        <PhotoImage
          photo={photo}
          cld={cld}
          thumbSize={80}
          className="w-full h-full object-cover"
        />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p
        className="font-medium text-slate-900 dark:text-white truncate"
        title={photo.filename}
      >
        {photo.filename}
      </p>
      {photo.status === "uploading" && (
        <p className="text-xs text-slate-500 dark:text-gray-400">
          {photo.progress ?? 0}%
        </p>
      )}
    </div>
    {photo.status !== "uploading" && (
      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          className="p-2 rounded-lg border border-slate-200 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-gray-800"
          aria-label="View"
          onClick={() => onPreview(photo)}
        >
          <span className="material-symbols-outlined">visibility</span>
        </button>
        <button
          type="button"
          className="p-2 rounded-lg border border-slate-200 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-gray-800"
          aria-label="Download"
          onClick={() => onDownload(photo)}
        >
          <span className="material-symbols-outlined">download</span>
        </button>
        <button
          type="button"
          className="p-2 rounded-lg border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          aria-label="Delete"
          onClick={() => onDelete(photo)}
          disabled={isDeleting}
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>
    )}
  </div>
);

export const PhotoListItem = memo(PhotoListItemInner);
