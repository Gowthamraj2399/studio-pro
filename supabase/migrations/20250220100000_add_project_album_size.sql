-- Optional max number of photos a client can add to their album for this project.
-- Null = unlimited.
alter table public.projects
  add column if not exists album_size integer;

-- Return album_size from get_event_by_token so clients can enforce and display the limit.
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
    select id, project_name, project_date, client_name, cover_url, created_at, album_size
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
