# Technology Blog

A fast, SEO-friendly technology publication built with [Astro](https://astro.build) — static
HTML output, zero JS by default, Markdown-based content collections with schema validation.
Placeholder brand (name, colors, author, domain) until real values are supplied — see
[Configuration](#configuration).

## Why Astro

- Ships static HTML with **zero client-side JS by default** — best-in-class Core Web Vitals.
- **Content Collections** give every article a typed, validated front-matter schema
  (`src/content/config.ts`) — a malformed article fails the build with a clear error instead
  of silently breaking the site.
- Built-in Markdown, RSS (`@astrojs/rss`), and sitemap (`@astrojs/sitemap`) — no hand-rolled XML.
- Already fits this repo: Node/Vite tooling is already set up for sibling projects here.

## Repository Structure

```
tech-blog/
├── src/
│   ├── config/       # site.ts (central brand config), categories.ts/.json
│   ├── content/      # config.ts (article schema) + posts/*.md (the articles)
│   ├── components/    # Header, Footer, ArticleCard, ProsCons, FAQ, AdSlot, etc.
│   ├── layouts/       # BaseLayout (SEO shell), ArticleLayout
│   ├── lib/           # url.ts, posts.ts (query helpers)
│   ├── pages/          # routes: index, posts/[...slug], category/[category], search, rss.xml...
│   └── styles/        # global.css
├── public/            # static assets: images/, favicon.svg
├── templates/          # article-template.md — copy this to write a new article
├── docs/               # SPARK_PUBLISHING_GUIDE.md, CUSTOM_DOMAIN.md
└── scripts/            # validate-content.mjs
```

## Local Development

```bash
cd tech-blog
npm install
npm run dev       # http://localhost:4321/tech-blog/
```

```bash
npm run build      # validate content -> type-check -> build -> build search index
npm run preview    # serve the production build locally
npm run validate    # just the content checks
```

## Adding an Article

1. Copy `templates/article-template.md` to `src/content/posts/your-slug.md`.
2. Fill in the front matter (see the template's comments, or the full field
   reference in [`docs/SPARK_PUBLISHING_GUIDE.md`](docs/SPARK_PUBLISHING_GUIDE.md)).
3. Add any images to `public/images/articles/your-slug/`.
4. `npm run validate` locally (optional — CI runs it too), then commit and push.

That's the entire workflow — no other file needs to change. This is also exactly
how **Spark** (or any other writer) publishes: see the full guide linked above.

## How Categories / Colors / Brand Work

Everything brand-related lives in **`src/config/site.ts`** (name, tagline, colors, author,
domain, social links, analytics IDs) and **`src/config/categories.json`** (the category
list). Change a value once there — nothing else hard-codes it.

## Deployment

This project is one of several independent sites built and deployed by the repo's shared
`.github/workflows/deploy.yml` on every push to `main`. It: installs dependencies, runs
`npm run validate` + `astro build` (which fails the whole deploy on a content error), then
copies `tech-blog/dist/` into the combined `_site/tech-blog/` output that GitHub Pages serves.
No manual rebuild is ever needed to publish a new article.

## Configuration Still Required Before Launch

- `BLOG_NAME`, `BLOG_TAGLINE`, `BLOG_DESCRIPTION`, `BLOG_DOMAIN`, `AUTHOR_NAME`, `AUTHOR_BIO`,
  `CONTACT_EMAIL`, colors, social links — all in `src/config/site.ts`.
- `LOGO` / `FAVICON` — replace the placeholder SVGs in `public/`.
- `GOOGLE_ANALYTICS_ID`, `SEARCH_CONSOLE_VERIFICATION` — left empty on purpose; set when ready.
- A custom domain, if wanted — see [`docs/CUSTOM_DOMAIN.md`](docs/CUSTOM_DOMAIN.md).

## Search

Full-text search is powered by [Pagefind](https://pagefind.app) (`npm run build` generates its
index as the last step) — no external service, no separate database.

## Troubleshooting

- **Build fails on a content error** — the error names the file and field; fix it in that
  article's front matter and re-run `npm run validate`.
- **New article doesn't show up** — check `draft: false` and that `date` isn't in the future
  relative to your system clock during local preview.
- **Search finds nothing locally** — run the full `npm run build` (not `dev`) at least once;
  Pagefind only indexes the built `dist/` output.
