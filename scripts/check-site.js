#!/usr/bin/env node
// Free site check: no browser, no network. Usage: node scripts/check-site.js [--all]
// Checks: inline JS syntax, internal links/images exist, sitemap URLs exist, obvious secrets.
// Prints failures only. Exit code 1 if any failure.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const ALL = process.argv.includes("--all");
// Folders with their own build step (source paths differ from the deployed ones) are skipped by default.
const SKIP_DIRS = new Set(["node_modules", ".git", ".github", "dist", "build", "out", "_site", ".claude",
  "ludo-3d", "bulbul-bhatia", "mukesh-singh-dahiya", "tech-blog", "RAIN ALERT", "school-document-builder", "bridge-course", "examhelp"]);
// URL prefixes served from other sources at deploy time (not present in this repo).
const EXTERNAL_PREFIXES = ["/examhelp", "/testhub", "/tech-blog", "/bridge-course", "/ludo-3d", "/bulbul-bhatia",
  "/mukesh-singh-dahiya", "/rain-alert", "/school-document-builder"];

const failures = [];
const fail = (file, msg) => failures.push(`${path.relative(ROOT, file)}: ${msg}`);

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!ALL && SKIP_DIRS.has(e.name)) continue;
      if (e.name === "node_modules" || e.name === ".git") continue;
      walk(path.join(dir, e.name), out);
    } else out.push(path.join(dir, e.name));
  }
  return out;
}

const files = walk(ROOT, []);
const htmlFiles = files.filter((f) => f.endsWith(".html") && !/\.template\.html$/.test(f)); // templates are copied elsewhere before use

function exists(p) {
  if (fs.existsSync(p)) return true;
  return fs.existsSync(p + ".html") || fs.existsSync(path.join(p, "index.html"));
}

function resolveLink(fromFile, url) {
  const clean = url.split("#")[0].split("?")[0];
  if (!clean) return null;
  if (/^(https?:|mailto:|tel:|data:|javascript:|blob:|whatsapp:|sms:|\/\/)/i.test(clean)) return null;
  if (clean.includes("${") || clean.includes("{{") || clean.includes("<%")) return null;
  let decoded = clean;
  try { decoded = decodeURIComponent(clean); } catch (_) {}
  if (decoded.startsWith("/")) {
    if (EXTERNAL_PREFIXES.some((p) => decoded === p || decoded.startsWith(p + "/"))) return null;
    return path.join(ROOT, decoded);
  }
  return path.resolve(path.dirname(fromFile), decoded);
}

for (const f of htmlFiles) {
  const src = fs.readFileSync(f, "utf8");

  // 1) inline script syntax (skip JSON / templates / modules with import)
  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = scriptRe.exec(src))) {
    const attrs = m[1], body = m[2];
    if (/\bsrc\s*=/.test(attrs) || !body.trim()) continue;
    const type = (attrs.match(/type\s*=\s*["']?([^"'\s>]+)/i) || [])[1] || "";
    if (type && !/^(text\/javascript|application\/javascript|module)$/i.test(type)) continue;
    if (/\$\{|\{\{|<%/.test(body) && !type) { /* template-like; still try */ }
    try {
      new vm.Script(body, { filename: path.relative(ROOT, f) });
    } catch (e) {
      if (type === "module" && /import|export/.test(body)) continue; // modules parsed separately by browsers
      fail(f, `inline JS syntax error: ${e.message}`);
    }
  }

  // 2) internal links / images / scripts / styles
  const attrRe = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
  const seen = new Set();
  while ((m = attrRe.exec(src))) {
    const url = m[1].trim();
    if (seen.has(url)) continue;
    seen.add(url);
    const target = resolveLink(f, url);
    if (target && !exists(target)) fail(f, `broken link/asset -> ${url}`);
  }
}

// 3) sitemap URLs
const sitemap = path.join(ROOT, "sitemap.xml");
if (fs.existsSync(sitemap)) {
  const xml = fs.readFileSync(sitemap, "utf8");
  for (const [, loc] of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    let p;
    try { p = new URL(loc).pathname; } catch (_) { fail(sitemap, `bad URL ${loc}`); continue; }
    if (EXTERNAL_PREFIXES.some((x) => p === x || p.startsWith(x + "/"))) continue;
    if (!exists(path.join(ROOT, decodeURIComponent(p)))) fail(sitemap, `URL not in repo -> ${p}`);
  }
}

// 4) obvious secrets in text files
const SECRET_PATTERNS = [
  [/rzp_live_[A-Za-z0-9]{8,}/, "Razorpay live key"],
  [/rzp_test_[A-Za-z0-9]{8,}/, "Razorpay test key"],
  [/service_role['"]?\s*[:=]\s*['"]eyJ/, "Supabase service_role key"],
  [/sk-[A-Za-z0-9]{32,}/, "API secret key"],
  [/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/, "private key"],
  [/ghp_[A-Za-z0-9]{30,}/, "GitHub token"],
];
const TEXT_EXT = /\.(html|js|mjs|json|md|txt|sql|ya?ml|toml|css|ts)$/i;
for (const f of walk(ROOT, [])) {
  if (!TEXT_EXT.test(f) || f.endsWith("check-site.js") || f.endsWith("package-lock.json")) continue;
  let s;
  try { if (fs.statSync(f).size > 2_000_000) continue; s = fs.readFileSync(f, "utf8"); } catch (_) { continue; }
  for (const [re, label] of SECRET_PATTERNS) if (re.test(s)) fail(f, `possible secret: ${label}`);
}

// 5) paid files accidentally public
for (const f of walk(ROOT, [])) {
  if (/\.pdf$/i.test(f) && /(paid|premium|notes|answer)/i.test(path.basename(f)) && !f.includes("sample")) {
    fail(f, "PDF with paid-looking name is in a public folder (check it is meant to be public)");
  }
}

console.log(`Checked ${htmlFiles.length} HTML files${ALL ? " (all folders)" : " (build-app folders skipped; use --all)"}.`);
if (failures.length) {
  const MAX = 30;
  console.log(`${failures.length} failure(s):`);
  failures.slice(0, MAX).forEach((x) => console.log(" - " + x));
  if (failures.length > MAX) console.log(` ...and ${failures.length - MAX} more`);
  process.exit(1);
}
console.log("All checks passed.");
