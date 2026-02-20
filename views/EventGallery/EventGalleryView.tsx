import React, { useState, useCallback } from "react";
import { useEventGallery } from "./hooks";
import { VirtualEventPhotoGrid, AlbumBar, EventPreviewModal } from "./components";

export const EventGalleryView: React.FC = () => {
  const [previewPhoto, setPreviewPhoto] = useState<import("../../types").Photo | null>(null);

  const {
    isValidToken,
    project,
    photos,
    eventLoading,
    eventError,
    album,
    albumPhotoIds,
    isAlbumFull,
    isInAlbum,
    isTogglingPhoto,
    toggleAlbumPhoto,
    submitAlbumMutation,
    cld,
  } = useEventGallery();

  const currentPreviewIndex =
    previewPhoto !== null && photos.length > 0
      ? photos.findIndex((p) => p.id === previewPhoto.id)
      : -1;
  const goToPrev = useCallback(() => {
    if (currentPreviewIndex > 0) {
      setPreviewPhoto(photos[currentPreviewIndex - 1]);
    }
  }, [currentPreviewIndex, photos]);
  const goToNext = useCallback(() => {
    if (currentPreviewIndex >= 0 && currentPreviewIndex < photos.length - 1) {
      setPreviewPhoto(photos[currentPreviewIndex + 1]);
    }
  }, [currentPreviewIndex, photos.length, photos]);

  if (!isValidToken) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center">
        <p className="text-slate-500 font-medium">Invalid event link.</p>
      </div>
    );
  }

  if (eventLoading) {
    return (
      <div className="max-w-6xl mx-auto py-16 flex items-center justify-center gap-2 text-slate-500">
        <span className="material-symbols-outlined animate-spin text-4xl">
          progress_activity
        </span>
        <span>Loading event…</span>
      </div>
    );
  }

  if (eventError) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">
          {eventError instanceof Error ? eventError.message : "Failed to load event."}
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center">
        <p className="text-slate-500 font-medium">Event not found.</p>
      </div>
    );
  }

  const albumPhotoCount = album?.status === "submitted" ? 0 : albumPhotoIds.length;

  return (
    <div className="max-w-6xl mx-auto pb-24 relative">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-2">
          {project.project_name ?? "Event photos"}
        </h1>
        <p className="text-slate-500 font-medium">
          {project.client_name ?? "—"} · Add photos to your album and submit when ready.
        </p>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <span className="material-symbols-outlined text-5xl mb-4 block">
            photo_library
          </span>
          <p className="font-medium">No photos in this event yet.</p>
        </div>
      ) : (
        <VirtualEventPhotoGrid
          photos={photos}
          cld={cld}
          isInAlbum={isInAlbum}
          isTogglingPhoto={isTogglingPhoto}
          isSubmitting={submitAlbumMutation.isPending}
          isAlbumLocked={album?.status === "submitted"}
          isAlbumFull={isAlbumFull}
          onToggleAlbum={toggleAlbumPhoto}
          onPreview={setPreviewPhoto}
        />
      )}

      {previewPhoto && (
        <EventPreviewModal
          photo={previewPhoto}
          photos={photos}
          cld={cld}
          onClose={() => setPreviewPhoto(null)}
          onPrev={goToPrev}
          onNext={goToNext}
          isInAlbum={isInAlbum(previewPhoto.id)}
          isToggling={isTogglingPhoto(previewPhoto.id)}
          isAlbumLocked={album?.status === "submitted"}
          isAlbumFull={isAlbumFull}
          isSubmitting={submitAlbumMutation.isPending}
          onToggleBookmark={toggleAlbumPhoto}
        />
      )}

      <AlbumBar
        photoCount={albumPhotoCount}
        maxSize={project?.album_size ?? undefined}
        isSubmitted={album?.status === "submitted"}
        isSubmitting={submitAlbumMutation.isPending}
        onSubmit={() => album && submitAlbumMutation.mutate()}
      />
    </div>
  );
};
