import { Cloudinary } from "@cloudinary/url-gen";

const envCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const envUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export interface CloudinaryConfigOverrides {
  cloudName?: string;
  uploadPreset?: string;
}

/**
 * Returns Cloudinary config. If overrides provide both cloudName and uploadPreset, use them; else use env.
 */
export function getCloudinaryConfig(overrides?: CloudinaryConfigOverrides): { cloudName: string; uploadPreset: string } {
  const useOverrides =
    overrides?.cloudName != null &&
    overrides.cloudName.trim() !== "" &&
    overrides?.uploadPreset != null &&
    overrides.uploadPreset.trim() !== "";
  if (useOverrides) {
    return {
      cloudName: overrides.cloudName!.trim(),
      uploadPreset: overrides.uploadPreset!.trim(),
    };
  }
  if (!envCloudName || !envUploadPreset) {
    throw new Error(
      "Missing VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET. Add them to .env or set per-project in Settings."
    );
  }
  return { cloudName: envCloudName, uploadPreset: envUploadPreset };
}

/**
 * Cloudinary instance for url-gen (display, transformations).
 * If cloudName is passed, use it; otherwise use config from env (throws if env missing).
 */
export function getCloudinaryInstance(cloudName?: string): Cloudinary {
  const name =
    cloudName != null && cloudName.trim() !== ""
      ? cloudName.trim()
      : getCloudinaryConfig().cloudName;
  return new Cloudinary({
    cloud: { cloudName: name },
    url: { secure: true },
  });
}

/** Returns Cloudinary instance or null if no cloud name available (env and argument). */
export function getCloudinaryInstanceOrNull(cloudName?: string): Cloudinary | null {
  if (cloudName != null && cloudName.trim() !== "") {
    return getCloudinaryInstance(cloudName);
  }
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
  /** When set with uploadPreset, use these instead of env for this upload. */
  cloudName?: string;
  uploadPreset?: string;
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
  const configOverrides =
    options?.cloudName != null &&
    options.cloudName.trim() !== "" &&
    options?.uploadPreset != null &&
    options.uploadPreset.trim() !== ""
      ? { cloudName: options.cloudName, uploadPreset: options.uploadPreset }
      : undefined;
  const { cloudName: name, uploadPreset: preset } = getCloudinaryConfig(configOverrides);

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
