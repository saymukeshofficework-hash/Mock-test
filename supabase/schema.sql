-- TET Test Hub — database schema for Supabase (Postgres + Auth + RLS)
--
-- Run this ONCE in your Supabase project's SQL Editor (Dashboard -> SQL Editor -> New query),
-- after creating the project, before anything else. See ADMIN_INSTRUCTIONS.md for the full
-- setup walkthrough.
--
-- Design notes:
--   * Students log in with a "Student ID" (e.g. TET26001), not an email. Supabase Auth only
--     accepts emails, so the frontend maps each Student ID to a synthetic address
--     "<student_id>@students.tettesthub.app" (see js/site-config.js STUDENT_EMAIL_DOMAIN).
--     That address is never actually emailed — accounts are created manually in the
--     Dashboard with "Auto Confirm User" checked.
--   * profiles.id = auth.users.id (one profile row per login).
--   * test_content holds the actual exam questions. Row Level Security is the real
--     access-control boundary: a browser can only fetch a test's questions if the logged-in
--     user's profile lists that test in purchased_tests AND is active. This is enforced by
--     Postgres itself, not by JavaScript, so hiding a "Start Test" button is not what
--     protects the content — this policy is.
--   * No INSERT/UPDATE/DELETE policies are defined for students on either table. Only you,
--     using the Supabase Table Editor (which connects as an admin/service role and bypasses
--     RLS), can create accounts or edit purchases. The public anon key used by the website
--     can never write to these tables.

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  student_id text unique not null,
  full_name text not null default '',
  package text not null default '',            -- free-text label shown on the dashboard, e.g. "All 20 Tests" or "Test 01"
  purchased_tests text[] not null default '{}', -- e.g. '{test01,test05}' or all 20 ids for the All-20 package
  status text not null default 'active' check (status in ('active','disabled')),
  created_at timestamptz not null default now()
);

create table if not exists test_content (
  test_id text primary key,        -- 'test01' .. 'test20'
  title text not null,
  question_count integer not null,
  duration_minutes integer not null,
  questions jsonb not null         -- the same `sections` array the exam engine already expects
);

alter table profiles enable row level security;
alter table test_content enable row level security;

-- A logged-in student may read only their own profile row.
drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own"
  on profiles for select
  using (id = auth.uid());

-- A logged-in student may read a test's questions only if it's in their purchased_tests
-- and their account is active. Anonymous (not logged in) requests never match this policy.
drop policy if exists "test_content_select_purchased" on test_content;
create policy "test_content_select_purchased"
  on test_content for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.status = 'active'
        and test_content.test_id = any (p.purchased_tests)
    )
  );

-- Deliberately no insert/update/delete policies for the `anon` or `authenticated` roles on
-- either table: students can never create accounts, change their own purchases, or edit
-- question content from the browser. All writes happen through the Supabase Table Editor
-- (Dashboard) using your own admin login, which connects with a role that bypasses RLS.
