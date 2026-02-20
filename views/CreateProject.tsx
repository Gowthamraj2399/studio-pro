import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  uploadCoverPhoto,
  createProject,
  validateCoverFile,
} from "../lib/projects";

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    clientName: "",
    projectName: "",
    date: "",
    albumSize: "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Revoke object URL when preview is cleared or component unmounts
  useEffect(() => {
    return () => {
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    };
  }, [coverPreviewUrl]);

  const createMutation = useMutation({
    mutationFn: async () => {
      let coverUrl: string | null = null;
      if (coverFile) {
        validateCoverFile(coverFile);
        coverUrl = await uploadCoverPhoto(coverFile);
      }
      const { id } = await createProject({
        client_name: formData.clientName.trim() || null,
        project_name: formData.projectName.trim() || null,
        project_date: formData.date || null,
        cover_url: coverUrl,
        album_size: formData.albumSize.trim() ? Number(formData.albumSize) : null,
      });
      return id;
    },
    onSuccess: (id) => {
      navigate(`/upload/${id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (coverFile) {
      try {
        validateCoverFile(coverFile);
      } catch (err) {
        setValidationError(err instanceof Error ? err.message : "Invalid file.");
        return;
      }
    }
    createMutation.mutate();
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl);
      setCoverPreviewUrl(null);
    }
    setCoverFile(file ?? null);
    setValidationError(null);
    if (file) {
      setCoverPreviewUrl(URL.createObjectURL(file));
    }
    e.target.value = "";
  };

  const handleRemoveCover = () => {
    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl);
      setCoverPreviewUrl(null);
    }
    setCoverFile(null);
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isSubmitting = createMutation.isPending;
  const errorMessage = validationError ?? createMutation.error?.message ?? null;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-gray-800 overflow-hidden">
        <div className="p-8 md:p-12 text-center">
          <h1 className="text-4xl font-black mb-4 tracking-tight">
            Create New Project
          </h1>
          <p className="text-slate-500 max-w-md mx-auto mb-10">
            Start a new organized gallery for your client to view and download
            photos.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8 text-left">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-gray-300">
                Client Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  person
                </span>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-gray-800 dark:bg-gray-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-base"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-gray-300">
                Project Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  folder
                </span>
                <input
                  type="text"
                  placeholder="e.g. Summer Wedding 2024"
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-gray-800 dark:bg-gray-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-base"
                  value={formData.projectName}
                  onChange={(e) =>
                    setFormData({ ...formData, projectName: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-gray-300">
                Event Date (Optional)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  calendar_today
                </span>
                <input
                  type="date"
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-gray-800 dark:bg-gray-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-base"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-gray-300">
                Max photos per album (Optional)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  photo_library
                </span>
                <input
                  type="number"
                  min={1}
                  placeholder="Unlimited"
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-gray-800 dark:bg-gray-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-base"
                  value={formData.albumSize}
                  onChange={(e) =>
                    setFormData({ ...formData, albumSize: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Limit how many photos clients can add to their album. Leave empty for unlimited.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-gray-300">
                Cover Photo (Optional, max 5 MB)
              </label>
              {!coverPreviewUrl ? (
                <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-slate-200 dark:border-gray-700 dark:bg-gray-800/50 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">
                    add_photo_alternate
                  </span>
                  <span className="text-sm text-slate-500 dark:text-gray-400">
                    JPEG, PNG, WebP or GIF
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleCoverChange}
                    disabled={isSubmitting}
                  />
                </label>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-gray-700 aspect-video bg-slate-100 dark:bg-gray-800">
                  <img
                    src={coverPreviewUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    disabled={isSubmitting}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors disabled:opacity-50"
                    aria-label="Remove cover"
                  >
                    <span className="material-symbols-outlined text-lg">
                      close
                    </span>
                  </button>
                </div>
              )}
            </div>

            {errorMessage && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm"
                role="alert"
              >
                <span className="material-symbols-outlined text-lg shrink-0">
                  error
                </span>
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    progress_activity
                  </span>
                  Creating…
                </>
              ) : (
                <>
                  Create Project
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-sm font-medium text-slate-400">
            Need help?{" "}
            <a href="#" className="text-primary font-bold hover:underline">
              Read the guide
            </a>{" "}
            on sharing galleries.
          </p>
        </div>
      </div>
      <p className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
        © 2024 StudioShare. All rights reserved.
      </p>
    </div>
  );
};

export default CreateProject;
