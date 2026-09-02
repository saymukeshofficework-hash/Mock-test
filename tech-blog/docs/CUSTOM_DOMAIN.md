# Attaching a Custom Domain

The site currently deploys under this repo's shared GitHub Pages sub-path
(`/tech-blog`), configured via `BLOG_DOMAIN` in `src/config/site.ts` and
`base` in `astro.config.mjs`. No domain has been purchased — this only
documents the process for when one is.

## Steps (when you have a real domain)

1. **Buy the domain** from any registrar (not done automatically by this
   project, and never will be — see the master build rules).
2. **DNS**: point it at GitHub Pages — either a `CNAME` record to
   `<github-username>.github.io` (subdomain) or the GitHub Pages `A`
   records (apex domain). See GitHub's own Pages custom-domain docs for
   the current record values.
3. **Repo settings**: in GitHub → Settings → Pages, add the custom domain.
   This repo hosts multiple independent sites under one Pages deployment,
   so a custom domain here would need its own dedicated deploy target —
   ask before changing this if other projects in the repo also use
   `github.io/Mock-test/...` paths.
4. **Code changes** (two files):
   - `tech-blog/src/config/site.ts` → set `BLOG_DOMAIN` to the real
     domain root, e.g. `https://example.com`.
   - `tech-blog/astro.config.mjs` → change `BASE_PATH` from `/tech-blog`
     to `/`.
5. **Rebuild and redeploy** (push to `main`).

## Why Two Separate Values

`BLOG_DOMAIN` is the canonical URL used in SEO tags, the sitemap, and RSS.
`base` is Astro's own routing prefix. Today they combine to
`https://<user>.github.io/Mock-test` + `/tech-blog`. After a custom domain,
they become `https://example.com` + `/` — the domain absorbs what the
sub-path used to do.
