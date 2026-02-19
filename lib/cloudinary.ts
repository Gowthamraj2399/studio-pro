import { Cloudinary } from "@cloudinary/url-gen";

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export function getCloudinaryConfig() {
  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Missing VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET. Add them to .env."
    );
  }
  return { cloudName, uploadPreset };
}

/**
 * Shared Cloudinary instance for url-gen (display, transformations).
 * Use only when cloud name is configured.
 */
export function getCloudinaryInstance(): Cloudinary {
  const { cloudName: name } = getCloudinaryConfig();
  return new Cloudinary({
    cloud: { cloudName: name },
    url: { secure: true },
  });
}

/** Returns Cloudinary instance or null if env is not configured (e.g. display-only fallback to url). */
export function getCloudinaryInstanceOrNull(): Cloudinary | null {
  try {
    return getCloudinaryInstance();
  } catch {
    return null;
  }
}

export interface UploadProjectPhotoResult {
  secure_url: string;
  public_id: string;
}

export interface UploadProjectPhotoOptions {
  folder?: string;
  onProgress?: (percent: number) => void;
}

/**
 * Uploads a single image file to Cloudinary (unsigned preset).
 * Does not set a custom public_id so Cloudinary assigns one and returns a working secure_url.
 * Returns secure_url and public_id for storage and display.
 */
export async function uploadProjectPhoto(
  file: File,
  options?: UploadProjectPhotoOptions
): Promise<UploadProjectPhotoResult> {
  const { cloudName: name, uploadPreset: preset } = getCloudinaryConfig();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);
  if (options?.folder) {
    formData.append("folder", options.folder);
  }

  const url = `https://api.cloudinary.com/v1_1/${name}/image/upload`;

  if (options?.onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          options.onProgress?.(percent);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.secure_url && data.public_id) {
              resolve({ secure_url: data.secure_url, public_id: data.public_id });
            } else {
              reject(new Error("Invalid response from Cloudinary."));
            }
          } catch {
            reject(new Error("Failed to parse upload response."));
          }
        } else {
          let message = "Failed to upload photo.";
          try {
            const err = JSON.parse(xhr.responseText);
            if (err?.error?.message) message = err.error.message;
          } catch {
            // ignore
          }
          reject(new Error(message));
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Network error during upload.")));
      xhr.addEventListener("abort", () => reject(new Error("Upload aborted.")));

      xhr.send(formData);
    });
  }

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let message = "Failed to upload photo.";
    try {
      const err = await res.json();
      if (err?.error?.message) message = err.error.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const data = (await res.json()) as { secure_url?: string; public_id?: string };
  if (!data.secure_url || !data.public_id) {
    throw new Error("Invalid response from Cloudinary.");
  }
  return { secure_url: data.secure_url, public_id: data.public_id };
}
