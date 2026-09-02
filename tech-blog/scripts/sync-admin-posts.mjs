#!/usr/bin/env node
// Pulls published articles submitted through /admin/ (stored in Supabase's
// blog_submissions table — see supabase/blog_admin_schema.sql) and writes each
// one verbatim to src/content/posts/<slug>.md, before validate-content.mjs and
// astro build run. This is the only place admin-submitted content touches the
// filesystem — from here on it's a normal article, going through the exact
// same Zod schema validation and rendering as every hand-written one.
//
// Never hard-fails the build: this is supplementary content on top of the
// hand-written articles already in git, so a transient Supabase hiccup (or a
// network-restricted environment) should not be able to take down deploying
// the rest of the site. Failures are logged loudly (visible in the Actions
// run) and just skip the sync, leaving src/content/posts/ as it already is.

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../src/config/supabase-credentials.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const POSTS_DIR = path.join(ROOT, 'src/content/posts');

async function main() {
  const endpoint = `${SUPABASE_URL}/rest/v1/blog_submissions?select=slug,raw_markdown&status=eq.published`;
  let res;
  try {
    res = await fetch(endpoint, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
  } catch (e) {
    console.warn(`sync-admin-posts: could not reach Supabase (${e.message}) — skipping.`);
    return;
  }

  if (!res.ok) {
    console.warn(`sync-admin-posts: Supabase request failed (${res.status} ${res.statusText}) — skipping.`);
    console.warn(await res.text());
    return;
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
