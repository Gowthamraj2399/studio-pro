import { useMemo } from "react";
import type { Photo } from "../../../types";
import type { DisplayPhoto, UploadingItem } from "../types";

export function useDisplayPhotos(
  photos: Photo[],
  uploading: UploadingItem[]
): DisplayPhoto[] {
  return useMemo(
    () => [
      ...photos.map((p) => ({ ...p, status: "done" as const })),
      ...uploading.map((u) => ({
        id: u.tempId,
        url: "",
        filename: u.filename,
        size: "",
        dimensions: "",
        status: "uploading" as const,
        progress: u.progress,
      })),
    ],
    [photos, uploading]
  );
}
