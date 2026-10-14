-- TET Test Hub: one active login session per account
-- Run this additive migration in Supabase Dashboard -> SQL Editor.
-- No automatic expiry: the account remains reserved until logout. If a device is lost,
-- use the admin recovery query at the bottom after verifying the account owner.

create table if not exists public.active_login_sessions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  session_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.active_login_sessions enable row level security;
revoke all on table public.active_login_sessions from anon, authenticated;

create or replace function public.claim_my_login_session()
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_session_id text := auth.jwt() ->> 'session_id';
  v_rows integer;
begin
  if v_user_id is null or v_session_id is null or v_session_id = '' then
    return false;
  end if;

  insert into public.active_login_sessions(user_id, session_id, created_at, updated_at)
  values (v_user_id, v_session_id, now(), now())
  on conflict (user_id) do update
    set session_id = excluded.session_id, updated_at = now()
    where public.active_login_sessions.session_id = excluded.session_id;

  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

create or replace function public.release_my_login_session()
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_session_id text := auth.jwt() ->> 'session_id';
  v_rows integer;
begin
  if v_user_id is null or v_session_id is null or v_session_id = '' then
    return false;
  end if;

  delete from public.active_login_sessions
  where user_id = v_user_id and session_id = v_session_id;

  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

revoke all on function public.claim_my_login_session() from public, anon;
revoke all on function public.release_my_login_session() from public, anon;
grant execute on function public.claim_my_login_session() to authenticated;
grant execute on function public.release_my_login_session() to authenticated;

-- ADMIN RECOVERY ONLY (run manually after confirming the account owner):
-- delete from public.active_login_sessions where user_id = '<auth.users UUID>'::uuid;
