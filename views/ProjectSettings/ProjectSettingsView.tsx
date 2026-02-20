import React, { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProject,
  projectQueryKey,
  updateProjectCloudinary,
  type UpdateProjectCloudinaryParams,
} from "../../lib/projects";
import { fetchProjectPhotos, projectPhotosQueryKey } from "../../lib/project-photos";
import { CloudinarySetupGuide } from "./CloudinarySetupGuide";

const LOCKED_MESSAGE =
  "Cloudinary credentials cannot be changed after photos have been added to this project.";

export const ProjectSettingsView: React.FC = () => {
  const { projectId: projectIdParam } = useParams();
  const queryClient = useQueryClient();
  const projectId = projectIdParam ? parseInt(projectIdParam, 10) : NaN;
  const isValidProject = !isNaN(projectId) && projectId > 0;

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: projectQueryKey(projectId),
    queryFn: () => getProject(projectId),
    enabled: isValidProject,
  });

  const { data: photos = [] } = useQuery({
    queryKey: projectPhotosQueryKey(projectId),
    queryFn: () => fetchProjectPhotos(projectId),
    enabled: isValidProject,
  });

  const hasPhotos = photos.length > 0;
  const [cloudName, setCloudName] = useState("");
  const [uploadPreset, setUploadPreset] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync local state when project loads
  React.useEffect(() => {
    if (project) {
      setCloudName(project.cloudinary_cloud_name ?? "");
      setUploadPreset(project.cloudinary_upload_preset ?? "");
      setAccountEmail(project.cloudinary_account_email ?? "");
    }
  }, [project?.id, project?.cloudinary_cloud_name, project?.cloudinary_upload_preset, project?.cloudinary_account_email]);

  const updateMutation = useMutation({
    mutationFn: (params: UpdateProjectCloudinaryParams) =>
      updateProjectCloudinary(projectId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
      setSaveError(null);
    },
    onError: (err: Error) => {
      setSaveError(err.message);
    },
  });

  const handleSave = useCallback(() => {
    setSaveError(null);
    updateMutation.mutate({
      cloudinary_cloud_name: cloudName.trim() || null,
      cloudinary_upload_preset: uploadPreset.trim() || null,
      cloudinary_account_email: accountEmail.trim() || null,
    });
  }, [cloudName, uploadPreset, accountEmail, updateMutation]);

  if (!isValidProject) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-slate-500 font-medium">Invalid project.</p>
        <Link to="/" className="text-primary font-semibold mt-2 inline-block">
          Back to Galleries
        </Link>
      </div>
    );
  }

  if (projectLoading || (project === null && isValidProject)) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-slate-400">
          progress_activity
        </span>
        <p className="text-slate-500 font-medium mt-2">Loading…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-slate-500 font-medium">Project not found.</p>
        <Link to="/" className="text-primary font-semibold mt-2 inline-block">
          Back to Galleries
        </Link>
      </div>
    );
  }

  const canEditCredentials = !hasPhotos;
  const showSave = true;

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1">Project settings</h1>
          <p className="text-slate-500 font-medium">{project.title}</p>
        </div>
        <Link
          to={`/upload/${projectId}`}
          className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to uploads
        </Link>
      </div>

      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Cloudinary (photo storage)
        </h2>
        <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">
          Leave empty to use the app default. Set these before adding photos; they cannot be changed after the first photo is uploaded.
        </p>

        {hasPhotos && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm font-medium flex items-start gap-2">
            <span className="material-symbols-outlined shrink-0 mt-0.5">info</span>
            {LOCKED_MESSAGE}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="cloudinary-cloud-name"
              className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1"
            >
              Cloud name
            </label>
            <input
              id="cloudinary-cloud-name"
              type="text"
              value={cloudName}
              onChange={(e) => setCloudName(e.target.value)}
              disabled={!canEditCredentials}
              placeholder="Leave empty to use app default"
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="cloudinary-upload-preset"
              className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1"
            >
              Upload preset
            </label>
            <input
              id="cloudinary-upload-preset"
              type="text"
              value={uploadPreset}
              onChange={(e) => setUploadPreset(e.target.value)}
              disabled={!canEditCredentials}
              placeholder="Leave empty to use app default"
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="cloudinary-account-email"
              className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1"
            >
              Cloudinary account email <span className="font-normal text-slate-400">(optional note)</span>
            </label>
            <input
              id="cloudinary-account-email"
              type="email"
              value={accountEmail}
              onChange={(e) => setAccountEmail(e.target.value)}
              placeholder="Email used to create the Cloudinary account"
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {saveError && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400 font-medium">
            {saveError}
          </p>
        )}

        {showSave && (
          <button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="mt-6 h-11 px-6 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? (
              <>
                <span className="material-symbols-outlined animate-spin text-lg">
                  progress_activity
                </span>
                Saving…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">save</span>
                Save
              </>
            )}
          </button>
        )}
      </section>

      <CloudinarySetupGuide />
    </div>
  );
};
