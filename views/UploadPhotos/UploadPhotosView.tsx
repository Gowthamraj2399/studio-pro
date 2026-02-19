import React, { useState, useCallback } from "react";
import AIAssistant from "../../components/AIAssistant";
import { useUploadPhotos } from "./hooks";
import { getOrCreateShareToken, getEventUrl } from "../../lib/share-links";
import {
  UploadZone,
  UploadProgressCard,
  GridHeader,
  SelectionBar,
  PhotoCard,
  PhotoListItem,
  PreviewModal,
  DeletePhotoModal,
  BulkDeleteModal,
  DeletingToast,
} from "./components";

export const UploadPhotosView: React.FC = () => {
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const {
    projectId,
    isValidProject,
    project,
    projectLoading,
    photosError,
    photos,
    uploading,
    uploadError,
    previewPhoto,
    setPreviewPhoto,
    photoToDelete,
    setPhotoToDelete,
    layout,
    setLayout,
    selectedIds,
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

      {uploadError && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium">
          {uploadError}
        </div>
      )}

      <UploadProgressCard uploading={uploading} />

      <GridHeader
        totalCount={totalCount}
        hasSelectablePhotos={hasSelectablePhotos}
        layout={layout}
        onLayoutChange={setLayout}
        onSelectAll={selectAll}
      />

      <SelectionBar
        selectedCount={selectedIds.size}
        onBulkDownload={handleBulkDownload}
        onBulkDelete={() => setConfirmBulkDelete(true)}
        onClearSelection={clearSelection}
      />

      {layout === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {displayPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              cld={cld}
              isSelected={selectedIds.has(photo.id)}
              isDeleting={deleteMutation.isPending}
              onToggleSelect={toggleSelect}
              onPreview={setPreviewPhoto}
              onDownload={handleDownload}
              onDelete={setPhotoToDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayPhotos.map((photo) => (
            <PhotoListItem
              key={photo.id}
              photo={photo}
              cld={cld}
              isSelected={selectedIds.has(photo.id)}
              isDeleting={deleteMutation.isPending}
              onToggleSelect={toggleSelect}
              onPreview={setPreviewPhoto}
              onDownload={handleDownload}
              onDelete={setPhotoToDelete}
            />
          ))}
        </div>
      )}

      {previewPhoto && (
        <PreviewModal
          photo={previewPhoto}
          cld={cld}
          onClose={() => setPreviewPhoto(null)}
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
