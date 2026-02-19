import type { QueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export const authQueryKey = ["session"] as const;

export async function fetchSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
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
