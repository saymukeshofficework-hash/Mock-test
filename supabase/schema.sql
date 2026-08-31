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
--     user's profile lists that test in purchased_tests AND is active — except test01 and
--     test02, which are free and openly readable by anyone, logged in or not (no login wall
--     on the free tests, matching FREE_TESTS in js/site-config.js). This is enforced by
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

-- test01 and test02 are free and readable by anyone (no login required) to match the
-- "try 2 free tests" flow on the home page. Every other test requires a logged-in,
-- active student whose purchased_tests includes that test.
drop policy if exists "test_content_select_purchased" on test_content;
create policy "test_content_select_purchased"
  on test_content for select
  using (
    test_content.test_id in ('test01', 'test02')
    or exists (
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

-- ---------------------------------------------------------------------------------------
-- Question delivery and scoring
--
-- IMPORTANT: test_content.questions embeds the correct `answer` index in the same object
-- as the question text, for every question. A frontend that does `select('questions')`
-- and scores client-side (the original design) therefore ships the entire answer key to
-- the browser the moment a test loads — visible in DevTools before the student answers a
-- single question. That defeats the whole point of a practice test. The two functions
-- below fix this: the browser never receives an `answer` field, and scoring happens in
-- Postgres, which is the only place that ever sees the real answer key.
--
-- Both functions are SECURITY INVOKER (the default — no `security definer` here), so they
-- run as the calling role and the `test_content_select_purchased` policy above still
-- applies inside them exactly as it does to a direct query. A student who isn't allowed to
-- read a test still can't read it through these functions either.

-- Returns a test's sections/questions with the `answer` field stripped out of every
-- question. This is what the exam pages should fetch instead of `select('questions')`.
create or replace function public.get_test_questions(p_test_id text)
returns jsonb
language sql
stable
as $$
  select (
    select jsonb_agg(
      jsonb_build_object(
        'name', sec->>'name',
        'mode', sec->>'mode',
        'questions', (
          select coalesce(jsonb_agg(q - 'answer'), '[]'::jsonb)
          from jsonb_array_elements(sec->'questions') q
        )
      )
    )
    from jsonb_array_elements(tc.questions) sec
  )
  from public.test_content tc
  where tc.test_id = p_test_id;
$$;

-- Scores a completed attempt server-side against the real answer key.
-- p_answers: one array per section (same order as the test's sections), each holding the
-- selected option index per question in that section, or null for an unattempted question
-- — i.e. exactly the shape of tet-engine.js's `state`, with each cell reduced to `.selected`.
-- Returns { score, totalCorrect, totalIncorrect, totalUnattempted, rows: [{name, total, c, ic, un}, ...] }.
create or replace function public.score_test_attempt(p_test_id text, p_answers jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  v_questions jsonb;
  sec jsonb;
  sec_idx int := 0;
  q jsonb;
  q_idx int;
  sel jsonb;
  total_correct int := 0;
  total_incorrect int := 0;
  total_unattempted int := 0;
  total_score int := 0;
  rows jsonb := '[]'::jsonb;
  sec_c int; sec_ic int; sec_un int;
begin
  select tc.questions into v_questions
  from public.test_content tc
  where tc.test_id = p_test_id;

  if v_questions is null then
    raise exception 'test not found or not accessible';
  end if;

  for sec in select * from jsonb_array_elements(v_questions)
  loop
    sec_c := 0; sec_ic := 0; sec_un := 0;
    q_idx := 0;
    for q in select * from jsonb_array_elements(sec->'questions')
    loop
      sel := p_answers -> sec_idx -> q_idx;
      if sel is null or sel = 'null'::jsonb then
        sec_un := sec_un + 1;
      elsif (sel)::int = (q->>'answer')::int then
        sec_c := sec_c + 1;
        total_score := total_score + 1;
      else
        sec_ic := sec_ic + 1;
      end if;
      q_idx := q_idx + 1;
    end loop;
    total_correct := total_correct + sec_c;
    total_incorrect := total_incorrect + sec_ic;
    total_unattempted := total_unattempted + sec_un;
    rows := rows || jsonb_build_array(jsonb_build_object(
      'name', sec->>'name', 'total', jsonb_array_length(sec->'questions'),
      'c', sec_c, 'ic', sec_ic, 'un', sec_un
    ));
    sec_idx := sec_idx + 1;
  end loop;

  return jsonb_build_object(
    'score', total_score,
    'totalCorrect', total_correct,
    'totalIncorrect', total_incorrect,
    'totalUnattempted', total_unattempted,
    'rows', rows
  );
end;
$$;

grant execute on function public.get_test_questions(text) to anon, authenticated;
grant execute on function public.score_test_attempt(text, jsonb) to anon, authenticated;
