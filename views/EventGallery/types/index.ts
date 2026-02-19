import type { Photo } from "../../../types";
import type { EventProject } from "../../../types";

export type { Photo, EventProject };

export interface EventGalleryData {
  project: EventProject;
  photos: Photo[];
}
