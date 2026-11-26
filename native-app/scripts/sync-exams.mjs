// Copies the website's exam records (examhelp/src/data/exams.ts) into the app as JSON,
// so exam dates, patterns and official links stay identical to tettesthub.in/examhelp.
// Run: node scripts/sync-exams.mjs   (from native-app/). Metadata only, no paid content.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const src = path.resolve(import.meta.dirname, "../../examhelp/src/data/exams.ts");
const out = ts.transpileModule(fs.readFileSync(src, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} };
new Function("module", "exports", "require", out)(mod, mod.exports, () => ({}));
const pick = (e) => ({
  id: e.id, slug: e.slug, name: e.name, shortName: e.shortName, organization: e.organization,
  category: e.category, posts: e.posts ?? null, mode: e.mode ?? null, dates: e.dates ?? {},
  officialUrl: e.officialUrl ?? null, description: e.description ?? null,
  pattern: e.details?.pattern ?? null, syllabus: e.details?.syllabus ?? null,
});
const exams = mod.exports.exams.map(pick);
fs.writeFileSync(path.resolve(import.meta.dirname, "../src/data/exams.json"), JSON.stringify({ synced: new Date().toISOString().slice(0, 10), exams }, null, 1));
console.log("exams:", exams.length);
