-- Per-project Cloudinary credentials (optional). When set, used for upload/display; else env fallback.
alter table public.projects
  add column if not exists cloudinary_cloud_name text,
  add column if not exists cloudinary_upload_preset text;

-- Return cloudinary fields from get_event_by_token so event gallery can use project cloud for display.
create or replace function public.get_event_by_token(share_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  pid bigint;
  proj json;
  photos json;
  result json;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select project_id into pid
  from public.project_share_links
  where token = share_token
  limit 1;

  if pid is null then
    raise exception 'Invalid or expired link';
  end if;

  insert into public.event_access (project_id, user_id)
  values (pid, auth.uid())
  on conflict (project_id, user_id) do nothing;

  select to_json(p.*) into proj
  from (
    select id, project_name, project_date, client_name, cover_url, created_at, album_size,
           cloudinary_cloud_name, cloudinary_upload_preset
    from public.projects
    where id = pid
  ) p;

  select coalesce(json_agg(pp.*), '[]'::json) into photos
  from (
    select id, project_id, url, filename, public_id, created_at
    from public.project_photos
    where project_id = pid
    order by created_at desc
  ) pp;

  result := json_build_object('project', proj, 'photos', photos);
  return result;
end;
$$;

-- Return cloudinary_cloud_name from get_submitted_album_with_photos so creator view can display photos.
create or replace function public.get_submitted_album_with_photos(p_album_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  rec record;
  proj json;
  alb json;
  photos json;
  result json;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select ua.id, ua.submitted_at, ua.user_id as submitted_by_user_id,
         p.id as project_id, p.project_name, p.project_date, p.client_name, p.cover_url,
         p.cloudinary_cloud_name
  into rec
  from public.user_albums ua
  join public.projects p on p.id = ua.project_id
  where ua.id = p_album_id
    and ua.status = 'submitted'
    and p.user_id = auth.uid();

  if rec.id is null then
    return null;
  end if;

  proj := json_build_object(
    'id', rec.project_id,
    'project_name', rec.project_name,
    'project_date', rec.project_date,
    'client_name', rec.client_name,
    'cover_url', rec.cover_url,
    'cloudinary_cloud_name', rec.cloudinary_cloud_name
  );

  alb := json_build_object(
    'id', rec.id,
    'submitted_at', rec.submitted_at,
    'submitted_by_user_id', rec.submitted_by_user_id
  );

  select coalesce(json_agg(pp.*), '[]'::json) into photos
  from (
    select pp2.id, pp2.url, pp2.filename, pp2.public_id
    from public.user_album_photos uap
    join public.project_photos pp2 on pp2.id = uap.photo_id
    where uap.album_id = p_album_id
    order by uap.created_at
  ) pp;

  result := json_build_object('project', proj, 'album', alb, 'photos', photos);
  return result;
end;
$$;
