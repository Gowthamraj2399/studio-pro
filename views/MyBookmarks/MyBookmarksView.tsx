import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getCloudinaryInstanceOrNull } from "../../lib/cloudinary";
import { getMyBookmarkedSections, myBookmarksQueryKey } from "../../lib/bookmarks";
import {
  removePhotoFromAlbum,
  submitAlbum,
  userAlbumQueryKey,
  albumPhotoIdsQueryKey,
} from "../../lib/user-albums";
import { PhotoImage } from "../UploadPhotos/components/PhotoImage";
import { PhotoPreviewModal } from "../../components/PhotoPreviewModal";
import type { Photo } from "../../types";
import type { BookmarkedSection } from "../../lib/bookmarks";

function SectionPhotos({
  section,
  cld,
  onPreview,
  onSubmit,
  isSubmitting,
}: {
  section: BookmarkedSection;
  cld: ReturnType<typeof getCloudinaryInstanceOrNull>;
  onPreview: (photo: Photo, section: BookmarkedSection) => void;
  onSubmit: (albumId: string) => void;
  isSubmitting: boolean;
}) {
  const navigate = useNavigate();
  const isDraft = section.album.status === "draft";

  return (
    <section className="mb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {section.eventTitle}
        </h2>
        <div className="flex items-center gap-3">
          {section.album.status === "submitted" && (
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-green-500/20 text-green-700 dark:text-green-300">
              Submitted
            </span>
          )}
          {isDraft && (
            <button
              type="button"
              onClick={() => onSubmit(section.album.id)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin text-lg">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-lg">send</span>
              )}
              Submit selection
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate(`/event/${section.token}`)}
            className="text-sm font-semibold text-primary hover:underline"
          >
            View event
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {section.photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => onPreview(photo, section)}
            className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 hover:ring-2 hover:ring-primary transition-all text-left"
          >
            <PhotoImage
              photo={photo}
              cld={cld}
              thumbSize={400}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-white text-xs font-medium truncate">
                {photo.filename}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export const MyBookmarksView: React.FC = () => {
  const queryClient = useQueryClient();
  const [previewState, setPreviewState] = useState<{
    photo: Photo;
    section: BookmarkedSection;
  } | null>(null);
  const [togglingPhotoId, setTogglingPhotoId] = useState<string | null>(null);
  const cld = useMemo(() => getCloudinaryInstanceOrNull(), []);

  const { data: sections = [], isLoading, error } = useQuery({
    queryKey: myBookmarksQueryKey,
    queryFn: getMyBookmarkedSections,
  });

  const [submittingAlbumId, setSubmittingAlbumId] = useState<string | null>(null);

  const removeFromAlbumMutation = useMutation({
    mutationFn: ({
      albumId,
      photoId,
    }: {
      albumId: string;
      photoId: string;
    }) => removePhotoFromAlbum(albumId, photoId),
    onMutate: ({ photoId }) => setTogglingPhotoId(photoId),
    onSettled: () => setTogglingPhotoId(null),
    onSuccess: (_data, { photoId, previewState: state }) => {
      queryClient.invalidateQueries({ queryKey: myBookmarksQueryKey });
      if (state?.section) {
        queryClient.invalidateQueries({
          queryKey: userAlbumQueryKey(state.section.projectId),
        });
        queryClient.invalidateQueries({
          queryKey: albumPhotoIdsQueryKey(state.section.album.id),
        });
      }
      if (!state) {
        setPreviewState(null);
        return;
      }
      const remainingPhotos = state.section.photos.filter((p) => p.id !== photoId);
      if (remainingPhotos.length === 0) {
        setPreviewState(null);
        return;
      }
      const currentIndex = state.section.photos.findIndex((p) => p.id === photoId);
      const nextIndex = Math.min(currentIndex, remainingPhotos.length - 1);
      const newPhoto = remainingPhotos[nextIndex];
      setPreviewState({
        photo: newPhoto,
        section: { ...state.section, photos: remainingPhotos },
      });
    },
  });

  const submitAlbumMutation = useMutation({
    mutationFn: (albumId: string) => submitAlbum(albumId),
    onMutate: (albumId) => setSubmittingAlbumId(albumId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myBookmarksQueryKey });
    },
    onSettled: (_, __, albumId) => setSubmittingAlbumId((id) => (id === albumId ? null : id)),
  });

  const goToPrev = useCallback(() => {
    if (!previewState) return;
    const idx = previewState.section.photos.findIndex(
      (p) => p.id === previewState.photo.id
    );
    if (idx > 0) {
      setPreviewState({
        photo: previewState.section.photos[idx - 1],
        section: previewState.section,
      });
    }
  }, [previewState]);

  const goToNext = useCallback(() => {
    if (!previewState) return;
    const idx = previewState.section.photos.findIndex(
      (p) => p.id === previewState.photo.id
    );
    if (idx >= 0 && idx < previewState.section.photos.length - 1) {
      setPreviewState({
        photo: previewState.section.photos[idx + 1],
        section: previewState.section,
      });
    }
  }, [previewState]);

  const totalPhotos = sections.reduce((sum, s) => sum + s.photos.length, 0);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-16 flex items-center justify-center gap-2 text-slate-500">
        <span className="material-symbols-outlined animate-spin text-4xl">
          progress_activity
        </span>
        <span>Loading your favorites…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">
          {error instanceof Error ? error.message : "Failed to load favorites."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight mb-2">
          My favorite photos
        </h1>
        <p className="text-slate-500 font-medium">
          {totalPhotos === 0
            ? "No favorite photos yet. Open an event and add photos to your favorites."
            : `${totalPhotos} photo${totalPhotos !== 1 ? "s" : ""} across ${sections.length} event${sections.length !== 1 ? "s" : ""}.`}
        </p>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-20 text-slate-500 dark:text-gray-400">
          <span className="material-symbols-outlined text-5xl mb-4 block">
            favorite_border
          </span>
          <p className="font-medium">No favorites yet</p>
          <p className="text-sm mt-1">
            Go to My events, open an event, and add photos to your favorites.
          </p>
        </div>
      ) : (
        sections.map((section) => (
          <SectionPhotos
            key={section.album.id}
            section={section}
            cld={cld}
            onPreview={(photo, sec) => setPreviewState({ photo, section: sec })}
            onSubmit={(albumId) => submitAlbumMutation.mutate(albumId)}
            isSubmitting={submittingAlbumId === section.album.id}
          />
        ))
      )}

      {previewState && (
        <PhotoPreviewModal
          photo={previewState.photo}
          photos={previewState.section.photos}
          cld={cld}
          onClose={() => setPreviewState(null)}
          onPrev={goToPrev}
          onNext={goToNext}
          isInAlbum={true}
          isToggling={togglingPhotoId === previewState.photo.id}
          isAlbumLocked={previewState.section.album.status === "submitted"}
          isSubmitting={removeFromAlbumMutation.isPending}
          onToggleBookmark={(photo) =>
            removeFromAlbumMutation.mutate({
              albumId: previewState.section.album.id,
              photoId: photo.id,
              previewState,
            })
          }
        />
      )}
    </div>
  );
};
