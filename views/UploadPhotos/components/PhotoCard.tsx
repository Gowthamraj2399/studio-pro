import React, { memo } from "react";
import { PhotoImage } from "./PhotoImage";
import type { Cloudinary } from "@cloudinary/url-gen";
import type { DisplayPhoto } from "../types";

interface PhotoCardProps {
  photo: DisplayPhoto;
  cld: Cloudinary | null;
  isSelected: boolean;
  isDeleting: boolean;
  onToggleSelect: (id: string) => void;
  onPreview: (photo: DisplayPhoto) => void;
  onDownload: (photo: DisplayPhoto) => void;
  onDelete: (photo: DisplayPhoto) => void;
}

const PhotoCardInner: React.FC<PhotoCardProps> = ({
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
    className={`relative aspect-square rounded-2xl overflow-hidden group bg-slate-100 dark:bg-gray-800 border-2 transition-colors contain-[layout_paint] ${
      isSelected
        ? "border-primary ring-2 ring-primary/30"
        : "border-slate-100 dark:border-gray-800"
    }`}
  >
    {photo.status !== "uploading" && (
      <label className="absolute top-3 left-3 z-10 flex items-center justify-center size-6 rounded-md bg-white/90 dark:bg-gray-800/90 shadow cursor-pointer">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(photo.id)}
          className="size-4 rounded text-primary focus:ring-primary border-slate-300"
        />
      </label>
    )}
    {photo.status === "uploading" ? (
      <>
        <div className="absolute inset-0 bg-slate-200 dark:bg-gray-700" />
        <div className="absolute inset-0 p-4 flex flex-col items-center justify-center">
          <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${photo.progress ?? 0}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-white drop-shadow-md">
            {photo.progress ?? 0}%
          </span>
          <div className="absolute top-3 right-3 size-6 bg-primary text-white rounded-full flex items-center justify-center animate-spin">
            <span className="material-symbols-outlined text-sm">
              progress_activity
            </span>
          </div>
        </div>
      </>
    ) : (
      <>
        <PhotoImage
          photo={photo}
          cld={cld}
          thumbSize={400}
          className="w-full h-full object-cover transition-all group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            type="button"
            className="size-9 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
            aria-label="View"
            onClick={() => onPreview(photo)}
          >
            <span className="material-symbols-outlined text-xl">visibility</span>
          </button>
          <button
            type="button"
            className="size-9 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
            aria-label="Download"
            onClick={() => onDownload(photo)}
          >
            <span className="material-symbols-outlined text-xl">download</span>
          </button>
          <button
            type="button"
            className="size-9 rounded-full bg-white text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
            aria-label="Delete"
            onClick={() => onDelete(photo)}
            disabled={isDeleting}
          >
            <span className="material-symbols-outlined text-xl">delete</span>
          </button>
        </div>
        <div className="absolute top-3 right-3 size-6 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-sm font-bold">
            check
          </span>
        </div>
      </>
    )}
  </div>
);

export const PhotoCard = memo(PhotoCardInner);
