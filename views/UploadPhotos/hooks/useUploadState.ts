import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { uploadProjectPhoto } from "../../../lib/cloudinary";
import {
  insertProjectPhoto,
  projectPhotosQueryKey,
} from "../../../lib/project-photos";
import { UPLOAD_FOLDER_PREFIX } from "../config";
import type { UploadingItem } from "../types";

interface UseUploadStateArgs {
  projectId: number;
  isValidProject: boolean;
}

export function useUploadState({
  projectId,
  isValidProject,
}: UseUploadStateArgs) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingItem[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length || !isValidProject) return;
      setUploadError(null);
      const folder = `${UPLOAD_FOLDER_PREFIX}/${projectId}`;
      const fileArray = Array.from(files);
      const next: UploadingItem[] = fileArray.map((file, i) => ({
        tempId: `upload-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
        filename: file.name,
        progress: 0,
      }));
      setUploading((prev) => [...prev, ...next]);

      const errors: string[] = [];
      const uploadPromises = fileArray.map((file, i) => {
        const tempId = next[i].tempId;
        return uploadProjectPhoto(file, {
          folder,
          onProgress: (percent) => {
            setUploading((prev) =>
              prev.map((u) =>
                u.tempId === tempId ? { ...u, progress: percent } : u
              )
            );
          },
        })
          .then(async (result) => {
            await insertProjectPhoto(projectId, {
              url: result.secure_url,
              filename: file.name,
              public_id: result.public_id,
            });
            return result;
          })
          .catch((err) => {
            errors.push(err instanceof Error ? err.message : "Upload failed.");
            throw err;
          })
          .finally(() => {
            setUploading((prev) => prev.filter((u) => u.tempId !== tempId));
          });
      });

      try {
        await Promise.allSettled(uploadPromises);
        if (errors.length > 0) {
          setUploadError(
            errors.length === 1
              ? errors[0]
              : `${errors.length} upload(s) failed.`
          );
        }
        queryClient.invalidateQueries({
          queryKey: projectPhotosQueryKey(projectId),
        });
      } catch {
        // Individual errors already handled in catch above
      }
    },
    [projectId, isValidProject, queryClient]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      e.target.value = "";
    },
    [handleFiles]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const onDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);

  return {
    fileInputRef,
    uploading,
    uploadError,
    handleFiles,
    onFileChange,
    onDrop,
    onDragOver,
  };
}
