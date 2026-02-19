import React, { useState, useCallback, useMemo } from "react";
import { Link, useParams, useNavigate, Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCloudinaryInstanceOrNull } from "../../lib/cloudinary";
import {
  fetchSubmittedAlbumWithPhotos,
  submittedAlbumWithPhotosQueryKey,
  creatorSubmissionsQueryKey,
  reopenSubmittedAlbum,
} from "../../lib/creator-submissions";
import { PhotoImage } from "../UploadPhotos/components/PhotoImage";
import { PhotoPreviewModal } from "../../components/PhotoPreviewModal";
import type { Photo } from "../../types";
import type { Cloudinary } from "@cloudinary/url-gen";

function formatSubmittedAt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ReadOnlyPhotoCardProps {
  photo: Photo;
  cld: Cloudinary | null;
  onPreview: (photo: Photo) => void;
}

const ReadOnlyPhotoCard: React.FC<ReadOnlyPhotoCardProps> = ({
  photo,
  cld,
  onPreview,
}) => (
  <button
    type="button"
    className="relative aspect-square rounded-2xl overflow-hidden group bg-slate-100 dark:bg-gray-800 border-2 border-slate-100 dark:border-gray-800 hover:border-primary/50 transition-colors text-left w-full"
    onClick={() => onPreview(photo)}
  >
    <PhotoImage
      photo={photo}
      cld={cld}
      thumbSize={400}
      className="w-full h-full object-cover transition-all group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
      <span className="material-symbols-outlined text-white text-4xl">
        visibility
      </span>
    </div>
  </button>
);

const SubmittedAlbumView: React.FC = () => {
  const { projectId, albumId } = useParams<{ projectId: string; albumId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: submittedAlbumWithPhotosQueryKey(albumId ?? ""),
    queryFn: () => fetchSubmittedAlbumWithPhotos(albumId!),
    enabled: Boolean(albumId),
  });

  const reopenMutation = useMutation({
    mutationFn: () => reopenSubmittedAlbum(albumId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creatorSubmissionsQueryKey });
      navigate("/submissions", { replace: true });
    },
  });

  const cld = useMemo(() => getCloudinaryInstanceOrNull(), []);

  const photos = data?.photos ?? [];
  const currentPreviewIndex =
    previewPhoto && photos.length > 0
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

  if (!albumId) {
    return <Navigate to="/submissions" replace />;
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-16 flex items-center justify-center gap-2 text-slate-500">
        <span className="material-symbols-outlined animate-spin text-4xl">
          progress_activity
        </span>
        <span>Loading album…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">
          {error instanceof Error ? error.message : "Failed to load album."}
        </p>
        <Link to="/submissions" className="text-primary font-medium mt-4 inline-block">
          Back to Submissions
        </Link>
      </div>
    );
  }

  if (!data) {
    return <Navigate to="/submissions" replace />;
  }

  const { project, album } = data;

  return (
    <div className="max-w-6xl mx-auto pb-24 relative">
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link to="/submissions" className="hover:text-primary transition-colors">
          Submissions
        </Link>
        <span className="material-symbols-outlined text-lg">chevron_right</span>
        <Link
          to={`/project/${projectId}/submissions`}
          className="hover:text-primary transition-colors"
        >
          {project.project_name ?? "Project"}
        </Link>
        <span className="material-symbols-outlined text-lg">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">
          Submitted {formatSubmittedAt(album.submitted_at)}
        </span>
      </nav>

      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            {project.project_name ?? "Submitted album"}
          </h1>
          <p className="text-slate-500 font-medium">
            Submitted {formatSubmittedAt(album.submitted_at)} · {photos.length} photo
            {photos.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => reopenMutation.mutate()}
          disabled={reopenMutation.isPending}
          className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-amber-200 dark:border-amber-800"
          title="Reopen so client can change selection and resubmit"
        >
          {reopenMutation.isPending ? (
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined">lock_open</span>
          )}
          Reopen for resubmission
        </button>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <span className="material-symbols-outlined text-5xl mb-4 block">
            photo_library
          </span>
          <p className="font-medium">No photos in this submission.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {photos.map((photo) => (
            <ReadOnlyPhotoCard
              key={photo.id}
              photo={photo}
              cld={cld}
              onPreview={setPreviewPhoto}
            />
          ))}
        </div>
      )}

      {previewPhoto && (
        <PhotoPreviewModal
          photo={previewPhoto}
          photos={photos}
          cld={cld}
          onClose={() => setPreviewPhoto(null)}
          onPrev={goToPrev}
          onNext={goToNext}
          showBookmark={false}
          isInAlbum={false}
          isToggling={false}
          isAlbumLocked={true}
          isSubmitting={false}
          onToggleBookmark={() => {}}
        />
      )}
    </div>
  );
};

export default SubmittedAlbumView;
