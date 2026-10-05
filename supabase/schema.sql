-- DaySona account data migration. Safe to run again; existing rows are preserved.
begin;

create table if not exists public.user_app_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_app_data enable row level security;

-- Do not rely on Supabase's default table grants.
revoke all on table public.user_app_data from public, anon, authenticated;
grant select, insert, update on table public.user_app_data to authenticated;

-- Remove the earlier combined policy, which also allowed deleting one's row.
drop policy if exists user_app_data_access_own_rows on public.user_app_data;
drop policy if exists user_app_data_select_own on public.user_app_data;
drop policy if exists user_app_data_insert_own on public.user_app_data;
drop policy if exists user_app_data_update_own on public.user_app_data;

create policy user_app_data_select_own
  on public.user_app_data
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy user_app_data_insert_own
  on public.user_app_data
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy user_app_data_update_own
  on public.user_app_data
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tell PostgREST to refresh its schema cache so the new table is visible to the client.
notify pgrst, 'reload schema';

commit;
