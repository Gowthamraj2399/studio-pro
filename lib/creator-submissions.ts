import { supabase } from "./supabase";
import type {
  CreatorSubmissionProject,
  SubmittedAlbumWithPhotosResult,
  Photo,
  EventProject,
  SubmittedAlbumInfo,
} from "../types";

export const creatorSubmissionsQueryKey = ["creator_submissions"] as const;

export function submittedAlbumWithPhotosQueryKey(albumId: string) {
  return ["submitted_album_with_photos", albumId] as const;
}

/**
 * Fetches all projects (owned by current user) that have at least one submitted album.
 * Used for the Submissions list page.
 */
export async function fetchCreatorSubmissions(): Promise<
  CreatorSubmissionProject[]
> {
  const { data, error } = await supabase.rpc("get_creator_submissions");

  if (error) {
    throw new Error(error.message || "Failed to load submissions.");
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return data as CreatorSubmissionProject[];
}

function mapPhotoRow(row: {
  id: string;
  url: string;
  filename: string;
  public_id?: string | null;
}): Photo {
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
 * Fetches a single submitted album with its photos.
 * Only succeeds if the current user owns the album's project.
 */
export async function fetchSubmittedAlbumWithPhotos(
  albumId: string
): Promise<SubmittedAlbumWithPhotosResult | null> {
  const { data, error } = await supabase.rpc(
    "get_submitted_album_with_photos",
    { p_album_id: albumId }
  );

  if (error) {
    throw new Error(error.message || "Failed to load submitted album.");
  }

  if (!data || !data.project) {
    return null;
  }

  const raw = data as {
    project: EventProject;
    album: SubmittedAlbumInfo;
    photos: Array<{ id: string; url: string; filename: string; public_id?: string | null }>;
  };

  return {
    project: raw.project,
    album: raw.album,
    photos: (raw.photos ?? []).map(mapPhotoRow),
  };
}

/**
 * Reopens a submitted album (sets it back to draft) so the client can change
 * their selection and resubmit. Only allowed if the current user owns the project.
 */
export async function reopenSubmittedAlbum(albumId: string): Promise<void> {
  const { error } = await supabase.rpc("reopen_submitted_album", {
    p_album_id: albumId,
  });

  if (error) {
    throw new Error(error.message || "Failed to reopen album.");
  }
}
