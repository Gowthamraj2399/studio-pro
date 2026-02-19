-- User albums: one per user per project; status draft | submitted.
create table if not exists public.user_albums (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id bigint not null references public.projects(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, project_id)
);

create index if not exists idx_user_albums_user_id on public.user_albums(user_id);
create index if not exists idx_user_albums_project_id on public.user_albums(project_id);

alter table public.user_albums enable row level security;

create policy "Users can manage own albums"
  on public.user_albums for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Which photos are in each album.
create table if not exists public.user_album_photos (
  album_id uuid not null references public.user_albums(id) on delete cascade,
  photo_id uuid not null references public.project_photos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (album_id, photo_id)
);

create index if not exists idx_user_album_photos_album_id on public.user_album_photos(album_id);

alter table public.user_album_photos enable row level security;

create policy "Users can manage own album photos"
  on public.user_album_photos for all
  using (
    exists (
      select 1 from public.user_albums ua
      where ua.id = user_album_photos.album_id and ua.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.user_albums ua
      where ua.id = user_album_photos.album_id and ua.user_id = auth.uid()
    )
  );

-- Notifications for creators (e.g. album submitted).
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  payload jsonb default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_read_at on public.notifications(user_id, read_at);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);

alter table public.notifications enable row level security;

create policy "Users can view and update own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can update own notifications (mark read)"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Allow insert for any authenticated user (caller will insert for project owner).
create policy "Authenticated can insert notifications"
  on public.notifications for insert
  to authenticated
  with check (true);

-- RPC: submit album and notify project owner.
create or replace function public.submit_album(album_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rec record;
  owner_id uuid;
  project_title text;
  submitter_email text;
  notif_title text;
  notif_body text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select ua.id, ua.user_id, ua.project_id, p.user_id as owner_id, coalesce(p.project_name, 'Event') as title
  into rec
  from public.user_albums ua
  join public.projects p on p.id = ua.project_id
  where ua.id = album_uuid and ua.user_id = auth.uid();

  if rec.id is null then
    raise exception 'Album not found or access denied';
  end if;

  if rec.user_id is null or rec.owner_id is null then
    raise exception 'Invalid album or project';
  end if;

  update public.user_albums
  set status = 'submitted', submitted_at = now()
  where id = album_uuid and user_id = auth.uid();

  select email into submitter_email from auth.users where id = auth.uid();
  project_title := rec.title;
  notif_title := 'Album submitted';
  notif_body := coalesce(split_part(submitter_email, '@', 1), 'A guest') || ' submitted their photo selection for ' || project_title;

  insert into public.notifications (user_id, type, title, body, payload)
  values (
    rec.owner_id,
    'album_submitted',
    notif_title,
    notif_body,
    jsonb_build_object(
      'album_id', album_uuid,
      'project_id', rec.project_id,
      'submitted_by_user_id', auth.uid()
    )
  );
end;
$$;
