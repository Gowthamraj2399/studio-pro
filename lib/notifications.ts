import { supabase } from "./supabase";
import type { Notification } from "../types";

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

function mapRowToNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    user_id: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    payload: (row.payload ?? {}) as Notification["payload"],
    read_at: row.read_at,
    created_at: row.created_at,
  };
}

export const notificationsQueryKey = ["notifications"] as const;

export async function fetchNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, user_id, type, title, body, payload, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message || "Failed to load notifications.");
  }

  return (data ?? []).map(mapRowToNotification as (r: NotificationRow) => Notification);
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(error.message || "Failed to mark notification as read.");
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return;

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);
}
