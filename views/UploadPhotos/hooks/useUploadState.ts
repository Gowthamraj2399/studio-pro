import { useCallback, useRef, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { uploadProjectPhoto } from "../../../lib/cloudinary";
import {
  insertProjectPhoto,
  projectPhotosQueryKey,
} from "../../../lib/project-photos";
import type { Photo } from "../../../types";
import { UPLOAD_FOLDER_PREFIX } from "../config";
import type { UploadingItem, FailedUpload } from "../types";

const UPLOAD_CONCURRENCY = 5;
const PROGRESS_THROTTLE_MS = 200;

interface UseUploadStateArgs {
  projectId: number;
  isValidProject: boolean;
  /** When both set, used for upload instead of env. */
  cloudinaryCloudName?: string | null;
  cloudinaryUploadPreset?: string | null;
}

export function useUploadState({
  projectId,
  isValidProject,
  cloudinaryCloudName,
  cloudinaryUploadPreset,
}: UseUploadStateArgs) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingItem[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [failedUploads, setFailedUploads] = useState<FailedUpload[]>([]);
  /** Total files in current batch (for overall %). Reset when a new batch starts. */
  const [totalBatchSize, setTotalBatchSize] = useState(0);
  /** Number of files completed in current batch (so overall % = (completed * 100 + sum progress) / total). */
  const completedInBatchRef = useRef(0);

  const progressRef = useRef<Map<string, number>>(new Map());

  const flushProgress = useCallback(() => {
    setUploading((prev) => {
      if (prev.length === 0) return prev;
      let changed = false;
      const next = prev.map((u) => {
        const p = progressRef.current.get(u.tempId);
        if (p !== undefined && p !== u.progress) {
          changed = true;
          return { ...u, progress: p };
        }
        return u;
      });
      return changed ? next : prev;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(flushProgress, PROGRESS_THROTTLE_MS);
    return () => clearInterval(id);
  }, [flushProgress]);

  const runUploadQueue = useCallback(
    async (fileArray: File[]): Promise<FailedUpload[]> => {
      const folder = `${UPLOAD_FOLDER_PREFIX}/${projectId}`;
      const total = fileArray.length;
      setTotalBatchSize(total);
      completedInBatchRef.current = 0;

      const next: UploadingItem[] = fileArray.map((file, i) => ({
        tempId: `upload-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
        filename: file.name,
        progress: 0,
      }));
      setUploading((prev) => [...prev, ...next]);
      next.forEach((u) => progressRef.current.set(u.tempId, 0));

      const failures: FailedUpload[] = [];
      let index = 0;

      const doOne = async (): Promise<void> => {
        if (index >= fileArray.length) return;
        const i = index++;
        const file = fileArray[i];
        const tempId = next[i].tempId;
        try {
          const result = await uploadProjectPhoto(file, {
            folder,
            onProgress: (percent) => {
              progressRef.current.set(tempId, percent);
            },
            ...(cloudinaryCloudName &&
            cloudinaryUploadPreset &&
            cloudinaryCloudName.trim() !== "" &&
            cloudinaryUploadPreset.trim() !== ""
              ? { cloudName: cloudinaryCloudName, uploadPreset: cloudinaryUploadPreset }
              : {}),
          });
          const photo = await insertProjectPhoto(projectId, {
            url: result.secure_url,
            filename: file.name,
            public_id: result.public_id,
          });
          queryClient.setQueryData(
            projectPhotosQueryKey(projectId),
            (old: Photo[] | undefined) => (old ? [photo, ...old] : [photo])
          );
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Upload failed.";
          failures.push({ file, filename: file.name, error: message });
        } finally {
          completedInBatchRef.current += 1;
          progressRef.current.delete(tempId);
          setUploading((prev) => prev.filter((u) => u.tempId !== tempId));
        }
        await doOne();
      };

      const workers = Array.from(
        { length: Math.min(UPLOAD_CONCURRENCY, fileArray.length) },
        () => doOne()
      );
      await Promise.all(workers);

      setTotalBatchSize(0);
      return failures;
    },
    [projectId, cloudinaryCloudName, cloudinaryUploadPreset]
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length || !isValidProject) return;
      setUploadError(null);
      setFailedUploads([]);
      const fileArray = Array.from(files);
      const failures = await runUploadQueue(fileArray);
      if (failures.length > 0) {
        setFailedUploads(failures);
        setUploadError(
          failures.length === 1
            ? failures[0].error
            : `${failures.length} upload(s) failed.`
        );
      }
      queryClient.invalidateQueries({
        queryKey: projectPhotosQueryKey(projectId),
      });
    },
    [isValidProject, projectId, queryClient, runUploadQueue]
  );

  const retryFailedUploads = useCallback(async () => {
    if (failedUploads.length === 0) return;
    setUploadError(null);
    const files = failedUploads.map((f) => f.file);
    setFailedUploads([]);
    const failures = await runUploadQueue(files);
    if (failures.length > 0) {
      setFailedUploads(failures);
      setUploadError(
        failures.length === 1
          ? failures[0].error
          : `${failures.length} upload(s) failed.`
      );
    }
    queryClient.invalidateQueries({
      queryKey: projectPhotosQueryKey(projectId),
    });
  }, [failedUploads, projectId, queryClient, runUploadQueue]);

  const dismissFailedUploads = useCallback(() => {
    setFailedUploads([]);
    setUploadError(null);
  }, []);

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

  const totalBatchSizeForDisplay = uploading.length > 0 ? totalBatchSize : 0;
  const completedInBatch = totalBatchSizeForDisplay > 0
    ? Math.min(completedInBatchRef.current, totalBatchSizeForDisplay)
    : 0;
  const sumOfProgress = uploading.reduce((a, u) => a + u.progress, 0);
  const overallPercent =
    totalBatchSizeForDisplay > 0
      ? (completedInBatch * 100 + sumOfProgress) / totalBatchSizeForDisplay
      : 0;

  return {
    fileInputRef,
    uploading,
    uploadError,
    failedUploads,
    totalBatchSize: totalBatchSizeForDisplay,
    overallUploadPercent: Math.min(100, Math.round(overallPercent * 10) / 10),
    handleFiles,
    retryFailedUploads,
    dismissFailedUploads,
    onFileChange,
    onDrop,
    onDragOver,
  };
}
