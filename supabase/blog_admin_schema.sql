-- Technology Blog — admin publishing schema for Supabase (Postgres + Auth + RLS)
--
-- Lives in the SAME Supabase project as TET Test Hub's schema.sql (to stay within the
-- free-tier 2-project limit). Already applied directly via the Supabase MCP tools —
-- this file is committed as the record of what was run and how to reproduce it.
-- See TECH_BLOG_ADMIN_INSTRUCTIONS.md for the full walkthrough.
--
-- Design notes:
--   * The admin publishes the blog by pasting a complete article file (front matter +
--     body, in the exact format of tech-blog/templates/article-template.md) into a
--     form at /tech-blog/admin/ after logging in. The raw text is stored as-is and
--     later written verbatim to src/content/posts/<slug>.md by
--     tech-blog/scripts/sync-admin-posts.mjs during the next site build — so it goes
--     through the exact same Zod schema validation and rendering as every other
--     article, no separate code path.
--   * Login uses a plain "Admin ID" (admin1 / admin2), not a real email — Supabase
--     Auth only accepts emails, so tech-blog/src/lib/supabase-admin.ts maps each ID to
--     a synthetic address under @blog-admin.tettesthub.app (mirroring how the root
--     site's studentEmailDomain works for Student IDs). Both accounts were created
--     directly with a password; neither address is ever emailed.
--   * This table is completely unrelated to student accounts, but a logged-in student
--     is a real `authenticated` Supabase user too (same project). Write access here is
--     deliberately gated to these two specific admin emails, not just "any
--     authenticated user" — otherwise any student could publish or delete blog posts.
--     To add or remove an admin, edit the email list in both policies below and
--     create/delete the matching auth.users row.
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

-- Only the two admin accounts (matched by email — see note above) may create, read
-- drafts, edit, or delete submissions.
drop policy if exists "blog_submissions_admin_all" on blog_submissions;
create policy "blog_submissions_admin_all"
  on blog_submissions for all
  using (auth.jwt() ->> 'email' in ('admin1@blog-admin.tettesthub.app', 'admin2@blog-admin.tettesthub.app'))
  with check (auth.jwt() ->> 'email' in ('admin1@blog-admin.tettesthub.app', 'admin2@blog-admin.tettesthub.app'));

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

-- The two admin accounts themselves — already created directly via SQL (auth.users +
-- auth.identities) with generated passwords, communicated to the site owner
-- separately. Included here only as a record of what exists; re-running this exact
-- insert would fail (duplicate email) and isn't needed. To add a third account, use
-- the Supabase Dashboard (Authentication -> Users -> Add user) with an email under
-- @blog-admin.tettesthub.app, then add that email to both policies above.
