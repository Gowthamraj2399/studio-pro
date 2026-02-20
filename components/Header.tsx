import React, { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  authQueryKey,
  fetchSession,
  getDisplayName,
  getInitials,
} from "../lib/auth-query";
import {
  fetchNotifications,
  notificationsQueryKey,
} from "../lib/notifications";
import { NotificationDropdown } from "./NotificationDropdown";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types";

const Header: React.FC<{ role: UserRole }> = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  const { data: session } = useQuery({
    queryKey: authQueryKey,
    queryFn: fetchSession,
  });
  const displayName = getDisplayName(session ?? null);
  const initials = getInitials(session ?? null);

  const { data: notifications = [] } = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: fetchNotifications,
    enabled: role === "creator",
  });
  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const showNotifications = role === "creator";

  const pathParts = location.pathname.split("/").filter(Boolean);

  const handleSignOut = async () => {
    await signOut();
    setProfileOpen(false);
    navigate("/signin", { replace: true });
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="lg:hidden text-primary">
          <span className="material-symbols-outlined">photo_camera</span>
        </div>

        <nav className="hidden md:flex items-center text-sm gap-2 text-slate-400">
          <Link
            to={role === "creator" ? "/" : "/user/events"}
            className="hover:text-primary transition-colors"
          >
            {role === "creator" ? "Galleries" : "My events"}
          </Link>
          {pathParts.length > 0 && !pathParts.includes("choose-role") && (
            <>
              <span className="material-symbols-outlined text-xs">
                chevron_right
              </span>
              <span className="text-slate-900 dark:text-white font-medium capitalize">
                {pathParts[pathParts.length - 1].replace(/-/g, " ")}
              </span>
            </>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-8 mr-4">
          <Link
            to={role === "creator" ? "/" : "/user/events"}
            className="text-sm font-medium hover:text-primary"
          >
            {role === "creator" ? "Galleries" : "My events"}
          </Link>
        </div>

        <div className="flex items-center gap-4 border-l border-slate-200 dark:border-gray-800 pl-6">
          {showNotifications && (
            <div className="relative">
              <button
                ref={notificationButtonRef}
                type="button"
                onClick={() => setNotificationsOpen((o) => !o)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full transition-colors relative flex items-center justify-center"
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined text-slate-600 dark:text-gray-400 text-[24px]" aria-hidden="true">
                  notifications
                </span>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full border-2 border-white dark:border-gray-900">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                anchorRef={notificationButtonRef}
              />
            </div>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              className="size-9 rounded-full bg-primary/20 border-2 border-white dark:border-gray-800 overflow-hidden shadow-sm focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center text-primary font-semibold text-sm uppercase cursor-pointer"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              aria-label="Profile menu"
            >
              <span aria-hidden="true">{initials}</span>
            </button>
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  aria-hidden="true"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-slate-200 dark:border-gray-700 z-50">
                  {displayName && (
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-gray-700 flex items-center gap-3">
                      <span className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs uppercase shrink-0">
                        {initials}
                      </span>
                      <span
                        className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate"
                        title={displayName}
                      >
                        {displayName}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-700 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">
                      logout
                    </span>
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
