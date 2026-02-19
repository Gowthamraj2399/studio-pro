import { supabase } from "./supabase";
import type { EventProject } from "../types";
import type { Photo } from "../types";
import type { ProjectPhotoRow } from "./project-photos";

export interface GetEventByTokenResult {
  project: EventProject;
  photos: Photo[];
}

/**
 * Resolves share token to project + photos and records event_access for current user.
 * RPC runs as definer and returns project + photos.
 */
export async function getEventByToken(token: string): Promise<GetEventByTokenResult> {
  const { data, error } = await supabase.rpc("get_event_by_token", {
    share_token: token,
  });

  if (error) {
    if (error.message?.toLowerCase().includes("invalid") || error.code === "PGRST116") {
      throw new Error("Invalid or expired link.");
    }
    throw new Error(error.message || "Failed to load event.");
  }

  if (!data?.project) {
    throw new Error("Event not found.");
  }

  const project = data.project as EventProject;
  const rawPhotos = (data.photos ?? []) as (ProjectPhotoRow & { id: string })[];
  const photos: Photo[] = rawPhotos.map((row) => ({
    id: row.id,
    url: row.url,
    filename: row.filename,
    public_id: row.public_id ?? undefined,
    size: "",
    dimensions: "",
  }));

  return { project, photos };
}

export const eventByTokenQueryKey = (token: string) => ["event_by_token", token] as const;

export interface MyEventItem {
  projectId: number;
  title: string;
  date: string;
  thumbnail: string;
  token: string;
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

/**
 * Fetches events the current user has access to (via share link), with token for each.
 */
export async function getMyEvents(): Promise<MyEventItem[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in.");
  }

  const { data: accessRows, error: accessError } = await supabase
    .from("event_access")
    .select("project_id")
    .eq("user_id", user.id);

  if (accessError || !accessRows?.length) {
    return [];
  }

  const projectIds = accessRows.map((r) => r.project_id);

  const [projectsRes, linksRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id, project_name, project_date, cover_url")
      .in("id", projectIds),
    supabase
      .from("project_share_links")
      .select("project_id, token")
      .in("project_id", projectIds),
  ]);

  if (projectsRes.error) {
    throw new Error(projectsRes.error.message || "Failed to load events.");
  }

  const projects = projectsRes.data ?? [];
  const tokenByProject = new Map<number, string>();
  for (const row of linksRes.data ?? []) {
    if (!tokenByProject.has(row.project_id)) {
      tokenByProject.set(row.project_id, row.token);
    }
  }

  return projects
    .filter((p) => tokenByProject.has(p.id))
    .map((p) => ({
      projectId: p.id,
      title: p.project_name ?? "Untitled",
      date: formatProjectDate(p.project_date),
      thumbnail: p.cover_url ?? PLACEHOLDER_THUMBNAIL,
      token: tokenByProject.get(p.id)!,
    }));
}

export const myEventsQueryKey = ["my_events"] as const;
