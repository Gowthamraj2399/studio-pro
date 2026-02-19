-- RPC: Reopen a submitted album (set back to draft) so the client can change selection and resubmit.
-- Only allowed if the current user owns the album's project.
create or replace function public.reopen_submitted_album(p_album_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.user_albums ua
  set status = 'draft', submitted_at = null
  from public.projects p
  where ua.id = p_album_id
    and ua.project_id = p.id
    and p.user_id = auth.uid()
    and ua.status = 'submitted';

  if not found then
    raise exception 'Album not found or not allowed to reopen';
  end if;
end;
$$;
