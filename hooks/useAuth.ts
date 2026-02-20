import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { supabase } from "../lib/supabase";

export type SignInCredentials = { email: string; password: string };

export function useAuth() {
  const queryClient = useQueryClient();

  const signIn = useCallback(
    async (credentials: SignInCredentials) => {
      const { error } = await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    queryClient.clear();
  }, [queryClient]);

  return { signIn, signOut };
}
