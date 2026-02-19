import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  markAllNotificationsRead,
  notificationsQueryKey,
} from "../lib/notifications";
import type { Notification } from "../types";

function formatNotificationTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  anchorRef,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: fetchNotifications,
    enabled: isOpen,
  });

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAllNotificationsRead().then(() => {
        queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      });
    }
  }, [isOpen, unreadCount, queryClient]);

  const handleNotificationClick = (n: Notification) => {
    if (n.type === "album_submitted" && n.payload?.project_id != null && n.payload?.album_id) {
      navigate(`/project/${n.payload.project_id}/submissions/${n.payload.album_id}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className="absolute right-0 top-full mt-2 w-96 max-h-[80vh] overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-slate-200 dark:border-gray-700 z-50 flex flex-col"
        style={{ minWidth: "20rem" }}
      >
        <div className="p-3 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between">
          <span className="font-bold text-slate-900 dark:text-white">
            Notifications
          </span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => {
                markAllNotificationsRead().then(() => {
                  queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
                });
              }}
              className="text-xs font-medium text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-slate-500 dark:text-gray-400 text-sm">
              No notifications yet.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-gray-700">
              {notifications.map((n) => {
                const isClickable =
                  n.type === "album_submitted" &&
                  n.payload?.project_id != null &&
                  Boolean(n.payload?.album_id);
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer disabled:cursor-default"
                      onClick={() => isClickable && handleNotificationClick(n)}
                    >
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-slate-600 dark:text-gray-300 text-sm mt-0.5">
                          {n.body}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                        {formatNotificationTime(n.created_at)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};
