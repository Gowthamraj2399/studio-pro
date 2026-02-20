import React, { memo, useCallback, useEffect } from "react";
import { AdvancedImage } from "@cloudinary/react";
import { PhotoImage } from "../views/UploadPhotos/components/PhotoImage";
import type { Cloudinary } from "@cloudinary/url-gen";
import type { Photo } from "../types";

export interface PhotoPreviewModalProps {
  photo: Photo;
  photos: Photo[];
  cld: Cloudinary | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  /** When false, the favorite (add/remove from favorites) button is hidden. Default true. */
  showBookmark?: boolean;
  isInAlbum: boolean;
  isToggling: boolean;
  isAlbumLocked: boolean;
  /** When true and not in album, add-to-favorites is disabled (album at capacity). */
  isAlbumFull?: boolean;
  isSubmitting: boolean;
  onToggleBookmark: (photo: Photo) => void;
}

const PhotoPreviewModalInner: React.FC<PhotoPreviewModalProps> = ({
  photo,
  photos,
  cld,
  onClose,
  onPrev,
  onNext,
  showBookmark = true,
  isInAlbum,
  isToggling,
  isAlbumLocked,
  isAlbumFull = false,
  isSubmitting,
  onToggleBookmark,
}) => {
  const currentIndex = photos.findIndex((p) => p.id === photo.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < photos.length - 1;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") hasPrev && onPrev();
      if (e.key === "ArrowRight") hasNext && onNext();
    },
    [onClose, onPrev, onNext, hasPrev, hasNext]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <div
        className="absolute top-4 right-4 z-10 flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {showBookmark && (
          <button
            type="button"
            className={`size-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              isInAlbum
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
            aria-label={isInAlbum ? "Remove from favorites" : "Add to favorites"}
            onClick={() => onToggleBookmark(photo)}
            disabled={isSubmitting || isAlbumLocked || (isAlbumFull && !isInAlbum)}
          >
            {isToggling ? (
              <span className="material-symbols-outlined animate-spin">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined fill-current">
                {isInAlbum ? "favorite" : "favorite_border"}
              </span>
            )}
          </button>
        )}
        <button
          type="button"
          className="size-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          onClick={onClose}
          aria-label="Close preview"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {hasPrev && (
        <button
          type="button"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 size-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Previous photo"
        >
          <span className="material-symbols-outlined text-3xl">chevron_left</span>
        </button>
      )}

      {hasNext && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 size-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Next photo"
        >
          <span className="material-symbols-outlined text-3xl">chevron_right</span>
        </button>
      )}

      <div
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {photo.url ? (
          <img
            src={photo.url}
            alt={photo.filename}
            className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg"
          />
        ) : cld && photo.public_id ? (
          <AdvancedImage
            cldImg={cld.image(photo.public_id)}
            className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg"
          />
        ) : (
          <PhotoImage photo={photo} cld={cld} className="max-w-full max-h-[90vh]" />
        )}
      </div>

      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium truncate max-w-[90vw]">
        {photo.filename}
        {photos.length > 0 && (
          <span className="ml-2 text-white/60">
            ({currentIndex + 1} / {photos.length})
          </span>
        )}
      </p>
    </div>
  );
};

export const PhotoPreviewModal = memo(PhotoPreviewModalInner);
