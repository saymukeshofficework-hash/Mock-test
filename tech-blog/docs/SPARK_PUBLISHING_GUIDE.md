# Spark Publishing Guide

How Spark (or any AI/human writer) publishes an article to this site. Follow
this exactly — the site engine, SEO, and deployment are all already built;
publishing an article only ever means adding one Markdown file (plus its
images).

## 1. Where to Save Articles

`src/content/posts/your-slug.md` — one Markdown file per article. The
filename becomes the URL slug unless you set `slug` in front matter.

## 2. Required Front Matter

```yaml
title: "10-100 characters"
description: "50-160 characters — used for SEO and article cards"
date: "YYYY-MM-DD"
category: "Must exactly match a name in src/config/categories.ts"
featuredImage: "/images/articles/your-slug/featured.jpg"
featuredImageAlt: "Descriptive alt text"
```

Missing or malformed required fields fail the build with a clear error
naming the file and field — see `npm run validate`.

## 3. Optional Front Matter

`updated`, `author`, `tags`, `slug`, `featured`, `draft`, `readingTime`,
`primaryKeyword`, `seoTitle`, `canonicalUrl`, `reviewType`, `pros`, `cons`,
`verdict`, `faqs`, `affiliateCta`. Full field docs and example values:
[`templates/article-template.md`](../templates/article-template.md).

## 4. Category Rules

`category` must be an exact match (case-sensitive name, not slug) to an
entry in `src/config/categories.ts`. An unlisted category fails the build.
To add a new category, add it there first — do not invent a category only
in an article's front matter.

## 5. Tag Rules

Use tags for genuinely reusable, meaningful relationships between articles
(e.g. `ai`, `laptops`, `buying-guide`). Don't create a one-off tag for a
single article — it produces a page with nothing else on it.

## 6. Slug Rules

Lowercase, hyphen-separated, no spaces or special characters
(`best-ai-writing-tools`, not `Best AI Writing Tools!`). Must be unique
across every article — `npm run validate` checks this. Never reuse or
change the slug of an already-published article; that breaks its URL and
anything linking to it.

## 7. Image Rules

Save images under `public/images/articles/your-slug/` — e.g. `featured.jpg`
for the featured image, plus any inline images used in the body. Reference
them in Markdown with that same path: `![alt text](/images/articles/your-slug/inline.jpg)`.
Every image needs real, descriptive alt text. Only use images you have the
rights to use.

## 8. Internal-Link Rules

Link to other articles using their real, already-published URL:
`[link text](/posts/existing-article-slug/)`. **Never invent a URL for an
article that doesn't exist.** `npm run validate` checks that every
`/posts/...` link in an article body actually resolves to a real post.

## 9. Affiliate-Link Rules

Use the `affiliateCta` front matter block (see the template) — never write
raw affiliate `<a>` tags in the body. Leave `href` empty until a real
affiliate link exists; the site renders a clearly-marked "link pending"
placeholder instead of a fake or broken link. Never invent an affiliate
relationship, a price, or a discount that wasn't actually verified.

## 10. What Spark May Modify

- `src/content/posts/` — add or edit article Markdown files
- `public/images/articles/<slug>/` — that article's own images only

That's the entire normal workflow. Nothing else needs to change to publish
an article.

## 11. What Spark Must Never Modify

Layout/components (`src/components/`, `src/layouts/`), global styles
(`src/styles/`), site configuration (`src/config/`), the content schema
(`src/content/config.ts`), GitHub Actions (`.github/workflows/`), package
files (`package.json`, `package-lock.json`), or any other article's file.

Never delete an existing article. Never overwrite another article's images.
Never fabricate facts, statistics, testimonials, prices, sources, or claim
hands-on product testing that didn't happen (`reviewType: hands-on` is only
for articles where the product was actually tested).

## 12. How to Preview Locally

```bash
cd tech-blog
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:4321/tech-blog/`) and
navigate to `/posts/your-slug/`.

## 13. How GitHub Actions Deploys

Push to `main` (or merge a PR into it) →
`.github/workflows/deploy.yml` installs dependencies, runs
`npm run validate` (content checks) and `astro build` (which also fails on
any content-schema error), then deploys the built site to GitHub Pages.
No manual rebuild step is needed — adding a Markdown file and pushing is
the entire publishing action.

## 14. Complete Example

See any file in `src/content/posts/` (e.g. `demo-how-to-choose-a-laptop.md`)
for a full, real example with every optional field in use.
