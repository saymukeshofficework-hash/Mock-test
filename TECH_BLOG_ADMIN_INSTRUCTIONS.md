# Technology Blog — Admin Publishing Panel

A login-gated page at `/tech-blog/admin/` where you paste a complete article (front
matter + Markdown/HTML body, same format as
[`tech-blog/templates/article-template.md`](./tech-blog/templates/article-template.md))
and it gets published to the live site. No separate CMS, no manual setup required —
already configured and ready to use.

## Login now

Go to `https://tettesthub.in/tech-blog/admin/` and sign in with `admin1` or `admin2`
as the Admin ID — passwords for both were given to you directly in chat when these
accounts were created (never committed to this repo). Lost or want to change one?
Supabase: **tet-test-hub project -> Authentication -> Users**, select the account
(`admin1@blog-admin.tettesthub.app` / `admin2@blog-admin.tettesthub.app`) -> **Reset
password**.

## How it works

1. You log in with an Admin ID above (this maps to a Supabase account under
   `@blog-admin.tettesthub.app` internally — see
   [`tech-blog/src/lib/supabase-admin.ts`](./tech-blog/src/lib/supabase-admin.ts)).
2. You paste an article and click **Save as draft** or **Publish now**. This writes one
   row to the `blog_submissions` table in Supabase (the same project TET Test Hub
   already uses) — nothing touches the repo yet.
3. On the next site build, `tech-blog/scripts/sync-admin-posts.mjs` fetches every
   `status = 'published'` row and writes it verbatim to
   `tech-blog/src/content/posts/<slug>.md`. From there it's a completely normal
   article — validated by `scripts/validate-content.mjs` and rendered by
   `ArticleLayout.astro` exactly like the three demo articles.
4. A build happens automatically on every push to `main`, or instantly after
   publishing if you set up the optional webhook below.

No GitHub secrets or `.env` files needed anywhere — the Supabase project URL and
public `anon` key are committed directly in
[`tech-blog/src/config/supabase-credentials.mjs`](./tech-blog/src/config/supabase-credentials.mjs).
This is safe: it's the anon key, which is *designed* to be public (the same way
`js/site-config.js`'s Supabase key at the repo root already is) — Row Level Security
in [`supabase/blog_admin_schema.sql`](./supabase/blog_admin_schema.sql) is what
actually protects writes, gated to exactly these two admin accounts, not "any
authenticated user" (a logged-in student is also an `authenticated` user in this same
project).

## (Optional) Instant rebuilds — Supabase -> GitHub webhook
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

## Adding or removing an admin account
1. Supabase Dashboard -> **Authentication -> Users -> Add user** — email
   `<newid>@blog-admin.tettesthub.app`, set a password, check **Auto Confirm User**.
2. Add that email to both policies in
   [`supabase/blog_admin_schema.sql`](./supabase/blog_admin_schema.sql) (the `in
   (...)` list) and re-run just those two `create policy` statements in the SQL
   Editor.
3. To remove an account, delete it in **Authentication -> Users** and drop its email
   from both policies the same way.

## Never do this
- Never put the Supabase **service_role** key anywhere in this repository, the admin
  page, or the GitHub webhook — only the **anon** key belongs in
  `supabase-credentials.mjs`.
- Never widen the `blog_submissions_admin_all` policy in
  `supabase/blog_admin_schema.sql` to "any authenticated user" — this project's
  `authenticated` role also includes every TET Test Hub student account.
