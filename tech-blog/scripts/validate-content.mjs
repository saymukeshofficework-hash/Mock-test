#!/usr/bin/env node
// Validates every article in src/content/posts/ before the site builds.
// Fails loudly (non-zero exit) with a clear, per-file list of problems
// rather than letting a malformed article silently break the build or,
// worse, publish broken content.

import { readFile, readdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const POSTS_DIR = path.join(ROOT, 'src/content/posts');
const PUBLIC_DIR = path.join(ROOT, 'public');

const categories = JSON.parse(await readFile(path.join(ROOT, 'src/config/categories.json'), 'utf-8'));
const categoryNames = new Set(categories.map((c) => c.name));

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

function slugify(filename) {
  return filename.replace(/\.md$/, '');
}

async function main() {
  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.md'));
  if (files.length === 0) {
    console.log('validate-content: no articles found in src/content/posts — nothing to validate.');
    return;
  }

  const errors = [];
  const warnings = [];
  const seenSlugs = new Map(); // slug -> filename

  const parsed = [];
  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const raw = await readFile(filePath, 'utf-8');
    let frontmatter, body;
    try {
      ({ data: frontmatter, content: body } = matter(raw));
    } catch (e) {
      errors.push(`${file}: malformed front matter — ${e.message}`);
      continue;
    }
    parsed.push({ file, frontmatter, body });
  }

  const allSlugs = new Set(parsed.map((p) => p.frontmatter.slug || slugify(p.file)));

  for (const { file, frontmatter: fm, body } of parsed) {
    const prefix = `${file}:`;
    const required = ['title', 'description', 'date', 'category', 'featuredImage', 'featuredImageAlt'];
    for (const field of required) {
      if (fm[field] === undefined || fm[field] === null || fm[field] === '') {
        errors.push(`${prefix} missing required field "${field}"`);
      }
    }

    if (fm.title && (fm.title.length < 10 || fm.title.length > 100)) {
      errors.push(`${prefix} "title" must be 10-100 characters (got ${fm.title.length})`);
    }
    if (fm.description && (fm.description.length < 50 || fm.description.length > 160)) {
      errors.push(`${prefix} "description" must be 50-160 characters (got ${fm.description.length})`);
    }
    if (fm.date && Number.isNaN(Date.parse(fm.date))) {
      errors.push(`${prefix} "date" is not a valid date: "${fm.date}"`);
    }
    if (fm.updated && Number.isNaN(Date.parse(fm.updated))) {
      errors.push(`${prefix} "updated" is not a valid date: "${fm.updated}"`);
    }
    if (fm.category && !categoryNames.has(fm.category)) {
      errors.push(
        `${prefix} category "${fm.category}" is not in src/config/categories.json — add it there first, or fix the typo`
      );
    }

    const slug = fm.slug || slugify(file);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      errors.push(`${prefix} slug "${slug}" must be lowercase, hyphen-separated, no spaces/special characters`);
    }
    if (seenSlugs.has(slug)) {
      errors.push(`${prefix} duplicate slug "${slug}" (also used by ${seenSlugs.get(slug)})`);
    } else {
      seenSlugs.set(slug, file);
    }

    if (fm.featuredImage && !/^https?:\/\//.test(fm.featuredImage)) {
      const imgPath = path.join(PUBLIC_DIR, fm.featuredImage.replace(/^\//, ''));
      if (!(await fileExists(imgPath))) {
        errors.push(`${prefix} featuredImage "${fm.featuredImage}" does not exist at public${fm.featuredImage}`);
      }
    }

    if (fm.reviewType === 'hands-on' && !fm.pros && !fm.cons && !fm.verdict) {
      warnings.push(
        `${prefix} reviewType is "hands-on" but has no pros/cons/verdict — double-check this wasn't set by mistake`
      );
    }

    // Internal links: /posts/<slug>/ must point at a real article.
    const linkPattern = /\]\(\/posts\/([a-z0-9-]+)\/?\)/g;
    let match;
    while ((match = linkPattern.exec(body))) {
      const targetSlug = match[1];
      if (!allSlugs.has(targetSlug)) {
        errors.push(`${prefix} links to "/posts/${targetSlug}/" which does not exist (invented or misspelled slug)`);
      }
    }
  }

  if (warnings.length > 0) {
    console.warn('\nContent validation warnings:');
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  if (errors.length > 0) {
    console.error('\nContent validation FAILED:');
    errors.forEach((e) => console.error(`  - ${e}`));
    console.error(`\n${errors.length} error(s) in ${parsed.length} article(s). Fix the file(s) above and re-run.`);
    process.exit(1);
  }

  console.log(`validate-content: ${parsed.length} article(s) OK.`);
}

main();
