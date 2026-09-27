// Unit tests for the typing engine: known inputs → expected numbers.
// Run: cd typing-practice && npm test   (or: node --test tests/)
import { test } from "node:test";
import assert from "node:assert/strict";

import { calculateMetrics, performanceLevel, formatClock } from "../js/engine/metrics.js";
import { TypingEngine } from "../js/engine/typing-engine.js";
import { getAdapter } from "../js/engine/adapters.js";
import { preparePassage, compareTyped } from "../js/engine/compare.js";
import { analyzeWords, characterErrors } from "../js/engine/analysis.js";
import { segmentDevanagari, toCodePoints } from "../js/engine/unicode.js";

/** A fake clock the test controls. */
function clock(start = 0) {
  let t = start;
  const now = () => t;
  now.advance = (ms) => (t += ms);
  return now;
}

function engine(text, format = "english", durationMs = 60000) {
  const now = clock(1000);
  const e = new TypingEngine({ text, adapter: getAdapter(format), durationMs, now });
  return { e, now };
}

// A 20-word passage of 4-letter words: 20 × 4 + 19 spaces = 99 characters.
const WORDS20 = Array.from({ length: 20 }, (_, i) => "abcdefghijklmnopqrst"[i].repeat(4)).join(" ");

// ---------------------------------------------------------------- formulas
test("formula: 100 correct characters in 1 minute", () => {
  const m = calculateMetrics({ correct: 100, incorrect: 0 }, 60000);
  assert.equal(m.wpm, 20);
  assert.equal(m.grossWpm, 20);
  assert.equal(m.netWpm, 20);
  assert.equal(m.cpm, 100);
  assert.equal(m.accuracy, 100);
  assert.equal(m.errors, 0);
});

test("formula: 90 correct + 10 incorrect in 1 minute", () => {
  const m = calculateMetrics({ correct: 90, incorrect: 10 }, 60000);
  assert.equal(m.accuracy, 90);
  assert.equal(m.grossWpm, 20); // 100 typed / 5
  assert.equal(m.netWpm, 10); // 20 − 10 errors per minute
  assert.equal(m.wpm, 18); // 90 / 5
  assert.equal(m.cpm, 90);
  assert.equal(m.errors, 10);
  assert.equal(m.incorrectChars, 10);
});

test("formula: 30-second test doubles the per-minute rates", () => {
  const m = calculateMetrics({ correct: 50, incorrect: 0 }, 30000);
  assert.equal(m.wpm, 20);
  assert.equal(m.cpm, 100);
});

test("formula: empty input gives zeros, not NaN", () => {
  const m = calculateMetrics({ correct: 0, incorrect: 0 }, 0);
  for (const k of ["wpm", "grossWpm", "netWpm", "cpm", "accuracy", "errors"]) assert.equal(m[k], 0, k);
});

test("formula: net WPM never goes below zero", () => {
  const m = calculateMetrics({ correct: 5, incorrect: 50 }, 60000);
  assert.equal(m.netWpm, 0);
});

test("performance levels and clock formatting", () => {
  assert.equal(performanceLevel(95), "excellent");
  assert.equal(performanceLevel(70), "veryGood");
  assert.equal(performanceLevel(55), "good");
  assert.equal(performanceLevel(35), "average");
  assert.equal(performanceLevel(20), "needsPractice");
  assert.equal(performanceLevel(40, "hi"), "good");
  assert.equal(formatClock(59001), "01:00");
  assert.equal(formatClock(59001, { roundUp: false }), "00:59");
  assert.equal(formatClock(0), "00:00");
});

// ---------------------------------------------------------------- engine
test("engine: 100 correct characters typed in 1 minute → 20 WPM, 100%", () => {
  const text = WORDS20 + " uuuu vvvv";
  const { e, now } = engine(text, "english", 120000);
  const typed = text.slice(0, 100); // 99 chars of WORDS20 + the following space
  e.setInput(typed[0]);
  now.advance(60000);
  e.setInput(typed);
  const m = e.getMetrics();
  assert.equal(m.correctChars, 100);
  assert.equal(m.incorrectChars, 0);
  assert.equal(m.wpm, 20);
  assert.equal(m.accuracy, 100);
});

test("engine: 90 correct + 10 incorrect characters", () => {
  const text = WORDS20 + " uuuu vvvv";
  const { e, now } = engine(text, "english", 120000);
  // Replace the first letter of words 1..10 with "x": 10 substitutions, alignment intact.
  const typed = text
    .slice(0, 100)
    .split(" ")
    .map((w, i) => (i < 10 ? "x" + w.slice(1) : w))
    .join(" ");
  e.setInput("x");
  now.advance(60000);
  e.setInput(typed);
  const m = e.getMetrics();
  assert.equal(m.correctChars, 90);
  assert.equal(m.incorrectChars, 10);
  assert.equal(m.accuracy, 90);
  assert.equal(m.grossWpm, 20);
  assert.equal(m.netWpm, 10);
});

test("engine: nothing typed → timer never starts, all zeros", () => {
  const { e, now } = engine("hello world");
  now.advance(30000);
  assert.equal(e.state, "ready");
  const r = e.finish("ended");
  assert.equal(r.metrics.elapsedMs, 0);
  assert.equal(r.metrics.wpm, 0);
  assert.equal(r.metrics.accuracy, 0);
});

test("engine: partial input reports progress and does not finish", () => {
  const { e, now } = engine("one two three four");
  e.setInput("o");
  now.advance(5000);
  const res = e.setInput("one two ");
  assert.equal(res.completed, false);
  const m = e.getMetrics();
  assert.equal(m.correctChars, 8);
  assert.equal(m.progress, Math.round((8 / 18) * 1000) / 10);
});

test("engine: backspace correction — fixed mistakes are not errors, but are counted", () => {
  const { e, now } = engine("the cat");
  e.setInput("t");
  e.setInput("th");
  e.setInput("tha"); // mistake
  e.setInput("th"); // backspace
  e.setInput("the");
  now.advance(6000);
  e.setInput("the c");
  const m = e.getMetrics();
  assert.equal(m.incorrectChars, 0);
  assert.equal(m.accuracy, 100);
  assert.equal(m.correctedErrors, 1);
});

test("engine: multiple spaces count as one error each and do not shift later words", () => {
  const { e, now } = engine("the cat sat");
  e.setInput("t");
  now.advance(6000);
  e.setInput("the  cat s");
  const m = e.getMetrics();
  assert.equal(m.incorrectChars, 1); // the extra space
  assert.equal(m.correctChars, 3 + 1 + 3 + 1 + 1);
});

test("engine: leading space is an error", () => {
  const c = compareTyped(preparePassage("hi there", getAdapter("english")), " hi", getAdapter("english"));
  assert.equal(c.incorrect, 1);
  assert.equal(c.correct, 2);
});

test("engine: punctuation is compared exactly; smart quotes match straight quotes", () => {
  const en = getAdapter("english");
  const p = preparePassage("Hello, world. Don't stop.", en);
  const missingComma = compareTyped(p, "Hello world. ", en);
  assert.equal(missingComma.missed, 1); // the comma, in a finished word
  const smart = compareTyped(p, "Hello, world. Don’t", en);
  assert.equal(smart.incorrect, 0);
});

test("engine: an error in one word does not affect the next word", () => {
  const en = getAdapter("english");
  const p = preparePassage("education gives us", en);
  const c = compareTyped(p, "educaton gives us", en); // one letter skipped
  assert.equal(c.incorrect, 2); // educat + o≠i + n≠o, then one letter missing
  assert.equal(c.missed, 1);
  assert.equal(c.correct, 6 + 1 + 5 + 1 + 2);
});

test("engine: pause stops the clock and keeps the typed text; resume continues", () => {
  const { e, now } = engine("alpha beta gamma", "english", 60000);
  e.setInput("a");
  now.advance(10000);
  e.pause();
  now.advance(50000); // time while paused must not count
  assert.equal(e.getElapsedMs(), 10000);
  assert.equal(e.setInput("alpha").accepted, false); // input ignored while paused
  assert.equal(e.input, "a");
  e.resume();
  now.advance(5000);
  e.setInput("alpha");
  assert.equal(e.getElapsedMs(), 15000);
});

test("engine: ends automatically when time runs out (and survives timer throttling)", () => {
  const { e, now } = engine("alpha beta gamma", "english", 15000);
  e.setInput("a");
  now.advance(40000); // background tab: no ticks for 40 s
  const r = e.tick();
  assert.equal(r.finished, true);
  assert.equal(e.endReason, "time");
  assert.equal(e.getElapsedMs(), 15000); // clamped to the test duration
});

test("engine: ends automatically when the passage is completed", () => {
  const { e, now } = engine("to be", "english", 60000);
  e.setInput("t");
  now.advance(2000);
  const r = e.setInput("to be");
  assert.equal(r.completed, true);
  assert.equal(e.endReason, "completed");
  assert.equal(e.getMetrics().progress, 100);
});

test("engine: does not complete mid-IME-composition", () => {
  const { e } = engine("नमस्ते", "hindi-unicode");
  const r = e.setInput("नमस्ते", { composing: true });
  assert.equal(r.completed, false);
  assert.equal(e.setInput("नमस्ते").completed, true);
});

test("engine: large single insertion is detected (paste-like)", () => {
  const { e } = engine("a".repeat(10) + " " + "b".repeat(40));
  const r = e.setInput("aaaaaaaaaa " + "b".repeat(30));
  assert.equal(r.largeInsertion, true);
  assert.equal(e.largeInsertions, 1);
});

test("engine: emoji counts as one character", () => {
  const en = getAdapter("english");
  const c = compareTyped(preparePassage("hi there", en), "h😀", en);
  assert.equal(c.typed, 2);
  assert.equal(c.incorrect, 1);
});

test("engine: speed samples are recorded once per second", () => {
  const { e, now } = engine(WORDS20, "english", 10000);
  e.setInput("a");
  for (let i = 0; i < 5; i++) {
    now.advance(1000);
    e.setInput(WORDS20.slice(0, (i + 1) * 5));
    e.tick();
  }
  const series = e.finish().speedSeries;
  assert.equal(series.length, 5);
  assert.deepEqual(series.map((p) => p.t), [1, 2, 3, 4, 5]);
  assert.equal(series[4].avg, 60); // 25 correct chars in 5 s = 60 WPM
});

// ---------------------------------------------------------------- Hindi Unicode
test("Hindi: correct Unicode text is fully correct", () => {
  const hi = getAdapter("hindi-unicode");
  const p = preparePassage("शिक्षा हमें", hi);
  const c = compareTyped(p, "शिक्षा हमें", hi);
  assert.equal(c.incorrect, 0);
  assert.equal(c.correct, toCodePoints("शिक्षा हमें").length);
  assert.equal(c.complete, true);
});

test("Hindi: NFC — precomposed and decomposed nukta letters are equal", () => {
  const hi = getAdapter("hindi-unicode");
  const p = preparePassage("ज़रा", hi); // ज़रा with precomposed ज़
  const c = compareTyped(p, "ज़रा", hi); // ज + ़ + रा
  assert.equal(c.incorrect, 0);
  assert.equal(c.complete, true);
});

test("Hindi: ZWJ/ZWNJ from an IME and | for danda are ignored/normalized", () => {
  const hi = getAdapter("hindi-unicode");
  const p = preparePassage("क्षमा है।", hi);
  const c = compareTyped(p, "क्‍षमा है|", hi);
  assert.equal(c.incorrect, 0);
});

test("Hindi: a wrong matra is one error, not a whole-word error", () => {
  const hi = getAdapter("hindi-unicode");
  const p = preparePassage("किताब", hi);
  const c = compareTyped(p, "कीताब", hi); // ी instead of ि
  assert.equal(c.incorrect, 1);
  assert.equal(c.correct, 4);
});

test("Hindi: clusters keep conjuncts and matras together", () => {
  const seg = (w) => segmentDevanagari(toCodePoints(w)).map(({ start, end }) => toCodePoints(w).slice(start, end).join(""));
  assert.deepEqual(seg("शिक्षा"), ["शि", "क्षा"]);
  assert.deepEqual(seg("उन्होंने"), ["उ", "न्हों", "ने"]);
  assert.deepEqual(seg("स्थिति"), ["स्थि", "ति"]);
});

test("Hindi: metrics on a Hindi sentence", () => {
  const { e, now } = engine("भारत एक विशाल देश है", "hindi-unicode", 60000);
  e.setInput("भ");
  now.advance(12000);
  e.setInput("भारत एक विशाल देश है");
  const m = e.getMetrics();
  assert.equal(m.accuracy, 100);
  assert.equal(m.correctChars, toCodePoints("भारत एक विशाल देश है").length);
  assert.equal(e.endReason, "completed");
});

// ---------------------------------------------------------------- Krutidev
test("Krutidev: comparison is on the legacy ASCII text, not Unicode", () => {
  const kd = getAdapter("krutidev");
  const p = preparePassage("f'k{kk gesa", kd);
  assert.equal(compareTyped(p, "f'k{kk gesa", kd).incorrect, 0);
  // Unicode Hindi typed into Krutidev mode is wrong — the encodings differ.
  assert.ok(compareTyped(p, "शिक्षा", kd).incorrect > 0);
  // Quotes are letters in Kruti Dev (' = श) and must not be "smart-quote" normalized.
  assert.equal(kd.normalize("f’k"), "f’k");
});

// ---------------------------------------------------------------- analysis
test("analysis: missed and extra words are aligned, not cascaded", () => {
  const en = getAdapter("english");
  const p = preparePassage("the quick brown fox jumps over", en);
  const a = analyzeWords(p, "the brown fox fox jumps ovr", en);
  assert.equal(a.missed, 1); // quick
  assert.equal(a.extra, 1); // second fox
  assert.equal(a.incorrect, 1); // ovr
  assert.equal(a.correct, 4);
  const pairs = characterErrors(a.rows, en);
  assert.deepEqual(pairs[0], { expected: "e", typed: "r", count: 1 });
});

test("analysis: the word still being typed at time-up is not counted as wrong", () => {
  const en = getAdapter("english");
  const p = preparePassage("pay bills from home", en);
  const a = analyzeWords(p, "pay bills fr", en);
  assert.equal(a.incorrect, 0);
  assert.equal(a.correct, 2);
  // …but a finished wrong word still is.
  assert.equal(analyzeWords(p, "pay bills fr ", en).incorrect, 1);
});

// ---------------------------------------------------------------- re-synchronisation
test("resync: a missed space costs one character, not the rest of the passage", () => {
  const en = getAdapter("english");
  const p = preparePassage("to the market and back", en);
  const c = compareTyped(p, "tothe market and b", en);
  assert.equal(c.missed, 1);
  assert.equal(c.incorrect, 0);
  assert.equal(c.currentIndex, 4);
  assert.ok(c.missedSpaces.has(0));
});

test("resync: an extra space inside a word is one error", () => {
  const en = getAdapter("english");
  const p = preparePassage("education gives us", en);
  const c = compareTyped(p, "educa tion gives u", en);
  assert.equal(c.incorrect, 1);
  assert.equal(c.missed, 0);
  assert.equal(c.currentIndex, 2);
});

test("resync: a skipped word is missed, later words stay correct", () => {
  const en = getAdapter("english");
  const p = preparePassage("the quick brown fox jumps", en);
  const c = compareTyped(p, "the brown fox j", en);
  assert.equal(c.missed, "quick".length + 1);
  assert.equal(c.incorrect, 0);
  assert.equal(c.currentIndex, 4);
});

test("resync: an extra word is incorrect, later words stay correct", () => {
  const en = getAdapter("english");
  const p = preparePassage("the cat sat down", en);
  const c = compareTyped(p, "the big cat sat d", en);
  assert.equal(c.incorrect, "big".length + 1);
  assert.equal(c.missed, 0);
  assert.equal(c.currentIndex, 3);
});
