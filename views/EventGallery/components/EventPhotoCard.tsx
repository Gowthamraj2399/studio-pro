import React, { memo } from "react";
import { PhotoImage } from "../../UploadPhotos/components/PhotoImage";
import type { Cloudinary } from "@cloudinary/url-gen";
import type { Photo } from "../../../types";

interface EventPhotoCardProps {
  photo: Photo;
  cld: Cloudinary | null;
  isInAlbum: boolean;
  isToggling: boolean;
  isSubmitting: boolean;
  isAlbumLocked: boolean;
  isAlbumFull: boolean;
  onToggleAlbum: (photo: Photo) => void;
  onPreview: (photo: Photo) => void;
}

const EventPhotoCardInner: React.FC<EventPhotoCardProps> = ({
  photo,
  cld,
  isInAlbum,
  isToggling,
  isSubmitting,
  isAlbumLocked,
  isAlbumFull,
  onToggleAlbum,
  onPreview,
}) => (
  <div className="relative aspect-square rounded-2xl overflow-hidden group bg-slate-100 dark:bg-gray-800 border-2 border-slate-100 dark:border-gray-800 hover:border-primary/50 transition-colors contain-[layout_paint]">
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
        className="size-9 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={isInAlbum ? "Remove from favorites" : "Add to favorites"}
        title={isAlbumFull && !isInAlbum ? "Album full" : undefined}
        onClick={() => onToggleAlbum(photo)}
        disabled={isSubmitting || isAlbumLocked || (isAlbumFull && !isInAlbum)}
      >
        {isToggling ? (
          <span className="material-symbols-outlined text-xl animate-spin">
            progress_activity
          </span>
        ) : (
          <span className="material-symbols-outlined text-xl">
            {isInAlbum ? "favorite" : "favorite_border"}
          </span>
        )}
      </button>
    </div>
    {isInAlbum && (
      <div className="absolute top-3 right-3 size-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
        <span className="material-symbols-outlined text-lg fill-current">favorite</span>
      </div>
    )}
  </div>
);

export const EventPhotoCard = memo(EventPhotoCardInner);
