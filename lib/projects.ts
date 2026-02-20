import { supabase } from "./supabase";
import type { Project } from "../types";
import { ProjectStatus } from "../types";

const COVER_BUCKET = "cover_photos";
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_COVER_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_FILENAME_LENGTH = 100;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

function getBasenameWithoutExtension(name: string): string {
  let basename = name.replace(/^.*[/\\]/, "").trim() || "cover";
  // Strip all trailing image extensions (e.g. "file.jpg.jpg" -> "file")
  while (true) {
    const lastDot = basename.lastIndexOf(".");
    if (lastDot <= 0) break;
    const ext = basename.slice(lastDot + 1).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) break;
    basename = basename.slice(0, lastDot);
  }
  const sanitized = basename.replace(/[^\w.\-]/g, "_");
  return sanitized.slice(0, MAX_FILENAME_LENGTH) || "cover";
}

/**
 * Validates that the file is an allowed image type and within size limit.
 * @throws Error with user-friendly message if validation fails
 */
export function validateCoverFile(file: File): void {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      "Please choose an image file (JPEG, PNG, WebP, or GIF)."
    );
  }
  if (file.size > MAX_COVER_SIZE_BYTES) {
    throw new Error("Cover image must be 5 MB or smaller.");
  }
}

/**
 * Uploads a cover photo to the cover_photos bucket and returns its public URL.
 * Path: {userId}/{timestamp}-{sanitizedFilename}
 * @throws Error on upload failure (e.g. auth, network, storage error)
 */
export async function uploadCoverPhoto(file: File): Promise<string> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in to upload a cover photo.");
  }

  const ext = MIME_TO_EXT[file.type] ?? "jpg";
  const basename = getBasenameWithoutExtension(file.name);
  const path = `${user.id}/${Date.now()}-${basename}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(COVER_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    throw new Error(uploadError.message || "Failed to upload cover photo.");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(COVER_BUCKET).getPublicUrl(path);
  return publicUrl;
}

export interface CreateProjectParams {
  client_name: string | null;
  project_name: string | null;
  project_date: string | null;
  cover_url: string | null;
  album_size: number | null;
}

/**
 * Inserts a new project and returns its id.
 * Requires the current user for RLS (user_id). Throws on insert failure.
 */
export async function createProject(
  params: CreateProjectParams
): Promise<{ id: number }> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in to create a project.");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      client_name: params.client_name || null,
      project_name: params.project_name || null,
      project_date: params.project_date || null,
      cover_url: params.cover_url || null,
      album_size: params.album_size ?? null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message || "Failed to create project.");
  }

  if (!data?.id) {
    throw new Error("Failed to create project: no id returned.");
  }

  return { id: data.id as number };
}

/** Supabase row shape for projects (select) */
export interface ProjectRow {
  id: number;
  created_at: string;
  client_name: string | null;
  project_name: string | null;
  project_date: string | null;
  cover_url: string | null;
  user_id: string | null;
  album_size: number | null;
  cloudinary_cloud_name: string | null;
  cloudinary_upload_preset: string | null;
  cloudinary_account_email: string | null;
}

const PLACEHOLDER_THUMBNAIL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23e2e8f0' width='800' height='600'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='24' x='50%' y='50%' text-anchor='middle' dy='.3em'%3ENo cover%3C/text%3E%3C/svg%3E";

function formatProjectDate(isoDate: string | null): string {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function mapRowToProject(row: ProjectRow): Project {
  return {
    id: String(row.id),
    title: row.project_name ?? "Untitled",
    client: row.client_name ?? "—",
    date: formatProjectDate(row.project_date),
    status: ProjectStatus.DRAFT,
    thumbnail: row.cover_url ?? PLACEHOLDER_THUMBNAIL,
    photoCount: 0,
    category: "Weddings",
    album_size: row.album_size ?? null,
    cloudinary_cloud_name: row.cloudinary_cloud_name ?? null,
    cloudinary_upload_preset: row.cloudinary_upload_preset ?? null,
    cloudinary_account_email: row.cloudinary_account_email ?? null,
  };
}

export const projectsQueryKey = ["projects"] as const;

export function projectQueryKey(id: number) {
  return ["project", id] as const;
}

/**
 * Fetches a single project by id. Returns null if not found or not owned by the current user.
 */
export async function getProject(projectId: number): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, created_at, client_name, project_name, project_date, cover_url, user_id, album_size, cloudinary_cloud_name, cloudinary_upload_preset, cloudinary_account_email")
    .eq("id", projectId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message ?? "Failed to load project.");
  }
  if (!data) return null;
  return mapRowToProject(data as ProjectRow);
}

/**
 * Fetches the current user's projects from Supabase (RLS applies).
 * Ordered by created_at descending.
 */
export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, created_at, client_name, project_name, project_date, cover_url, user_id, album_size, cloudinary_cloud_name, cloudinary_upload_preset, cloudinary_account_email")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message ?? "Failed to load projects.");
  }

  return (data ?? []).map(mapRowToProject);
}

export interface UpdateProjectCloudinaryParams {
  cloudinary_cloud_name: string | null;
  cloudinary_upload_preset: string | null;
  cloudinary_account_email?: string | null;
}

const CLOUDINARY_LOCKED_MESSAGE =
  "Cloudinary credentials cannot be changed after photos have been added to this project.";

/**
 * Updates Cloudinary settings for a project. Cloud name and upload preset may only be changed when the project has zero photos; the optional account email note can always be updated.
 * RLS ensures the current user owns the project.
 */
export async function updateProjectCloudinary(
  projectId: number,
  params: UpdateProjectCloudinaryParams
): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in to update project settings.");
  }

  const { count, error: countError } = await supabase
    .from("project_photos")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (countError) {
    throw new Error(countError.message || "Failed to check project photos.");
  }

  const hasPhotos = count != null && count > 0;

  if (hasPhotos) {
    // Only allow updating the optional email note; do not change cloud name or preset.
    const { error } = await supabase
      .from("projects")
      .update({
        cloudinary_account_email: params.cloudinary_account_email?.trim() || null,
      })
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message || "Failed to update Cloudinary settings.");
    }
    return;
  }

  const { error } = await supabase
    .from("projects")
    .update({
      cloudinary_cloud_name: params.cloudinary_cloud_name || null,
      cloudinary_upload_preset: params.cloudinary_upload_preset || null,
      cloudinary_account_email: params.cloudinary_account_email?.trim() || null,
    })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message || "Failed to update Cloudinary settings.");
  }
}
