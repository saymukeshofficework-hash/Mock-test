-- Technology Blog — admin publishing schema for Supabase (Postgres + Auth + RLS)
--
-- Lives in the SAME Supabase project as TET Test Hub's schema.sql (to stay within the
-- free-tier 2-project limit). Already applied directly via the Supabase MCP tools —
-- this file is committed as the record of what was run and how to reproduce it.
-- See TECH_BLOG_ADMIN_INSTRUCTIONS.md for the full one-time setup walkthrough.
--
-- Design notes:
--   * One human admin publishes the blog by pasting a complete article file (front
--     matter + body, in the exact format of tech-blog/templates/article-template.md)
--     into a form at /tech-blog/admin/ after logging in. The raw text is stored as-is
--     and later written verbatim to src/content/posts/<slug>.md by
--     tech-blog/scripts/sync-admin-posts.mjs during the next site build — so it goes
--     through the exact same Zod schema validation and rendering as every other
--     article, no separate code path.
--   * This table is completely unrelated to student accounts, but a logged-in student
--     is a real `authenticated` Supabase user too (same project). Write access here is
--     deliberately gated by a specific admin email, not just "any authenticated user"
--     — otherwise any student could publish or delete blog posts. Change the email
--     below (in both policies) if the admin account should use a different address.
--   * Publishing (insert/update with status='published') is meant to also trigger a
--     GitHub Actions rebuild via a Supabase Database Webhook configured in the
--     dashboard (Database -> Webhooks) — see TECH_BLOG_ADMIN_INSTRUCTIONS.md. That
--     webhook holds the GitHub token; nothing here or in the repo ever sees it.

create table if not exists blog_submissions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  raw_markdown text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table blog_submissions enable row level security;

-- Anyone (including the anon key the build uses) can read published posts — this is
-- how tech-blog/scripts/sync-admin-posts.mjs fetches them at build time.
drop policy if exists "blog_submissions_select_published" on blog_submissions;
create policy "blog_submissions_select_published"
  on blog_submissions for select
  using (status = 'published');

-- Only the admin account (matched by email — see note above) may create, read
-- drafts, edit, or delete submissions.
drop policy if exists "blog_submissions_admin_all" on blog_submissions;
create policy "blog_submissions_admin_all"
  on blog_submissions for all
  using (auth.jwt() ->> 'email' = 'saymukeshofficework@gmail.com')
  with check (auth.jwt() ->> 'email' = 'saymukeshofficework@gmail.com');

-- Keep updated_at current on every edit.
create or replace function public.blog_submissions_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_submissions_updated_at on blog_submissions;
create trigger blog_submissions_updated_at
  before update on blog_submissions
  for each row
  execute function public.blog_submissions_set_updated_at();
