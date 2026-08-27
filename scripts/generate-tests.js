#!/usr/bin/env node
/*
 * Generates the 20 tet-mock-test-N.html shells from scripts/test-page.template.html.
 *
 * These pages no longer ship their own questions as public JS files — each page
 * authenticates the visitor, checks their purchased_tests, then fetches that one
 * test's questions from Supabase (see supabase/schema.sql). The actual question
 * content lives in scripts/question-bank.js / scripts/lib/build-sections.js and is
 * pushed to Supabase via scripts/export-supabase-seed.js, not shipped here.
 *
 * To add test 21+: extend scripts/question-bank.js, bump TOTAL_TESTS below and in
 * scripts/export-supabase-seed.js, add a row to js/site-config.js's TEST_CATALOG
 * and PAYMENT_LINKS, then re-run:
 *   node scripts/generate-tests.js
 *   node scripts/export-supabase-seed.js   (and paste the new rows into Supabase)
 */
const fs = require('fs');
const path = require('path');

const TOTAL_TESTS = 20;
const ROOT = path.join(__dirname, '..');

const HTML_TEMPLATE = fs.readFileSync(path.join(__dirname, 'test-page.template.html'), 'utf8');

function buildHtmlFile(testId) {
  const padded = String(testId).padStart(2, '0');
  return HTML_TEMPLATE
    .replace(/__TEST_ID_PADDED__/g, padded)
    .replace(/__TEST_ID__/g, String(testId));
}

for (let testId = 1; testId <= TOTAL_TESTS; testId++) {
  fs.writeFileSync(path.join(ROOT, `tet-mock-test-${testId}.html`), buildHtmlFile(testId));
}

console.log(`Generated ${TOTAL_TESTS} HTML pages in ${ROOT}.`);
