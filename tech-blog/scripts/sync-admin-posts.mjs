#!/usr/bin/env node
// Pulls published articles submitted through /admin/ (stored in Supabase's
// blog_submissions table — see supabase/blog_admin_schema.sql) and writes each
// one verbatim to src/content/posts/<slug>.md, before validate-content.mjs and
// astro build run. This is the only place admin-submitted content touches the
// filesystem — from here on it's a normal article, going through the exact
// same Zod schema validation and rendering as every hand-written one.
//
// No-ops (exit 0) when PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY aren't
// set, so a plain local `npm run build` without credentials still works.

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const POSTS_DIR = path.join(ROOT, 'src/content/posts');

const url = process.env.PUBLIC_SUPABASE_URL;
const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

async function main() {
  if (!url || !anonKey) {
    console.log('sync-admin-posts: PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY not set — skipping.');
    return;
  }

  const endpoint = `${url}/rest/v1/blog_submissions?select=slug,raw_markdown&status=eq.published`;
  const res = await fetch(endpoint, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });

  if (!res.ok) {
    console.error(`sync-admin-posts: Supabase request failed (${res.status} ${res.statusText})`);
    console.error(await res.text());
    process.exit(1);
  }

  const rows = await res.json();
  if (rows.length === 0) {
    console.log('sync-admin-posts: no published admin submissions.');
    return;
  }

  for (const row of rows) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(row.slug)) {
      console.error(`sync-admin-posts: skipping invalid slug "${row.slug}"`);
      continue;
    }
    const filePath = path.join(POSTS_DIR, `${row.slug}.md`);
    await writeFile(filePath, row.raw_markdown, 'utf-8');
    console.log(`sync-admin-posts: wrote ${row.slug}.md`);
  }

  console.log(`sync-admin-posts: synced ${rows.length} article(s) from Supabase.`);
}

main();
