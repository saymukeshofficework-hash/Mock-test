// Passage catalogue + selection rules. The UI asks this module for a passage; it
// never reads the passage arrays directly.

import { ENGLISH_PASSAGES } from "./english.js";
import { HINDI_PASSAGES } from "./hindi-unicode.js";
import { KRUTIDEV_PASSAGES } from "./krutidev.js";

const BY_FORMAT = {
  english: ENGLISH_PASSAGES,
  "hindi-unicode": HINDI_PASSAGES,
  mangal: HINDI_PASSAGES,
  krutidev: KRUTIDEV_PASSAGES,
};

export const DIFFICULTIES = ["easy", "medium", "hard", "exam"];
export const LENGTHS = ["random", "short", "medium", "long"];

/** Length bucket by character count. */
export function lengthOf(passage) {
  const n = Array.from(passage.text).length;
  if (n < 300) return "short";
  if (n < 600) return "medium";
  return "long";
}

export function getPassages(formatId) {
  return BY_FORMAT[formatId] || [];
}

export function getPassageById(formatId, id) {
  return getPassages(formatId).find((p) => p.id === id) || null;
}

/** Characters a student at `wpm` types in `durationSec` — used to size the passage. */
export function charsNeeded(durationSec, wpm = 45) {
  return Math.ceil((durationSec / 60) * wpm * 5);
}

/**
 * Choose a passage for a test.
 * - filters by difficulty and length (falling back gracefully when a filter leaves nothing),
 * - avoids the recently used ids,
 * - for long durations, chains further passages of the same format and difficulty so
 *   a 10-minute test does not end after the first paragraph.
 * @returns {{id, ids, title, category, difficulty, text, unicodeText?}|null}
 */
export function selectPassage({ formatId, difficulty = "medium", length = "random", durationSec = 60, recentIds = [], random = Math.random }) {
  const all = getPassages(formatId);
  if (!all.length) return null;

  let pool = all.filter((p) => p.difficulty === difficulty);
  if (!pool.length) pool = all;
  if (length !== "random") {
    const byLength = pool.filter((p) => lengthOf(p) === length);
    if (byLength.length) pool = byLength;
  }
  const fresh = pool.filter((p) => !recentIds.includes(p.id));
  const candidates = fresh.length ? fresh : pool;
  const first = candidates[Math.floor(random() * candidates.length)];

  return chainForDuration(formatId, first, durationSec, difficulty);
}

/** Extend a passage with others (same difficulty first) until it lasts for `durationSec`. */
export function chainForDuration(formatId, first, durationSec, difficulty = first.difficulty) {
  const all = getPassages(formatId);
  const needed = charsNeeded(durationSec);
  const parts = [first];
  let size = Array.from(first.text).length;
  const rest = [
    ...all.filter((p) => p.difficulty === difficulty && p.id !== first.id),
    ...all.filter((p) => p.difficulty !== difficulty && p.id !== first.id),
  ];
  for (const p of rest) {
    if (size >= needed) break;
    parts.push(p);
    size += Array.from(p.text).length + 1;
  }
  return {
    id: first.id,
    ids: parts.map((p) => p.id),
    title: first.title,
    category: first.category,
    difficulty: first.difficulty,
    text: parts.map((p) => p.text).join(" "),
    unicodeText: first.unicodeText ? parts.map((p) => p.unicodeText).join(" ") : undefined,
  };
}

/** Deterministic "passage of the day" for a format: same for every student on a given date. */
export function dailyPassage(formatId, dateKey) {
  const pool = getPassages(formatId).filter((p) => p.difficulty === "easy" || p.difficulty === "medium");
  if (!pool.length) return null;
  let h = 2166136261;
  for (const ch of `${dateKey}|${formatId}`) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return pool[h % pool.length];
}

/** Estimated minutes to type a passage at a comfortable pace, rounded up to a whole minute. */
export function estimatedMinutes(passage, wpm = 30) {
  return Math.max(1, Math.ceil(Array.from(passage.text).length / 5 / wpm));
}
