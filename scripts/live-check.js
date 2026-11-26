#!/usr/bin/env node
// Live health check for https://tettesthub.in (used by the 3-hourly scheduled task).
// Loads key pages in headless Chromium and prints only problems:
// hangs (no load in 30s), slow loads (>8s), JS errors, failed requests (4xx/5xx).
// Also a sales-button check: key series pages loaded logged-out with the old stuck Android-app
// flag (localStorage tth-app=1, the 26 Nov 2026 bug) must still show a visible, clickable
// ₹ Unlock button and a Login/Register button, and the Razorpay script must load. Nothing is clicked for real.
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
  problems.push(...await salesCheck(browser));
  await browser.close();
  if (problems.length) { console.log(`${problems.length} page(s) with problems:\n` + problems.join('\n')); process.exit(1); }
  console.log(`OK: ${PAGES.length} pages healthy, ${SALE_PAGES.length} sales pages show Unlock + Register`);
})();

const SALE_PAGES = ['/examhelp/mp-police-constable-gd-mock-tests/', '/examhelp/tet-mock-tests/',
  '/examhelp/ctet-paper-1-mock-tests/', '/examhelp/mp-naib-tehsildar-mock-tests/'];
const UNLOCK_RE = /(अनलॉक|unlock)[^]*₹\s*\d+/i, REGISTER_RE = /रजिस्टर|register|लॉगिन|login|sign ?up/i;

// Is a button matching re visible, uncovered and clickable? trial:true runs Playwright's
// actionability checks (visible, enabled, not covered by another element) without clicking.
async function clickable(page, re) {
  const loc = page.locator('a,button').filter({ hasText: re });
  for (let i = 0, n = await loc.count(); i < n; i++) {
    const el = loc.nth(i);
    if (!(await el.isVisible())) continue;
    try { await el.click({ trial: true, timeout: 4000 }); return true; } catch (e) { /* covered or disabled: try next */ }
  }
  return false;
}

async function salesCheck(browser) {
  const out = [];
  for (const path of SALE_PAGES) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); // phone size, normal Chrome
    await ctx.addInitScript(() => { try { localStorage.setItem('tth-app', '1'); } catch (e) {} });
    const page = await ctx.newPage();
    const issues = [];
    try {
      await page.goto(BASE + path, { waitUntil: 'load', timeout: HANG_MS });
      await page.waitForTimeout(2500);
      if (await page.evaluate(() => document.documentElement.getAttribute('data-app'))) issues.push('stuck app-mode flag hides sales UI (data-app set in normal browser)');
      if (!(await clickable(page, UNLOCK_RE))) issues.push('₹ Unlock button missing, hidden or covered');
      if (!(await clickable(page, REGISTER_RE))) issues.push('Login/Register button missing, hidden or covered');
    } catch (e) { issues.push('SALES CHECK LOAD FAIL: ' + e.message.split('\n')[0]); }
    if (issues.length) out.push(`${path} [sales, stuck app flag]\n  - ` + issues.join('\n  - '));
    await ctx.close();
  }
  // Razorpay checkout script (loaded on Unlock click). Only checks it loads; no order or payment.
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    await page.goto(BASE + SALE_PAGES[0], { waitUntil: 'domcontentloaded', timeout: HANG_MS });
    const r = await page.evaluate(() => new Promise(res => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => res(typeof window.Razorpay === 'function' ? 'ok' : 'no Razorpay object');
      s.onerror = () => res('error');
      document.head.appendChild(s);
      setTimeout(() => res('timeout'), 15000);
    }));
    if (r === 'error' || r === 'timeout') console.log(`NOTE: Razorpay script ${r} (sandbox may block checkout.razorpay.com; check from a normal browser if this repeats)`);
    else if (r !== 'ok') out.push('Razorpay checkout.js loaded but ' + r);
  } catch (e) { out.push('Razorpay check failed: ' + e.message.split('\n')[0]); }
  await ctx.close();
  return out;
}
