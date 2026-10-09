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
  using ((select auth.uid()) = user_id);

create policy user_app_data_insert_own
  on public.user_app_data
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy user_app_data_update_own
  on public.user_app_data
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Minimal directory fields used by Social Links. Private app data stays in user_app_data.
create table if not exists public.social_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  photo_url text,
  city text not null default '',
  streak_count integer not null default 0 check (streak_count >= 0),
  updated_at timestamptz not null default now()
);

-- Seed the directory for accounts that already have a saved profile.
insert into public.social_profiles (user_id, display_name, photo_url, city, streak_count)
select user_id,
       coalesce(nullif(data #>> '{profile,name}', ''), 'Player'),
       nullif(data #>> '{profile,photo}', ''),
       coalesce(data #>> '{profile,location}', ''),
       greatest(coalesce(nullif(data #>> '{streak,current}', '')::integer, 0), 0)
  from public.user_app_data
 where data #> '{profile}' is not null
on conflict (user_id) do nothing;

-- Keep the small social directory in sync with account data, including older app clients.
create or replace function public.sync_social_profile_from_app_data()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.data #> '{profile}' is null or new.data #> '{profile}' = 'null'::jsonb then
    return new;
  end if;
  if tg_op = 'UPDATE'
     and old.data #> '{profile}' is not distinct from new.data #> '{profile}'
     and old.data #> '{streak,current}' is not distinct from new.data #> '{streak,current}' then
    return new;
  end if;

  insert into public.social_profiles (user_id, display_name, photo_url, city, streak_count, updated_at)
  values (
    new.user_id,
    coalesce(nullif(new.data #>> '{profile,name}', ''), 'Player'),
    nullif(new.data #>> '{profile,photo}', ''),
    coalesce(new.data #>> '{profile,location}', ''),
    greatest(coalesce(nullif(new.data #>> '{streak,current}', '')::integer, 0), 0),
    now()
  )
  on conflict (user_id) do update set
    display_name = excluded.display_name,
    photo_url = excluded.photo_url,
    city = excluded.city,
    streak_count = excluded.streak_count,
    updated_at = excluded.updated_at;
  return new;
end;
$$;
revoke all on function public.sync_social_profile_from_app_data() from public, anon;
grant execute on function public.sync_social_profile_from_app_data() to authenticated;

drop trigger if exists sync_social_profile_after_app_data_write on public.user_app_data;
create trigger sync_social_profile_after_app_data_write
  after insert or update of data on public.user_app_data
  for each row execute function public.sync_social_profile_from_app_data();

alter table public.social_profiles enable row level security;
revoke all on table public.social_profiles from public, anon, authenticated;
grant select, insert, update on table public.social_profiles to authenticated;

drop policy if exists social_profiles_select_authenticated on public.social_profiles;
drop policy if exists social_profiles_insert_own on public.social_profiles;
drop policy if exists social_profiles_update_own on public.social_profiles;
create policy social_profiles_select_authenticated on public.social_profiles
  for select to authenticated using (true);
create policy social_profiles_insert_own on public.social_profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy social_profiles_update_own on public.social_profiles
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users (id) on delete cascade,
  receiver_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint friend_requests_distinct_users check (requester_id <> receiver_id),
  constraint friend_requests_unique_pair unique (requester_id, receiver_id)
);

alter table public.friend_requests enable row level security;
revoke all on table public.friend_requests from public, anon, authenticated;
grant select, insert, delete on table public.friend_requests to authenticated;
grant update (status, responded_at) on table public.friend_requests to authenticated;

drop policy if exists friend_requests_select_participant on public.friend_requests;
drop policy if exists friend_requests_insert_requester on public.friend_requests;
drop policy if exists friend_requests_update_receiver_pending on public.friend_requests;
drop policy if exists friend_requests_delete_pending_requester on public.friend_requests;
create policy friend_requests_select_participant on public.friend_requests
  for select to authenticated using ((select auth.uid()) in (requester_id, receiver_id));
create policy friend_requests_insert_requester on public.friend_requests
  for insert to authenticated with check ((select auth.uid()) = requester_id and status = 'pending');
create policy friend_requests_update_receiver_pending on public.friend_requests
  for update to authenticated
  using ((select auth.uid()) = receiver_id and status = 'pending')
  with check ((select auth.uid()) = receiver_id and status in ('accepted', 'declined'));
create policy friend_requests_delete_pending_requester on public.friend_requests
  for delete to authenticated using ((select auth.uid()) = requester_id and status = 'pending');

create index if not exists friend_requests_receiver_status_idx
  on public.friend_requests (receiver_id, status);
create index if not exists friend_requests_requester_status_idx
  on public.friend_requests (requester_id, status);

-- Tell PostgREST to refresh its schema cache so the new table is visible to the client.
notify pgrst, 'reload schema';

commit;
