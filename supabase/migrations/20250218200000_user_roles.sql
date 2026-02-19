-- User roles for RBAC: creator (studio owner) vs client (event viewer).
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('creator', 'client')),
  created_at timestamptz not null default now()
);

create index if not exists idx_user_roles_role on public.user_roles(role);

alter table public.user_roles enable row level security;

-- Users can read their own role.
create policy "Users can select own role"
  on public.user_roles for select
  using (user_id = auth.uid());

-- Users can insert their own row (first-time role choice).
create policy "Users can insert own role"
  on public.user_roles for insert
  with check (user_id = auth.uid());

-- Users can update their own row (optional: allow role change).
create policy "Users can update own role"
  on public.user_roles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
