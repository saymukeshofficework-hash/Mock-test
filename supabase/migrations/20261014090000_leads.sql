-- Leads from the group landing pages (/free/): name + WhatsApp number asked
-- before the free test 01 result (js/lead-gate.js). Anon can only insert;
-- nobody can read rows through the API (view them in the Supabase dashboard).
create table if not exists public.leads (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 60),
  phone text not null check (phone ~ '^[6-9][0-9]{9}$'),
  exam text not null check (char_length(exam) <= 40),
  test_id text check (char_length(test_id) <= 40),
  source text check (char_length(source) <= 30),
  created_at timestamptz not null default now()
);
alter table public.leads enable row level security;
drop policy if exists leads_insert on public.leads;
create policy leads_insert on public.leads for insert to anon, authenticated with check (true);
revoke all on public.leads from anon, authenticated;
grant insert on public.leads to anon, authenticated;
