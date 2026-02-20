import type { QueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export const authQueryKey = ["session"] as const;

export async function fetchSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Display name from user_metadata (full_name, name) or email. */
export function getDisplayName(session: Session | null): string {
  if (!session?.user) return "";
  const meta = session.user.user_metadata as Record<string, string> | undefined;
  const name = meta?.full_name || meta?.name || "";
  if (name.trim()) return name.trim();
  return session.user.email ?? "";
}

/** Initials for avatar: from name (e.g. "JD") or first letter of email. */
export function getInitials(session: Session | null): string {
  if (!session?.user) return "?";
  const meta = session.user.user_metadata as Record<string, string> | undefined;
  const name = meta?.full_name || meta?.name || "";
  if (name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      const first = parts[0].charAt(0);
      const last = parts[parts.length - 1].charAt(0);
      return (first + last).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }
  const email = session.user.email;
  if (email) return email.charAt(0).toUpperCase();
  return "?";
}

/**
 * Syncs Supabase auth state changes into the React Query cache.
 * Call once inside a component that has access to QueryClient (e.g. inside App).
 */
export function subscribeAuthToQueryClient(queryClient: QueryClient): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    queryClient.setQueryData(authQueryKey, session);
  });
  return () => subscription.unsubscribe();
}
