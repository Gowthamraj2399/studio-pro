/** RBAC: creator (studio owner) vs client (event viewer). */
export type UserRole = "creator" | "client";

export enum ProjectStatus {
  PUBLISHED = 'PUBLISHED',
  IN_REVIEW = 'IN_REVIEW',
  DRAFT = 'DRAFT'
}

export interface Project {
  id: string;
  title: string;
  client: string;
  date: string;
  status: ProjectStatus;
  thumbnail: string;
  photoCount: number;
  category: 'Weddings' | 'Editorial' | 'Portraits' | 'Event';
  album_size?: number | null;
  cloudinary_cloud_name?: string | null;
  cloudinary_upload_preset?: string | null;
  /** Optional note: which email the Cloudinary account was created with. */
  cloudinary_account_email?: string | null;
}

export interface Photo {
  id: string;
  url: string;
  filename: string;
  /** Cloudinary public_id; used for url-gen / AdvancedImage when present */
  public_id?: string;
  size: string;
  dimensions: string;
  isFavorited?: boolean;
  isUploading?: boolean;
  progress?: number;
  aiDescription?: string;
  aiTags?: string[];
}

// --- User / event gallery (extractable module) ---

export type AlbumStatus = "draft" | "submitted";

export interface UserAlbum {
  id: string;
  user_id: string;
  project_id: number;
  status: AlbumStatus;
  submitted_at: string | null;
  created_at: string;
}

export interface EventProject {
  id: number;
  project_name: string | null;
  project_date: string | null;
  client_name: string | null;
  cover_url: string | null;
  created_at: string;
  album_size?: number | null;
  cloudinary_cloud_name?: string | null;
  cloudinary_upload_preset?: string | null;
}

export interface EventAccessItem {
  project_id: number;
  user_id: string;
  created_at: string;
}

export interface NotificationPayload {
  album_id?: string;
  project_id?: number;
  submitted_by_user_id?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  payload: NotificationPayload;
  read_at: string | null;
  created_at: string;
}

// --- Creator submissions (view submitted albums) ---

export interface CreatorSubmissionAlbum {
  album_id: string;
  submitted_at: string | null;
  submitted_by_user_id: string;
}

export interface CreatorSubmissionProject {
  project_id: number;
  project_name: string | null;
  albums: CreatorSubmissionAlbum[];
}

export interface SubmittedAlbumInfo {
  id: string;
  submitted_at: string | null;
  submitted_by_user_id: string;
}

export interface SubmittedAlbumWithPhotosResult {
  project: EventProject;
  album: SubmittedAlbumInfo;
  photos: Photo[];
}
