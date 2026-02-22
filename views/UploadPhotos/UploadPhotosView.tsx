import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AIAssistant from "../../components/AIAssistant";
import { PhotoPreviewModal } from "../../components/PhotoPreviewModal";
import { DownloadOptionsModal } from "../Submissions/DownloadOptionsModal";
import { buildPhotosZip, suggestedZipFilename } from "../Submissions/utils";
import { useUploadPhotos } from "./hooks";
import { getOrCreateShareToken, getEventUrl } from "../../lib/share-links";
import {
  UploadZone,
  UploadProgressCard,
  FailedUploadsCard,
  GridHeader,
  SelectionBar,
  VirtualPhotoGrid,
  VirtualPhotoList,
  DeletePhotoModal,
  BulkDeleteModal,
  DeletingToast,
} from "./components";

export const UploadPhotosView: React.FC = () => {
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const {
    projectId,
    isValidProject,
    project,
    projectLoading,
    photosError,
    photos,
    uploading,
    uploadError,
    failedUploads,
    totalBatchSize,
    overallUploadPercent,
    retryFailedUploads,
    dismissFailedUploads,
    previewPhoto,
    setPreviewPhoto,
    photoToDelete,
    setPhotoToDelete,
    layout,
    setLayout,
    selectedIds,
    selectedPhotos,
    confirmBulkDelete,
    setConfirmBulkDelete,
    deletingMessage,
    fileInputRef,
    displayPhotos,
    totalCount,
    hasSelectablePhotos,
    cld,
    deleteMutation,
    onFileChange,
    onDrop,
    onDragOver,
    confirmDelete,
    handleDownload,
    toggleSelect,
    selectAll,
    clearSelection,
    handleBulkDelete,
    handleBulkDownload,
  } = useUploadPhotos();

  const handleDownloadZip = useCallback(async () => {
    if (selectedPhotos.length === 0) return;
    setIsDownloadingZip(true);
    try {
      const zipFilename = suggestedZipFilename(
        project?.client ?? project?.title ?? "gallery",
        null
      );
      const { blob } = await buildPhotosZip(selectedPhotos);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = zipFilename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloadingZip(false);
    }
  }, [selectedPhotos, project?.client, project?.title]);

  const handleShareEventLink = useCallback(async () => {
    if (!isValidProject) return;
    try {
      const token = await getOrCreateShareToken(projectId);
      const url = getEventUrl(token);
      await navigator.clipboard.writeText(url);
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 2000);
    } catch (_e) {
      setShareLinkCopied(false);
    }
  }, [isValidProject, projectId]);

  if (!isValidProject) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center">
        <p className="text-slate-500 font-medium">Invalid project.</p>
      </div>
    );
  }

  if (projectLoading || (project === null && !photosError)) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center">
        <p className="text-slate-500 font-medium">Loading project…</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Upload Client Photos
          </h1>
          <p className="text-slate-500 font-medium">
            Client:{" "}
            <span className="text-primary font-bold">
              {project?.client ?? project?.title ?? "—"}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/project/${projectId}/settings`}
            className="h-10 px-4 bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
            Settings
          </Link>
          <button
            type="button"
            onClick={handleShareEventLink}
            className="h-10 px-4 bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">link</span>
            {shareLinkCopied ? "Link copied!" : "Share event link"}
          </button>
        </div>
      </div>

      <UploadZone
        fileInputRef={fileInputRef}
        onFileChange={onFileChange}
        onDrop={onDrop}
        onDragOver={onDragOver}
        disabled={!isValidProject}
      />

      {uploadError && failedUploads.length === 0 && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium">
          {uploadError}
        </div>
      )}

      <FailedUploadsCard
        failedUploads={failedUploads}
        onRetry={async () => {
          setIsRetrying(true);
          try {
            await retryFailedUploads();
          } finally {
            setIsRetrying(false);
          }
        }}
        onDismiss={dismissFailedUploads}
        isRetrying={isRetrying}
      />

      <UploadProgressCard
        uploading={uploading}
        totalBatchSize={totalBatchSize}
        overallPercent={overallUploadPercent}
      />

      <GridHeader
        totalCount={totalCount}
        hasSelectablePhotos={hasSelectablePhotos}
        layout={layout}
        onLayoutChange={setLayout}
        onSelectAll={selectAll}
      />

      <SelectionBar
        selectedCount={selectedIds.size}
        onBulkDownload={() => setShowDownloadModal(true)}
        onBulkDelete={() => setConfirmBulkDelete(true)}
        onClearSelection={clearSelection}
        isDownloadDisabled={isDownloadingZip}
        downloadButtonLabel={isDownloadingZip ? "Preparing ZIP…" : undefined}
      />

      {showDownloadModal && selectedIds.size > 0 && (
        <DownloadOptionsModal
          photoCount={selectedIds.size}
          onClose={() => setShowDownloadModal(false)}
          onSelectOriginal={() => {
            setShowDownloadModal(false);
            handleBulkDownload();
          }}
          onSelectZip={() => {
            setShowDownloadModal(false);
            handleDownloadZip();
          }}
        />
      )}

      {displayPhotos.length === 0 ? (
        <div className="py-20 text-center text-slate-500 font-medium">
          No photos yet. Drop files above or click to upload.
        </div>
      ) : layout === "grid" ? (
        <VirtualPhotoGrid
          photos={displayPhotos}
          cld={cld}
          selectedIds={selectedIds}
          isDeleting={deleteMutation.isPending}
          onToggleSelect={toggleSelect}
          onPreview={setPreviewPhoto}
          onDownload={handleDownload}
          onDelete={setPhotoToDelete}
        />
      ) : (
        <VirtualPhotoList
          photos={displayPhotos}
          cld={cld}
          selectedIds={selectedIds}
          isDeleting={deleteMutation.isPending}
          onToggleSelect={toggleSelect}
          onPreview={setPreviewPhoto}
          onDownload={handleDownload}
          onDelete={setPhotoToDelete}
        />
      )}

      {previewPhoto && (
        <PhotoPreviewModal
          photo={previewPhoto}
          photos={displayPhotos}
          cld={cld}
          onClose={() => setPreviewPhoto(null)}
          onPrev={() => {
            const idx = displayPhotos.findIndex((p) => p.id === previewPhoto.id);
            if (idx > 0) setPreviewPhoto(displayPhotos[idx - 1]);
          }}
          onNext={() => {
            const idx = displayPhotos.findIndex((p) => p.id === previewPhoto.id);
            if (idx >= 0 && idx < displayPhotos.length - 1)
              setPreviewPhoto(displayPhotos[idx + 1]);
          }}
          showBookmark={false}
          isInAlbum={false}
          isToggling={false}
          isAlbumLocked={true}
          isSubmitting={false}
          onToggleBookmark={() => {}}
        />
      )}

      {photoToDelete && (
        <DeletePhotoModal
          photo={photoToDelete}
          onConfirm={confirmDelete}
          onCancel={() => setPhotoToDelete(null)}
        />
      )}

      {confirmBulkDelete && (
        <BulkDeleteModal
          selectedCount={selectedIds.size}
          onConfirm={handleBulkDelete}
          onCancel={() => setConfirmBulkDelete(false)}
        />
      )}

      {deletingMessage && <DeletingToast message={deletingMessage} />}

      <footer className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 p-6 z-40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <span className="hidden sm:block text-xs font-bold text-slate-400 uppercase tracking-widest">
              {photos.length} image{photos.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
