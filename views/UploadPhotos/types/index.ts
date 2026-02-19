import type { Photo } from "../../../types";

export interface UploadingItem {
  tempId: string;
  filename: string;
  progress: number;
}

export interface FailedUpload {
  file: File;
  filename: string;
  error: string;
}

export type LayoutMode = "grid" | "list";

export type DisplayPhoto = Photo & {
  status: "done" | "uploading";
  progress?: number;
};
