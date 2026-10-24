-- Android app star ratings (popup in examhelp/public/app-mode.js). Public can insert only; owner reads in Supabase.
create table if not exists public.app_ratings (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  stars smallint not null check (stars between 1 and 5),
  name text check (char_length(name) <= 100),
  user_id uuid default auth.uid()
);
alter table public.app_ratings enable row level security;
create policy "anyone can add a rating" on public.app_ratings
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
grant insert (stars, name) on public.app_ratings to anon, authenticated;
