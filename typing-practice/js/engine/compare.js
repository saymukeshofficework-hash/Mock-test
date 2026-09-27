// Word-aware positional comparison between the passage and what has been typed.
//
// Comparison is done word by word (words split on whitespace), then character by
// character inside each word. A skipped or extra letter therefore only costs errors
// in *that* word instead of shifting every later character out of alignment. Spaces
// are real characters: each expected space typed counts as a correct character,
// while extra spaces (double spaces, leading spaces, a space after the last word)
// count as incorrect ones.

import { isWhitespace } from "./unicode.js";

/** Prepare a passage once per test: normalized words, units and visual clusters. */
export function preparePassage(text, adapter) {
  const normalized = adapter.normalize(text).replace(/\s+/g, " ").trim();
  const words = normalized.length
    ? normalized.split(" ").map((w) => {
        const units = adapter.toUnits(w);
        return { text: w, units, clusters: adapter.segment(units) };
      })
    : [];
  const totalUnits = words.reduce((n, w) => n + w.units.length, 0) + Math.max(0, words.length - 1);
  return { text: normalized, words, totalUnits };
}

/** Split typed units into words. The last entry is always the word being typed now. */
export function splitTyped(units) {
  const words = [];
  let cur = [];
  let extraSpaces = 0;
  for (const ch of units) {
    if (isWhitespace(ch)) {
      if (cur.length) {
        words.push(cur);
        cur = [];
      } else {
        extraSpaces++;
      }
    } else {
      cur.push(ch);
    }
  }
  words.push(cur);
  return { words, extraSpaces };
}

/**
 * Compare typed text with a prepared passage.
 *
 * Typed words are matched to passage words in order, with cheap re-synchronisation
 * so one slip does not make every following word wrong:
 *   - missed space   "tothe"      for "to the"      → one missing character
 *   - extra space    "educa tion" for "education"   → one incorrect character
 *   - skipped word   "the brown"  for "the quick brown" → that word's characters missing
 *   - extra word     "the the cat" for "the cat"    → the extra word is incorrect
 * Anything else is compared letter by letter against the expected word.
 *
 * Returns counts (in comparison units, i.e. code points) plus, for the passage view,
 * what was typed for each passage word (`targetTyped`), the index of the word being
 * typed now (`currentIndex`) and the passage spaces that were skipped (`missedSpaces`).
 */
export function compareTyped(prepared, typedText, adapter) {
  const units = adapter.toUnits(adapter.normalize(typedText));
  const { words: typedWords, extraSpaces } = splitTyped(units);
  const target = prepared.words;
  const n = target.length;
  const completed = typedWords.slice(0, -1);
  const current = typedWords[typedWords.length - 1];

  const targetTyped = [];
  const missedSpaces = new Set();
  let correct = 0;
  let incorrect = extraSpaces;
  let missed = 0;
  let position = 0; // how far through the passage the student is, in units

  const eq = (a, b) => a.length === b.length && a.every((c, k) => adapter.compareUnits(b[k], c));
  const scoreWord = (typed, j) => {
    const r = adapter.calculateErrors(target[j].units, typed);
    correct += r.correct;
    incorrect += r.incorrect + r.extra;
    missed += r.missing;
    position += target[j].units.length;
    targetTyped[j] = typed;
  };
  // The space the student typed after passage word j.
  const scoreSeparator = (j) => {
    if (j < n - 1) {
      correct += 1;
      position += 1;
    } else {
      incorrect += 1;
    }
  };

  let j = 0;
  for (let i = 0; i < completed.length; i++) {
    const tw = completed[i];
    if (j >= n) {
      incorrect += tw.length + 1; // words typed beyond the end of the passage
      continue;
    }
    const t0 = target[j].units;
    const t1 = j + 1 < n ? target[j + 1].units : null;
    const next = i + 1 < completed.length ? completed[i + 1] : null;

    if (eq(tw, t0)) {
      scoreWord(tw, j);
      scoreSeparator(j);
      j += 1;
    } else if (t1 && eq(tw, t0.concat(t1))) {
      scoreWord(tw.slice(0, t0.length), j);
      missed += 1;
      position += 1;
      missedSpaces.add(j);
      scoreWord(tw.slice(t0.length), j + 1);
      scoreSeparator(j + 1);
      j += 2;
    } else if (next && eq(tw.concat(next), t0)) {
      scoreWord(tw.concat(next), j);
      incorrect += 1;
      scoreSeparator(j);
      j += 1;
      i += 1;
    } else if (t1 && eq(tw, t1)) {
      targetTyped[j] = [];
      missed += t0.length + 1;
      position += t0.length + 1;
      scoreWord(tw, j + 1);
      scoreSeparator(j + 1);
      j += 2;
    } else if (next && eq(next, t0)) {
      incorrect += tw.length + 1;
    } else {
      scoreWord(tw, j);
      scoreSeparator(j);
      j += 1;
    }
  }

  let complete = false;
  if (j < n) {
    const r = adapter.calculateErrors(target[j].units, current);
    correct += r.correct;
    incorrect += r.incorrect + r.extra;
    position += Math.min(current.length, target[j].units.length);
    targetTyped[j] = current;
    complete = j === n - 1 && current.length >= target[j].units.length;
  } else {
    incorrect += current.length;
    complete = n > 0;
  }

  const total = prepared.totalUnits;
  return {
    targetTyped,
    currentIndex: j,
    missedSpaces,
    correct,
    incorrect,
    missed,
    typed: correct + incorrect,
    typedUnits: units.length,
    position: Math.min(position, total),
    progress: total ? Math.min(100, (Math.min(position, total) / total) * 100) : 0,
    complete,
  };
}
