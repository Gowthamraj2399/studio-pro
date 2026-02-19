import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCreatorSubmissions,
  creatorSubmissionsQueryKey,
  reopenSubmittedAlbum,
} from "../../lib/creator-submissions";

function formatSubmittedAt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SubmissionsListView: React.FC = () => {
  const queryClient = useQueryClient();
  const [reopeningId, setReopeningId] = useState<string | null>(null);

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: creatorSubmissionsQueryKey,
    queryFn: fetchCreatorSubmissions,
  });

  const reopenMutation = useMutation({
    mutationFn: ({ albumId }: { albumId: string }) => reopenSubmittedAlbum(albumId),
    onMutate: ({ albumId }) => setReopeningId(albumId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creatorSubmissionsQueryKey });
    },
    onSettled: (_, __, { albumId }) => setReopeningId((id) => (id === albumId ? null : id)),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 flex items-center justify-center gap-2 text-slate-500">
        <span className="material-symbols-outlined animate-spin text-4xl">
          progress_activity
        </span>
        <span>Loading submissions…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">
          {error instanceof Error ? error.message : "Failed to load submissions."}
        </p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-500 dark:text-gray-400">
        <span className="material-symbols-outlined text-5xl mb-4 block">
          inbox
        </span>
        <p className="font-medium">No submissions yet</p>
        <p className="text-sm mt-1">
          When clients submit their photo selections, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Submissions
        </h1>
        <p className="text-slate-500 font-medium">
          View photo selections submitted by your clients.
        </p>
      </div>

      <ul className="space-y-4">
        {projects.map((proj) => (
          <li
            key={proj.project_id}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-800 overflow-hidden shadow-sm"
          >
            <div className="p-5 border-b border-slate-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {proj.project_name ?? "Untitled project"}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {proj.albums.length} submission
                {proj.albums.length !== 1 ? "s" : ""}
              </p>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-gray-800">
              {proj.albums.map((album) => (
                <li
                  key={album.album_id}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <Link
                    to={`/project/${proj.project_id}/submissions/${album.album_id}`}
                    className="flex flex-1 items-center justify-between gap-4 min-w-0"
                  >
                    <span className="text-sm text-slate-600 dark:text-gray-300">
                      Submitted {formatSubmittedAt(album.submitted_at)}
                    </span>
                    <span className="material-symbols-outlined text-slate-400 shrink-0">
                      chevron_right
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      reopenMutation.mutate({ albumId: album.album_id });
                    }}
                    disabled={reopeningId === album.album_id}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Reopen so client can change selection and resubmit"
                  >
                    {reopeningId === album.album_id ? (
                      <span className="material-symbols-outlined animate-spin text-lg">
                        progress_activity
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-lg">
                        lock_open
                      </span>
                    )}
                    Reopen
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubmissionsListView;
