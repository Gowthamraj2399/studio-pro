/**
 * Event gallery (user-facing) config.
 * Kept in one place so the module can be moved to a separate project or microfrontend later.
 */
export const eventGalleryConfig = {
  routePath: "/event/:token",
  myEventsPath: "/user/events",
} as const;
