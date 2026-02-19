import type { Photo } from "../../../types";

/**
 * Downloads a photo by fetching its URL and triggering a save with the given filename.
 * Falls back to opening in new tab if fetch fails (e.g. CORS).
 */
export async function downloadPhoto(photo: Photo): Promise<void> {
  if (!photo.url) return;
  try {
    const res = await fetch(photo.url, { mode: "cors" });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = photo.filename || "image.jpg";
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    window.open(photo.url, "_blank");
  }
}
