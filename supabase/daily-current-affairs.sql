-- Run once in SQL Editor of the exam-hub Supabase project (znulepzdihzhjmuvyroi).
-- GitHub Actions service role writes; anonymous visitors can only read published content.
create table if not exists public.daily_current_affairs (
  day date primary key,
  content jsonb not null,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.daily_current_affairs enable row level security;
drop policy if exists "Public read published current affairs" on public.daily_current_affairs;
create policy "Public read published current affairs" on public.daily_current_affairs
  for select to anon, authenticated using (published = true);
grant select on public.daily_current_affairs to anon, authenticated;
