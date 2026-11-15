#!/usr/bin/env node
// Live health check for https://tettesthub.in (used by the 3-hourly scheduled task).
// Loads key pages in headless Chromium and prints only problems:
// hangs (no load in 30s), slow loads (>8s), JS errors, failed requests (4xx/5xx).
// Usage: node scripts/live-check.js [extra paths...]
const { chromium } = require('playwright');

const BASE = 'https://tettesthub.in';
const PAGES = ['/', '/login.html', '/dashboard.html', '/tests.html', '/tet-mock-test-1.html',
  '/examhelp/', '/current-affairs-ebook.html', '/sitemap.xml', ...process.argv.slice(2)];
const HANG_MS = 30000, SLOW_MS = 8000;
// Hosts the sandbox may not reach (analytics, payments); their failures are not site bugs.
const IGNORE = /google-analytics|googletagmanager|doubleclick|razorpay|clarity\.ms|facebook|gstatic\.com\/recaptcha/;

(async () => {
  const browser = await chromium.launch();
  const problems = [];
  for (const path of PAGES) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const issues = [];
    page.on('pageerror', e => issues.push('JS error: ' + String(e.message).slice(0, 200)));
    page.on('console', m => { if (m.type() === 'error' && !IGNORE.test(m.text()) && !/ERR_TUNNEL|ERR_PROXY|403 \(Forbidden\)$/.test(m.text())) issues.push('console: ' + m.text().slice(0, 200)); });
    page.on('response', r => { const u = r.url(); if (r.status() >= 400 && !IGNORE.test(u) && !/supabase\.co/.test(u)) issues.push(`HTTP ${r.status()}: ${u}`); });
    const t0 = Date.now();
    try {
      const res = await page.goto(BASE + path, { waitUntil: 'load', timeout: HANG_MS });
      const ms = Date.now() - t0;
      if (!res || res.status() >= 400) issues.push(`page status ${res && res.status()}`);
      if (ms > SLOW_MS) issues.push(`slow load ${ms} ms`);
      await page.waitForTimeout(2500); // let late scripts run
      // main thread hang check: page must answer a trivial evaluate within 5s
      await Promise.race([page.evaluate(() => 1), new Promise((_, j) => setTimeout(() => j(new Error('main thread unresponsive >5s')), 5000))])
        .catch(e => issues.push('HANG: ' + e.message));
    } catch (e) {
      issues.push('HANG/LOAD FAIL: ' + e.message.split('\n')[0]);
    }
    if (issues.length) problems.push(`${path}\n  - ` + [...new Set(issues)].join('\n  - '));
    await ctx.close();
  }
  await browser.close();
  if (problems.length) { console.log(`${problems.length} page(s) with problems:\n` + problems.join('\n')); process.exit(1); }
  console.log(`OK: ${PAGES.length} pages healthy`);
})();
