import type { Photo } from "../types";
import type { UserAlbum } from "../types";
import { getMyAlbums } from "./user-albums";
import { getAlbumPhotoIds } from "./user-albums";
import { getMyEvents } from "./event-access";
import { fetchProjectPhotos } from "./project-photos";

export interface BookmarkedSection {
  projectId: number;
  eventTitle: string;
  token: string;
  album: UserAlbum;
  photos: Photo[];
}

export const myBookmarksQueryKey = ["my_bookmarks"] as const;

/**
 * Fetches all bookmarked photos grouped by event (album per project).
 */
export async function getMyBookmarkedSections(): Promise<BookmarkedSection[]> {
  const [albums, events] = await Promise.all([
    getMyAlbums(),
    getMyEvents(),
  ]);

  const eventByProjectId = new Map(
    events.map((e) => [e.projectId, { title: e.title, token: e.token }])
  );

  const sections: BookmarkedSection[] = [];

  for (const album of albums) {
    const eventInfo = eventByProjectId.get(album.project_id);
    if (!eventInfo) continue;

    const [photoIds, allPhotos] = await Promise.all([
      getAlbumPhotoIds(album.id),
      fetchProjectPhotos(album.project_id),
    ]);

    if (photoIds.length === 0) continue;

    const idSet = new Set(photoIds);
    const photos = allPhotos.filter((p) => idSet.has(p.id));

    sections.push({
      projectId: album.project_id,
      eventTitle: eventInfo.title,
      token: eventInfo.token,
      album,
      photos,
    });
  }

  return sections;
}
