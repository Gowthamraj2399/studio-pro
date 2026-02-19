import { supabase } from "./supabase";
import type { Photo } from "../types";

export interface ProjectPhotoRow {
  id: string;
  project_id: number;
  url: string;
  filename: string;
  public_id: string | null;
  created_at: string;
}

export interface InsertProjectPhotoParams {
  url: string;
  filename: string;
  public_id?: string;
}

function mapRowToPhoto(row: ProjectPhotoRow): Photo {
  return {
    id: row.id,
    url: row.url,
    filename: row.filename,
    public_id: row.public_id ?? undefined,
    size: "",
    dimensions: "",
  };
}

/**
 * Inserts a project photo record after upload to Cloudinary.
 * Requires the current user; RLS ensures the project is owned by the user.
 */
export async function insertProjectPhoto(
  projectId: number,
  params: InsertProjectPhotoParams
): Promise<Photo> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in to add a project photo.");
  }

  const { data, error } = await supabase
    .from("project_photos")
    .insert({
      project_id: projectId,
      url: params.url,
      filename: params.filename,
      public_id: params.public_id ?? null,
    })
    .select("id, project_id, url, filename, public_id, created_at")
    .single();

  if (error) {
    throw new Error(error.message || "Failed to save photo.");
  }

  if (!data) {
    throw new Error("Failed to save photo: no data returned.");
  }

  return mapRowToPhoto(data as ProjectPhotoRow);
}

/**
 * Fetches all photos for a project. RLS restricts to projects owned by the current user.
 */
export async function fetchProjectPhotos(projectId: number): Promise<Photo[]> {
  const { data, error } = await supabase
    .from("project_photos")
    .select("id, project_id, url, filename, public_id, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message ?? "Failed to load project photos.");
  }

  return (data ?? []).map(mapRowToPhoto);
}

export const projectPhotosQueryKey = (projectId: number) =>
  ["project_photos", projectId] as const;

/**
 * Deletes a project photo record from Supabase.
 * Does not delete the asset from Cloudinary (would require Admin API or delete token).
 */
export async function deleteProjectPhoto(photoId: string): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in to delete a photo.");
  }

  const { error } = await supabase.from("project_photos").delete().eq("id", photoId);

  if (error) {
    throw new Error(error.message || "Failed to delete photo.");
  }
}
