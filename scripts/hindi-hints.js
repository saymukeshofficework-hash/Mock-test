#!/usr/bin/env node
// Finds (and with --fix removes) English glosses in brackets inside the Hindi
// text of tests, e.g. "शनिवार (Saturday)". Such a gloss on only the correct
// option gives the answer away. Acronyms (PC, DNA), units (km/h) and maths
// (a+b) are kept: a gloss is removed only when it has a word of 3+ letters
// with a lowercase letter. English-language sections are skipped.
//
// Usage: node scripts/hindi-hints.js [--fix] [--json out.json] file.json ...
// Handles both test formats:
//   examhelp: {sections:[{key}], questions:[{s, a, q:{hi}, o:{hi:[]}, sol:{hi}}]}
//   tet/test_content: [{test_id, questions:[{name, mode, questions:[{answer, hi:{q, options, explanation?}}]}]}]
const fs = require("fs");

const DEV = /[ऀ-ॿ]/;
const GLOSS = /\s*\(([A-Za-z][A-Za-z0-9 .,'’&\/+-]*)\)/g;
const isGloss = (inner) => /(?=[A-Za-z]*[a-z])[A-Za-z]{3,}/.test(inner) && !/\+|\b(Ctrl|Shift|Alt|Win|Esc)\b/.test(inner);
// A removal must not leave empty quotes/brackets or an empty string.
const broken = (s) => !DEV.test(s) || /(['"‘“])\s*\1|['‘][\s]*['’]|\(\s*\)/.test(s);
const ENG_SECTION = /english|अंग्रेज/i;

function clean(str) {
  if (typeof str !== "string" || !DEV.test(str)) return { out: str, hits: [] };
  const hits = [];
  let out = str, prev;
  // Repeat for nested glosses like "(Demography of MP (Census 2011))".
  do { prev = out; out = out.replace(GLOSS, (m, inner) => (isGloss(inner) ? (hits.push(inner), "") : m)); } while (out !== prev);
  if (hits.length && broken(out) && !broken(str)) return { out: str, hits: [], skipped: true };
  return { out, hits };
}

// Calls visit(item) for every Hindi question with a uniform shape:
// {id, n, answer, get/set for q, options[], sol}
function* questions(file, data) {
  if (data && Array.isArray(data.questions) && data.questions[0] && "o" in data.questions[0]) {
    const eng = new Set((data.sections || []).filter((s) => /^(eng|en)$/.test(s.key) || ENG_SECTION.test(s.label?.en || "")).map((s) => s.key));
    const id = data.test || file;
    for (const [i, q] of data.questions.entries()) {
      if (eng.has(q.s) || !q.q || typeof q.q !== "object") continue;
      yield { id, n: i + 1, answer: q.a, node: { q: q.q, o: q.o, sol: q.sol }, kind: "eh" };
    }
    return;
  }
  for (const t of Array.isArray(data) ? data : [data]) {
    let n = 0;
    for (const sec of t.questions || []) {
      const skip = sec.mode === "en" || ENG_SECTION.test(sec.name || "");
      for (const q of sec.questions || []) {
        n++;
        if (skip || !q.hi) continue;
        yield { id: t.test_id || file, n, answer: q.answer, node: q.hi, kind: "tet" };
      }
    }
  }
}

// Second kind of giveaway: only the correct option carries extra text in a
// trailing bracket, e.g. "2879 (479×6+5 = 2879!)" or "X (because ...)".
// Checked in every language and section. Returns [{lang, from, to, dupOf}].
const TRAIL = /\s*\((?:[^()]|\([^()]*\))*\)[\s.!]*$/;
const EQ_BR = /\s*\((?:[^()]|\([^()]*\))*(?:=|→|->)(?:[^()]|\([^()]*\))*\)/g;
function leakFix(opts, answer, lang) {
  if (!Array.isArray(opts) || typeof opts[answer] !== "string") return [];
  const c = opts[answer], others = opts.filter((_, k) => k !== answer).map(String);
  let to = c;
  if (TRAIL.test(c) && !others.some((o) => o.includes("("))) to = c.replace(TRAIL, "");
  else if (!others.some((o) => /=|→|->/.test(o))) to = c.replace(EQ_BR, "");
  to = to.trim();
  if (to === c || !to) return [];
  const dupOf = others.findIndex((o) => o.trim() === to);
  // Would match a wrong option: data error, left as is and listed for a manual fix.
  if (dupOf < 0) opts[answer] = to;
  return [{ lang, from: c, to, dupOf: dupOf < 0 ? null : dupOf >= answer ? dupOf + 1 : dupOf }];
}

function* allOptionSets(file, data) {
  if (data && Array.isArray(data.questions) && data.questions[0] && "o" in data.questions[0]) {
    for (const [i, q] of data.questions.entries())
      for (const lang of Object.keys(q.o || {})) yield { id: data.test || file, n: i + 1, answer: q.a, lang, opts: q.o[lang] };
    return;
  }
  for (const t of Array.isArray(data) ? data : [data]) {
    let n = 0;
    for (const sec of t.questions || []) for (const q of sec.questions || []) {
      n++;
      for (const lang of ["hi", "en"]) if (q[lang]) yield { id: t.test_id || file, n, answer: q.answer, lang, opts: q[lang].options };
    }
  }
}

function processQuestion(item) {
  const found = [];
  const fix = (obj, key, where) => {
    if (!obj || typeof obj[key] !== "string") return;
    const r = clean(obj[key]);
    if (r.hits.length) { found.push({ where, hits: r.hits }); obj[key] = r.out; }
  };
  let opts;
  if (item.kind === "eh") {
    fix(item.node.q, "hi", "q");
    opts = item.node.o && item.node.o.hi;
    if (item.node.sol) fix(item.node.sol, "hi", "sol");
  } else {
    fix(item.node, "q", "q");
    opts = item.node.options;
    fix(item.node, "explanation", "sol");
  }
  const optHit = [];
  let dup = false;
  if (Array.isArray(opts)) {
    const orig = opts.slice(), nq = found.length;
    opts.forEach((_, k) => { const before = found.length; fix(opts, k, "o" + k); optHit[k] = found.length > before; });
    // Glosses that are the only difference between options stay (else options become identical).
    const uniq = (a) => new Set(a.map((x) => String(x).trim())).size;
    if (uniq(opts) < uniq(orig)) { dup = true; orig.forEach((v, k) => (opts[k] = v)); found.splice(nq); optHit.length = 0; }
  }
  const hitIdx = optHit.map((v, k) => (v ? k : -1)).filter((k) => k >= 0);
  const giveaway = hitIdx.length === 1 && hitIdx[0] === item.answer;
  return { found, giveaway, dup };
}

const args = process.argv.slice(2);
const doFix = args.includes("--fix");
const jsonOut = args.includes("--json") ? args[args.indexOf("--json") + 1] : null;
const files = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--json");
const report = [];
let total = { q: 0, opt: 0, sol: 0, giveaway: 0, dup: 0, leak: 0, leakDup: 0 };
const leaks = [];
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  let changed = false;
  for (const item of questions(file, data)) {
    const r = processQuestion(item);
    if (r.dup) total.dup++;
    if (!r.found.length && !r.dup) continue;
    changed = changed || r.found.length > 0;
    for (const f of r.found) total[f.where[0] === "o" ? "opt" : f.where] += f.hits.length;
    if (r.giveaway) total.giveaway++;
    report.push({ file, test: item.id, q: item.n, giveaway: r.giveaway, optionsKept: r.dup, found: r.found });
  }
  for (const it of allOptionSets(file, data)) {
    const l = leakFix(it.opts, it.answer, it.lang);
    if (!l.length) continue;
    changed = true; total.leak++; if (l[0].dupOf !== null) total.leakDup++;
    leaks.push({ file, test: it.id, q: it.n, ...l[0] });
  }
  if (doFix && changed) fs.writeFileSync(file, JSON.stringify(data));
}
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ report, leaks }, null, 1));
for (const l of leaks) console.log(`LEAK ${l.test} Q${l.q} ${l.lang}: ${l.from} -> ${l.to}${l.dupOf !== null ? `  !! NOT changed, would equal option ${l.dupOf + 1}` : ""}`);
for (const r of report.filter((r) => r.giveaway)) console.log(`GIVEAWAY ${r.test} Q${r.q}: ${r.found.map((f) => f.where + "=" + f.hits.join("|")).join("; ")}`);
console.log(`questions with glosses: ${report.length}; glosses in q: ${total.q}, options: ${total.opt}, explanations: ${total.sol}; correct-option-only giveaways: ${total.giveaway}; options kept (gloss is the only difference): ${total.dup}; answer-only bracket leaks: ${total.leak} (${total.leakDup} left for manual fix)${doFix ? " (fixed)" : ""}`);
