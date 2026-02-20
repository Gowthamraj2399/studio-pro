import { supabase } from "./supabase";
import type { UserAlbum } from "../types";

export interface UserAlbumRow {
  id: string;
  user_id: string;
  project_id: number;
  status: string;
  submitted_at: string | null;
  created_at: string;
}

function mapRowToAlbum(row: UserAlbumRow): UserAlbum {
  return {
    id: row.id,
    user_id: row.user_id,
    project_id: row.project_id,
    status: row.status as UserAlbum["status"],
    submitted_at: row.submitted_at,
    created_at: row.created_at,
  };
}

export const userAlbumQueryKey = (projectId: number) => ["user_album", projectId] as const;
export const albumPhotoIdsQueryKey = (albumId: string) =>
  ["album_photo_ids", albumId] as const;
export const myAlbumsQueryKey = ["my_albums"] as const;

/**
 * Fetches all albums for the current user (across all events).
 */
export async function getMyAlbums(): Promise<UserAlbum[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in.");
  }

  const { data, error } = await supabase
    .from("user_albums")
    .select("id, user_id, project_id, status, submitted_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Failed to load albums.");
  }

  return (data ?? []).map((r) => mapRowToAlbum(r as UserAlbumRow));
}

/**
 * Fetches the current user's album for a project (draft or submitted). Returns null if none.
 */
export async function getUserAlbum(projectId: number): Promise<UserAlbum | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in.");
  }

  const { data, error } = await supabase
    .from("user_albums")
    .select("id, user_id, project_id, status, submitted_at, created_at")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Failed to load album.");
  }

  return data ? mapRowToAlbum(data as UserAlbumRow) : null;
}

/**
 * Fetches photo IDs in the user's album for a project. Returns empty array if no album.
 */
export async function getAlbumPhotoIds(albumId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_album_photos")
    .select("photo_id")
    .eq("album_id", albumId);

  if (error) {
    throw new Error(error.message || "Failed to load album photos.");
  }

  return (data ?? []).map((r) => r.photo_id);
}

/**
 * Creates a draft album for the project if none exists; returns the album.
 */
export async function getOrCreateUserAlbum(projectId: number): Promise<UserAlbum> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in.");
  }

  const existing = await getUserAlbum(projectId);
  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("user_albums")
    .insert({
      user_id: user.id,
      project_id: projectId,
      status: "draft",
    })
    .select("id, user_id, project_id, status, submitted_at, created_at")
    .single();

  if (error) {
    throw new Error(error.message || "Failed to create album.");
  }

  return mapRowToAlbum(data as UserAlbumRow);
}

/**
 * Adds a photo to the user's album. Creates album if needed.
 * Respects project album_size limit when set.
 */
export async function addPhotoToAlbum(projectId: number, photoId: string): Promise<void> {
  const album = await getOrCreateUserAlbum(projectId);

  const { data: projectRow, error: projectError } = await supabase
    .from("projects")
    .select("album_size")
    .eq("id", projectId)
    .single();

  if (projectError) {
    throw new Error(projectError.message || "Failed to load project.");
  }

  const albumSize = (projectRow as { album_size: number | null } | null)?.album_size ?? null;
  if (albumSize != null) {
    const currentIds = await getAlbumPhotoIds(album.id);
    if (!currentIds.includes(photoId) && currentIds.length >= albumSize) {
      throw new Error(`Album is full (max ${albumSize} photos).`);
    }
  }

  const { error } = await supabase.from("user_album_photos").upsert(
    {
      album_id: album.id,
      photo_id: photoId,
    },
    { onConflict: "album_id,photo_id" }
  );

  if (error) {
    throw new Error(error.message || "Failed to add photo to album.");
  }
}

/**
 * Removes a photo from the user's album.
 */
export async function removePhotoFromAlbum(albumId: string, photoId: string): Promise<void> {
  const { error } = await supabase
    .from("user_album_photos")
    .delete()
    .eq("album_id", albumId)
    .eq("photo_id", photoId);

  if (error) {
    throw new Error(error.message || "Failed to remove photo from album.");
  }
}

/**
 * Submits the album (status -> submitted) and creates a notification for the project owner.
 * RPC runs as definer.
 */
export async function submitAlbum(albumId: string): Promise<void> {
  const { error } = await supabase.rpc("submit_album", { album_uuid: albumId });

  if (error) {
    throw new Error(error.message || "Failed to submit album.");
  }
}
