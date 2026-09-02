<!--
  ARTICLE TEMPLATE
  Copy this file into src/content/posts/, rename it to your slug
  (e.g. best-ai-writing-tools.md), fill in the front matter, delete
  this comment block, and write the article below the `---`.

  Full field-by-field rules: docs/SPARK_PUBLISHING_GUIDE.md
-->
---
# REQUIRED
title: "Article Title, 10-100 Characters"
description: "SEO description, 50-160 characters. Shown in search results and article cards."
date: "2026-01-01"                       # YYYY-MM-DD, publish date
category: "AI Tools"                     # Must exactly match a name in src/config/categories.ts
featuredImage: "/images/articles/your-slug/featured.jpg"
featuredImageAlt: "Descriptive alt text for the featured image"

# OPTIONAL — safe to delete any of these
updated: "2026-01-01"                    # YYYY-MM-DD, only if the article was revised after publishing
author: "AUTHOR_NAME"                    # defaults to AUTHOR_NAME from src/config/site.ts if omitted
tags:                                    # meaningful, reusable tags only — not one-off variations
  - example-tag
slug: "your-slug"                        # defaults to the filename if omitted; must be unique
featured: false                          # true = eligible for the homepage hero slot
draft: false                             # true = excluded from the production build
demo: false                              # leave false for real articles
readingTime: 8                           # minutes; auto-computed from word count if omitted
primaryKeyword: "target search phrase"

# SEO overrides — omit to fall back to title/description/featuredImage
seoTitle: "Shorter title for the <title> tag, max 60 characters"
canonicalUrl: "https://example.com/original-source/"   # only if this article is republished from elsewhere

# Product-review metadata — omit entirely for a non-review article.
# NEVER set reviewType to "hands-on" unless the product was actually tested.
reviewType: "research"                   # "research" or "hands-on"
pros:
  - "Pro point one"
cons:
  - "Con point one"
verdict: "One or two sentence summary verdict."

# Renders one CTA button automatically. Omit `href` (or the whole block)
# until a real affiliate link exists — never invent one.
affiliateCta:
  label: "Learn More"                    # or "Check Pricing" / "Try It" / "Start Free" / "Compare Plans"
  href: ""                               # leave blank until a real link exists
  note: ""

# Renders an FAQ section (with FAQPage structured data). Omit if not useful.
faqs:
  - question: "A real question a reader would ask"
    answer: "A direct, factual answer."
---

Write the article body here in plain Markdown: `##`/`###` headings, paragraphs,
`![alt](/images/articles/your-slug/inline.jpg)` images, and standard GitHub-flavored
Markdown tables for any comparison/spec table — no special syntax needed, the
site styles plain Markdown tables automatically.

## A Heading Becomes a Table-of-Contents Entry

Use `##` for major sections and `###` for subsections — anything below `###`
won't appear in the table of contents.

To link to another article on this site, use its real, already-published URL,
e.g. `[laptop buying guide](/posts/existing-article-slug/)`. Never invent a
URL for an article that doesn't exist yet.
