import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserRole } from "../../types";
import { setMyRole, userRoleQueryKey, isCreatorRoute, isClientRoute } from "../../lib/user-roles";

export const ChooseRoleView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const setRoleMutation = useMutation({
    mutationFn: (role: UserRole) => setMyRole(role),
    onSuccess: (_, role) => {
      queryClient.invalidateQueries({ queryKey: userRoleQueryKey });
      const target =
        from && role === "creator" && isCreatorRoute(from)
          ? from
          : from && role === "client" && isClientRoute(from)
            ? from
            : role === "creator"
              ? "/"
              : "/user/events";
      navigate(target, { replace: true });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-800 p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="material-symbols-outlined text-4xl text-primary">
              photo_camera
            </span>
            <h1 className="text-2xl font-black tracking-tight">Studio Pro</h1>
          </div>
          <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
            Choose your role
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Are you a studio owner uploading galleries, or a client viewing event photos?
          </p>

          {setRoleMutation.error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {setRoleMutation.error.message}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              disabled={setRoleMutation.isPending}
              onClick={() => setRoleMutation.mutate("creator")}
              className="w-full h-14 px-6 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-2xl">photo_camera</span>
              I&apos;m a creator
              <span className="text-sm font-medium opacity-90">(studio owner)</span>
            </button>
            <button
              type="button"
              disabled={setRoleMutation.isPending}
              onClick={() => setRoleMutation.mutate("client")}
              className="w-full h-14 px-6 bg-slate-100 dark:bg-gray-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-gray-700 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-200 dark:hover:bg-gray-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-2xl">event_available</span>
              I&apos;m a client
              <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                (view events & submit photos)
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
