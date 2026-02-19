-- RPC: List projects (owned by current user) that have at least one submitted album.
-- Returns JSON array of { project_id, project_name, albums: [{ album_id, submitted_at, submitted_by_user_id }] }.
create or replace function public.get_creator_submissions()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(
    json_agg(
      json_build_object(
        'project_id', p.id,
        'project_name', p.project_name,
        'albums', sub.albums
      )
      order by (select max((a->>'submitted_at')::timestamptz) from json_array_elements(sub.albums) as a) desc nulls last
    ),
    '[]'::json
  ) into result
  from (
    select ua.project_id, json_agg(
      json_build_object(
        'album_id', ua.id,
        'submitted_at', ua.submitted_at,
        'submitted_by_user_id', ua.user_id
      )
      order by ua.submitted_at desc
    ) as albums
    from public.user_albums ua
    where ua.status = 'submitted'
      and exists (
        select 1 from public.projects p
        where p.id = ua.project_id and p.user_id = auth.uid()
      )
    group by ua.project_id
  ) sub
  join public.projects p on p.id = sub.project_id;

  return result;
end;
$$;

-- RPC: Get a single submitted album with its photos. Only allowed if current user owns the project.
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
         p.id as project_id, p.project_name, p.project_date, p.client_name, p.cover_url
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
    'cover_url', rec.cover_url
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
