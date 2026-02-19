import { supabase } from "./supabase";

/**
 * Generates a URL-safe random token (e.g. for share links).
 */
function generateToken(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Gets or creates a share link for a project. Returns the token.
 * Creator-only (RLS: project owner).
 */
export async function getOrCreateShareToken(projectId: number): Promise<string> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in to share an event link.");
  }

  const { data: existing } = await supabase
    .from("project_share_links")
    .select("token")
    .eq("project_id", projectId)
    .limit(1)
    .maybeSingle();

  if (existing?.token) {
    return existing.token;
  }

  const token = generateToken();
  const { error: insertError } = await supabase.from("project_share_links").insert({
    project_id: projectId,
    token,
  });

  if (insertError) {
    throw new Error(insertError.message || "Failed to create share link.");
  }

  return token;
}

/**
 * Returns the full event URL for the given token (hash router).
 */
export function getEventUrl(token: string): string {
  const base = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
  return `${base}#/event/${token}`;
}
