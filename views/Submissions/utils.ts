import JSZip from "jszip";
import type { Photo } from "../../types";

/**
 * Sanitizes a string for use in a filename (remove or replace invalid chars).
 */
function safeFilenameSegment(s: string): string {
  return s.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").trim() || "submission";
}

/**
 * Builds a ZIP blob from the given photos and returns it.
 * Photos without `url` are skipped. Duplicate filenames get a numeric suffix.
 * On fetch error for a photo, that file is skipped; the rest are still added.
 */
export async function buildPhotosZip(photos: Photo[]): Promise<{ blob: Blob; failedCount: number }> {
  const zip = new JSZip();
  const usedNames = new Set<string>();
  let failedCount = 0;

  for (const photo of photos) {
    if (!photo.url) {
      failedCount++;
      continue;
    }
    let name = photo.filename || "image.jpg";
    const base = name.replace(/\.[^.]+$/, "") || "image";
    const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : ".jpg";
    while (usedNames.has(name)) {
      const match = name.match(/^(.+)-(\d+)(\.[^.]+)$/);
      if (match) {
        const n = parseInt(match[2], 10) + 1;
        name = `${match[1]}-${n}${match[3]}`;
      } else {
        name = `${base}-${usedNames.size}${ext}`;
      }
    }
    usedNames.add(name);

    try {
      const res = await fetch(photo.url, { mode: "cors" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      zip.file(name, blob);
    } catch {
      failedCount++;
    }
  }

  const blob = await zip.generateAsync({ type: "blob" });
  return { blob, failedCount };
}

/**
 * Suggests a safe zip filename from project name and optional date string.
 */
export function suggestedZipFilename(projectName: string, submittedAt: string | null): string {
  const base = safeFilenameSegment(projectName || "submission");
  const datePart = submittedAt
    ? new Date(submittedAt).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  return `${base}-${datePart}.zip`;
}
