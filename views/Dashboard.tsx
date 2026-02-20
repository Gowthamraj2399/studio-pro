import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ProjectStatus } from "../types";
import { fetchProjects, projectsQueryKey } from "../lib/projects";
import { supabase } from "../lib/supabase";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: projects = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: projectsQueryKey,
    queryFn: fetchProjects,
  });

  useEffect(() => {
    const channel = supabase
      .channel("projects-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => {
          queryClient.invalidateQueries({ queryKey: projectsQueryKey });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filteredProjects = projects.filter((project) => {
    const matchesFilter =
      activeFilter === "All" || project.category === activeFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      project.title.toLowerCase().includes(query) ||
      project.client.toLowerCase().includes(query) ||
      project.category.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Owner Dashboard
          </h1>
          <p className="text-slate-500 font-medium">
            Manage your photography projects and client deliveries.
          </p>
        </div>
        <button
          onClick={() => navigate("/create-project")}
          className="h-12 px-6 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg"
        >
          <span className="material-symbols-outlined">add</span>
          Create New Project
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            type="text"
            placeholder="Search galleries..."
            className="w-full h-12 pl-12 pr-4 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
            Filter:
          </span>
          {["All", "Weddings", "Editorial", "Portraits"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`h-10 px-4 rounded-full text-sm font-bold transition-all ${
                activeFilter === filter
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-400 hover:border-primary hover:text-primary"
              }`}
            >
              {filter}
            </button>
          ))}
        </div> */}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-slate-400">
            progress_activity
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 flex items-center gap-2">
          <span className="material-symbols-outlined shrink-0">error</span>
          {error.message}
        </div>
      )}

      {!isLoading && !error && filteredProjects.length === 0 && (
        <div className="text-center py-20 text-slate-500 dark:text-gray-400">
          <span className="material-symbols-outlined text-5xl mb-4 block">
            folder_off
          </span>
          <p className="font-medium">No projects yet</p>
          <p className="text-sm mt-1">
            Create your first project to get started.
          </p>
          <button
            onClick={() => navigate("/create-project")}
            className="mt-4 h-11 px-6 bg-primary text-white rounded-xl font-bold inline-flex items-center gap-2 hover:bg-primary-hover transition-all"
          >
            <span className="material-symbols-outlined">add</span>
            Create Project
          </button>
        </div>
      )}

      {!isLoading && !error && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/upload/${project.id}`)}
              className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative"
            >
              <Link
                to={`/project/${project.id}/settings`}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-3 right-3 z-10 size-9 rounded-lg bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
                aria-label="Project settings"
              >
                <span className="material-symbols-outlined text-lg">settings</span>
              </Link>
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <div className="flex items-center gap-4 text-slate-400 text-sm">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-base">
                      calendar_today
                    </span>
                    {project.date}
                  </div>
                  {project.photoCount > 0 && (
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="material-symbols-outlined text-base">
                        photo_library
                      </span>
                      {project.photoCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* <div
          onClick={() => navigate("/create-project")}
          className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center justify-center hover:bg-primary/5"
        >
          <div className="size-14 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
            <span className="material-symbols-outlined text-3xl">add</span>
          </div>
          <span className="text-sm font-bold text-slate-500 group-hover:text-primary transition-colors mt-4">
            Add New Gallery
          </span>
        </div> */}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
