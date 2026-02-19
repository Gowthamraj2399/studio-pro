-- Project photos table: stores metadata for images uploaded to Cloudinary.
-- Actual file storage is on Cloudinary; this table holds url, public_id, filename per project.
create table if not exists public.project_photos (
  id uuid primary key default gen_random_uuid(),
  project_id bigint not null references public.projects(id) on delete cascade,
  url text not null,
  filename text not null,
  public_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_project_photos_project_id on public.project_photos(project_id);
create index if not exists idx_project_photos_created_at on public.project_photos(created_at desc);

alter table public.project_photos enable row level security;

-- RLS: users can only access project_photos for projects they own.
create policy "Users can view project_photos for own projects"
  on public.project_photos for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_photos.project_id and p.user_id = auth.uid()
    )
  );

create policy "Users can insert project_photos for own projects"
  on public.project_photos for insert
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_photos.project_id and p.user_id = auth.uid()
    )
  );

create policy "Users can delete project_photos for own projects"
  on public.project_photos for delete
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_photos.project_id and p.user_id = auth.uid()
    )
  );
