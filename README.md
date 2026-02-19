# Studio Pro

A photography management platform for professional studios: manage projects (events), upload and organize photos, share galleries with clients, and let clients submit their selections.

## Features

- **Authentication** — Sign in with Supabase Auth (e.g. email/password).
- **Roles** — Choose **creator** (studio) or **client**; creators get dashboard and project management, clients get event access via share links.
- **Projects** — Create projects with name, date, client, and cover image (stored in Supabase Storage).
- **Project photos** — Upload photos to Cloudinary; metadata (URLs, `public_id`) stored in Supabase. Grid view, delete single/bulk.
- **Share links** — Generate shareable links per project; clients open the link to get view access.
- **Event gallery** — Clients see project photos and build a personal album; submit selection to notify the creator.
- **Notifications** — Creators see when a client submits an album.
- **My Events / My Bookmarks** — Clients see events they have access to and their saved selections.

## Tech stack

- **React 19** + **TypeScript** + **Vite**
- **TanStack Query** — Server state and cache
- **React Router** — Hash-based routing
- **Tailwind CSS** — Styling
- **Supabase** — Auth, Postgres (projects, photos metadata, roles, share links, albums, notifications), Storage (cover images)
- **Cloudinary** — Project photo storage and delivery (unsigned upload preset)

## Prerequisites

- **Node.js** (LTS recommended)
- **Supabase** project
- **Cloudinary** account

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` or `.env.local` and set:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL (Project Settings → API) |
| `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase anon (public) key |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary **unsigned** upload preset name |
| `GEMINI_API_KEY` | (Optional) For AI Assistant features |

Restart the dev server after changing env vars.

### 3. Run the app

```bash
npm run dev
```

---

## Supabase setup

### Migrations

Run all migrations in order so the database has the required tables and RLS. Use either:

- **Supabase CLI:** `supabase db push` from the project root, or  
- **SQL Editor:** Run each file in the Supabase Dashboard in this order:

| Order | File | Description |
|-------|------|-------------|
| 1 | `supabase/migrations/20250217000000_create_projects.sql` | `projects` table |
| 2 | `supabase/migrations/20250218000000_create_project_photos.sql` | `project_photos` table |
| 3 | `supabase/migrations/20250218100000_share_links_and_event_access.sql` | Share links, `event_access`, `get_event_by_token` RPC |
| 4 | `supabase/migrations/20250218110000_user_albums_and_notifications.sql` | User albums, notifications, `submit_album` RPC |
| 5 | `supabase/migrations/20250218200000_user_roles.sql` | `user_roles` table (creator/client) |

### Storage

In Supabase Dashboard → **Storage**, create a **public** bucket named **`cover_photos`**. This is used for project cover images.

### Authentication

In **Authentication → Providers**, enable the sign-in methods you need (e.g. Email).

---

## Cloudinary setup

1. In [Cloudinary Dashboard](https://console.cloudinary.com), go to **Settings → Upload → Upload presets**.
2. **Add upload preset** — set **Signing Mode** to **Unsigned**.
3. Use the preset name in `.env` as `VITE_CLOUDINARY_UPLOAD_PRESET` (e.g. `project_photos`).

Project photo files are stored in Cloudinary; Supabase only stores metadata (URL, `public_id`, etc.).

---

## Connecting to a new Supabase & Cloudinary

No code changes are required. Use a new project/account and point the app via env vars.

### Environment variables

| Variable | Where to get it |
|----------|-----------------|
| `VITE_SUPABASE_URL` | New project → Project Settings → API → Project URL |
| `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Same → Project API keys → **anon** key |
| `VITE_CLOUDINARY_CLOUD_NAME` | New cloud → Dashboard or Settings |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Settings → Upload → Upload presets → create **unsigned** preset |

### New Supabase project

- Run all [migrations](#migrations) in order.
- Enable Auth providers (e.g. Email).
- Create the **`cover_photos`** storage bucket (public).

### New Cloudinary account

- Create an **unsigned** upload preset and set `VITE_CLOUDINARY_UPLOAD_PRESET` to its name.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Vite) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |

---

## Project structure (overview)

- **`App.tsx`** — Router, auth sync, role-based route protection (sign-in, choose role, creator vs client routes).
- **`lib/`** — Supabase client, Cloudinary helpers, auth, projects, project photos, share links, event access, user albums, notifications, user roles.
- **`views/`** — SignIn, ChooseRole, Dashboard, CreateProject, UploadPhotos, EventGallery, MyEvents, MyBookmarks.
- **`components/`** — Sidebar, Header, shared UI (modals, toasts, etc.).
- **`supabase/migrations/`** — SQL migrations; run in order by filename.

---

## Before publishing as a public repo

- **Do not commit** `.env` or `.env.local` — they are in `.gitignore`. Only `.env.example` (placeholders only) should be committed.
- **Remove `ui/.env` from git** if it was ever committed: run `git rm --cached ui/.env` (if the path exists in your repo) and commit the change. If that file ever contained real keys, consider rotating them and optionally rewriting history to remove the file from past commits.
- **No secrets in code** — Supabase and Cloudinary are configured via `import.meta.env.VITE_*`; Gemini uses `process.env.GEMINI_API_KEY` from env. No keys are hardcoded in the repo.
