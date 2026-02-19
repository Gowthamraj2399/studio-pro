import { supabase } from "./supabase";
import type { UserRole } from "../types";

export const userRoleQueryKey = ["user_role"] as const;

/**
 * Fetches the current user's role. Returns null if no role assigned yet.
 */
export async function fetchMyRole(): Promise<UserRole | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Failed to load role.");
  }

  return (data?.role as UserRole) ?? null;
}

/**
 * Sets the current user's role (insert or update). Used on Choose role page.
 */
export async function setMyRole(role: UserRole): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in to set your role.");
  }

  const { error } = await supabase.from("user_roles").upsert(
    { user_id: user.id, role },
    { onConflict: "user_id" }
  );

  if (error) {
    throw new Error(error.message || "Failed to set role.");
  }
}

/** Creator-only route paths (dashboard, create project, upload). */
export const CREATOR_ROUTES = ["/", "/create-project", "/upload"] as const;

/** Client-only route path prefixes (my events, my bookmarks, event gallery). */
export const CLIENT_ROUTE_PREFIXES = ["/user/events", "/user/bookmarks", "/event/"] as const;

export function isCreatorRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith("/create-project")) return true;
  if (pathname.startsWith("/upload/")) return true;
  return false;
}

export function isClientRoute(pathname: string): boolean {
  if (pathname.startsWith("/user/events")) return true;
  if (pathname.startsWith("/user/bookmarks")) return true;
  if (pathname.startsWith("/event/")) return true;
  return false;
}

export function isChooseRoleRoute(pathname: string): boolean {
  return pathname === "/choose-role";
}
