# Technology Blog — Admin Publishing Panel

A login-gated page at `/tech-blog/admin/` where you paste a complete article (front
matter + Markdown/HTML body, same format as
[`tech-blog/templates/article-template.md`](./tech-blog/templates/article-template.md))
and it gets published to the live site. No separate CMS, no database of its own beyond
one small table — see [`supabase/blog_admin_schema.sql`](./supabase/blog_admin_schema.sql)
for exactly what it stores and why.

## How it works

1. You log in at `/tech-blog/admin/login/` with the admin account you create below.
2. You paste an article and click **Save as draft** or **Publish now**. This writes one
   row to the `blog_submissions` table in Supabase (the same project TET Test Hub
   already uses) — nothing touches the repo yet.
3. On the next site build, `tech-blog/scripts/sync-admin-posts.mjs` fetches every
   `status = 'published'` row and writes it verbatim to
   `tech-blog/src/content/posts/<slug>.md`. From there it's a completely normal
   article — validated by `scripts/validate-content.mjs` and rendered by
   `ArticleLayout.astro` exactly like the three demo articles.
4. A build happens automatically on every push to `main`, or instantly after
   publishing if you set up the optional webhook in step 3 below.

## One-time setup

### 1. Create your admin login
In the **tet-test-hub** Supabase project (Dashboard -> Authentication -> Users -> Add
user):
- Email: an address you control — RLS is currently locked to
  `saymukeshofficework@gmail.com` (see the two policies in
  `supabase/blog_admin_schema.sql`). If you want to use a different address, update
  both `auth.jwt() ->> 'email' = '...'` lines there and re-run them in the SQL Editor.
- Password: whatever you'll sign in with at `/tech-blog/admin/login/`.
- Check **"Auto Confirm User"** (same as student accounts — there's no real inbox to
  confirm from).

This does **not** grant test-series admin access or vice versa — it's a completely
separate permission, scoped to the `blog_submissions` table only.

### 2. Add the two GitHub repo secrets
**Settings -> Secrets and variables -> Actions -> New repository secret**, add both:

| Name | Value |
|---|---|
| `TECH_BLOG_SUPABASE_URL` | `https://ovaubhekxjtkodkhsybg.supabase.co` |
| `TECH_BLOG_SUPABASE_ANON_KEY` | the `anon` key from **Project Settings -> API** in the same Supabase project |

Without these, the admin panel builds but shows "not configured", and the build simply
skips syncing any admin-submitted posts (everything else on the site is unaffected).

### 3. (Optional) Instant rebuilds — Supabase -> GitHub webhook
Skip this and publishing still works — it just waits for the next push to `main`
(or you trigger `.github/workflows/deploy.yml` manually via **Actions -> Deploy to
GitHub Pages -> Run workflow**). To make **Publish now** rebuild the site within
seconds instead:

1. Create a GitHub **fine-grained personal access token**
   ([github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)):
   repository access limited to this repo, permission **Contents: Read and write**
   (needed for the `dispatches` endpoint) — or a classic token with the `repo` scope.
   Copy it once; you won't see it again.
2. In Supabase: **Database -> Webhooks -> Create a new hook**.
   - Table: `blog_submissions`. Events: `Insert`, `Update`.
   - Type: **HTTP Request**, Method: **POST**.
   - URL: `https://api.github.com/repos/saymukeshofficework-hash/Mock-test/dispatches`
   - Headers: `Authorization: Bearer <your token>` and
     `Accept: application/vnd.github+json`.
   - Body (payload): `{"event_type": "publish-tech-blog"}`
3. Save. The token lives only inside this Supabase webhook config — it's never in the
   repo, the build, or the browser.

Every insert/update to `blog_submissions` fires this (drafts included) — harmless,
since the workflow just rebuilds from whatever is currently `published`.

## Using it

Go to `https://tettesthub.in/tech-blog/admin/`, sign in, and paste an article. A few
things to know:

- **Images**: there's no upload button. Use a full `https://...` image URL for
  `featuredImage` (and any inline images in the body) — an already-existing site image
  path like `/images/articles/...` only works if that file is actually committed to
  the repo, which this panel can't do for you.
- **Slug**: taken from a `slug:` line in the front matter, or auto-generated from
  `title:` if you omit it. Re-publishing with the same slug **overwrites** that
  article instead of creating a duplicate — this is how you edit a live post (load it
  back into the box with **Edit** in the submissions list, change it, save again).
- **If a publish doesn't show up on the live site**: the build may have failed
  validation (e.g. a missing required field, a category name that doesn't exactly
  match `tech-blog/src/config/categories.json`, or a duplicate slug) — check the
  **Actions** tab on GitHub for the failed "Deploy to GitHub Pages" run; the tech blog
  build step lists exactly what's wrong. Nothing else on the site is affected by a
  failed blog build alone unless the failure is in an earlier step.
- **Delete** in the submissions list removes the row from Supabase; the next build
  will not include it (existing already-deployed pages aren't retroactively removed
  from a past build until the next one runs).

## Never do this
- Never put the Supabase **service_role** key anywhere in this repository, the admin
  page, or the GitHub webhook — only the **anon** key belongs in
  `TECH_BLOG_SUPABASE_ANON_KEY` / `PUBLIC_SUPABASE_ANON_KEY`.
- Never widen the `blog_submissions_admin_all` policy in
  `supabase/blog_admin_schema.sql` to "any authenticated user" — this project's
  `authenticated` role also includes every TET Test Hub student account.
