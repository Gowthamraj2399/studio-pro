import { useCallback, useMemo, useState } from "react";
import { getCloudinaryInstanceOrNull } from "../../../lib/cloudinary";
import type { Photo } from "../../../types";
import { downloadPhoto } from "../utils";
import { useProjectData } from "./useProjectData";
import { useUploadState } from "./useUploadState";
import { useDisplayPhotos } from "./useDisplayPhotos";
import { useSelection } from "./useSelection";
import { useDeleteFlow } from "./useDeleteFlow";
import { useLayoutState } from "./useLayoutState";

export function useUploadPhotos() {
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);

  const projectData = useProjectData();
  const {
    projectId,
    isValidProject,
    project,
    projectLoading,
    photos,
    photosError,
  } = projectData;

  const uploadState = useUploadState({
    projectId: isValidProject ? projectId : 0,
    isValidProject,
    cloudinaryCloudName: project?.cloudinary_cloud_name ?? undefined,
    cloudinaryUploadPreset: project?.cloudinary_upload_preset ?? undefined,
  });
  const {
    fileInputRef,
    uploading,
    uploadError,
    failedUploads,
    totalBatchSize,
    overallUploadPercent,
    retryFailedUploads,
    dismissFailedUploads,
    onFileChange,
    onDrop,
    onDragOver,
  } = uploadState;

  // Option A: grid and selection use only persisted photos; uploading shown only in UploadProgressCard
  const displayPhotos = useDisplayPhotos(photos, []);
  const totalCount = displayPhotos.length;

  const selection = useSelection(displayPhotos);
  const {
    selectedIds,
    setSelectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    selectedPhotos,
    hasSelectablePhotos,
  } = selection;

  const deleteFlow = useDeleteFlow({
    projectId: isValidProject ? projectId : 0,
  });
  const {
    photoToDelete,
    setPhotoToDelete,
    confirmBulkDelete,
    setConfirmBulkDelete,
    deletingMessage,
    deleteMutation,
    confirmDelete,
    handleBulkDelete: executeBulkDelete,
  } = deleteFlow;

  const { layout, setLayout } = useLayoutState();

  const cld = useMemo(
    () => getCloudinaryInstanceOrNull(project?.cloudinary_cloud_name ?? undefined),
    [project?.cloudinary_cloud_name]
  );

  const handleDownload = useCallback(
    (photo: Photo) => downloadPhoto(photo),
    [],
  );

  const handleBulkDownload = useCallback(async () => {
    for (const photo of selectedPhotos) {
      if (photo.url) await downloadPhoto(photo);
    }
  }, [selectedPhotos]);

  const handleBulkDelete = useCallback(() => {
    executeBulkDelete(Array.from(selectedIds), clearSelection);
  }, [selectedIds, clearSelection, executeBulkDelete]);

  return {
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
  };
}
