import { defineCollection, z } from 'astro:content';
import { categories } from '../config/categories';

const categoryNames = categories.map((c) => c.name) as [string, ...string[]];

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(10).max(100),
    description: z.string().min(50).max(160),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    author: z.string().default('AUTHOR_NAME'),

    // Must be one of src/config/categories.ts's names, so every article
    // always resolves to a real category page.
    category: z.enum(categoryNames),
    tags: z.array(z.string()).default([]),

    // Note: `slug` is intentionally NOT part of this schema — Astro
    // reserves it as a built-in override. Setting `slug: "..."` in an
    // article's front matter still works; it just isn't validated here.
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    demo: z.boolean().default(false), // marks the 3 test articles — see templates/article-template.md

    featuredImage: z.string(),
    featuredImageAlt: z.string().min(1),

    readingTime: z.number().int().positive().optional(), // auto-computed if omitted
    primaryKeyword: z.string().optional(),

    // SEO overrides — fall back to title/description/featuredImage when absent.
    seoTitle: z.string().max(60).optional(),
    canonicalUrl: z.string().url().optional(),

    // Product-review metadata (section 21 of the publishing guide). Never
    // default reviewType to 'hands-on' — an article is research-only
    // unless explicitly marked otherwise.
    reviewType: z.enum(['research', 'hands-on']).optional(),
    pros: z.array(z.string()).optional(),
    cons: z.array(z.string()).optional(),
    verdict: z.string().optional(),

    faqs: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),

    // Renders one AffiliateCTA automatically — Spark never writes
    // component/JSX syntax, only this frontmatter block.
    affiliateCta: z
      .object({
        label: z.string().default('Learn More'),
        href: z.string().optional(), // omit until a real affiliate link exists
        note: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = { posts };
