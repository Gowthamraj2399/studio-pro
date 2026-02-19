import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { UserRole } from "../types";

const isSubmissionsPath = (pathname: string) =>
  pathname === "/submissions" || pathname.startsWith("/project/");

const Sidebar: React.FC<{ role: UserRole }> = ({ role }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/signin", { replace: true });
  };
  const navItems =
    role === "creator"
      ? [
          { name: "Galleries", icon: "dashboard", path: "/" },
          { name: "Submissions", icon: "inbox", path: "/submissions" },
        ]
      : [
          { name: "My events", icon: "event_available", path: "/user/events" },
          { name: "My favorites", icon: "favorite", path: "/user/bookmarks" },
        ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800 flex flex-col hidden lg:flex">
      <div className="p-6 border-b border-slate-200 dark:border-gray-800 flex items-center gap-3">
        <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined">photo_camera</span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">Studio Pro</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {role === "creator" ? "Professional Admin" : "Event photos"}
          </p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            isActive={
              role === "creator" && item.path === "/submissions"
                ? (_, loc) => isSubmissionsPath(loc.pathname)
                : undefined
            }
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800 hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-gray-800">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-gray-400 font-semibold text-sm hover:text-red-500 transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
