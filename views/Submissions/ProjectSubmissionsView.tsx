import React, { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
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

const ProjectSubmissionsView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const pid = projectId ? parseInt(projectId, 10) : NaN;
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

  const project = Number.isFinite(pid)
    ? projects.find((p) => p.project_id === pid)
    : undefined;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 flex items-center justify-center gap-2 text-slate-500">
        <span className="material-symbols-outlined animate-spin text-4xl">
          progress_activity
        </span>
        <span>Loading…</span>
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

  if (!project) {
    return <Navigate to="/submissions" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link to="/submissions" className="hover:text-primary transition-colors">
          Submissions
        </Link>
        <span className="material-symbols-outlined text-lg">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">
          {project.project_name ?? "Untitled"}
        </span>
      </nav>

      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight mb-2">
          {project.project_name ?? "Untitled project"}
        </h1>
        <p className="text-slate-500 font-medium">
          {project.albums.length} submitted album
          {project.albums.length !== 1 ? "s" : ""}. Click to view photos.
        </p>
      </div>

      {project.albums.length === 0 ? (
        <p className="text-slate-500">No submitted albums for this project.</p>
      ) : (
        <ul className="space-y-2">
          {project.albums.map((album) => (
            <li
              key={album.album_id}
              className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 hover:border-primary/50 hover:shadow-md transition-all"
            >
              <Link
                to={`/project/${project.project_id}/submissions/${album.album_id}`}
                className="flex flex-1 items-center justify-between gap-4 min-w-0"
              >
                <span className="text-slate-700 dark:text-gray-200 font-medium">
                  Submitted {formatSubmittedAt(album.submitted_at)}
                </span>
                <span className="material-symbols-outlined text-slate-400 shrink-0">
                  chevron_right
                </span>
              </Link>
              <button
                type="button"
                onClick={() => reopenMutation.mutate({ albumId: album.album_id })}
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
      )}
    </div>
  );
};

export default ProjectSubmissionsView;
