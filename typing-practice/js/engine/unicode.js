// Low-level text helpers shared by the typing adapters. Everything here works on
// Unicode *code points* (Array.from), never on UTF-16 code units, so an emoji or
// any astral character counts as one character instead of two.

export const VIRAMA = "्"; // ्  (halant)
export const NUKTA = "़"; // ़
const ZERO_WIDTH = /[​‌‍⁠﻿]/g; // ZWSP, ZWNJ, ZWJ, WJ, BOM

export function toCodePoints(str) {
  return Array.from(str || "");
}

export function isWhitespace(ch) {
  return ch === " " || ch === "\n" || ch === "\t" || ch === "\r" || ch === " " || ch === " " || ch === " ";
}

/** Combining mark (matra, anusvara, nukta, virama, accents…) — never starts a cluster. */
export function isMark(ch) {
  return /\p{M}/u.test(ch);
}

export function isDevanagariConsonant(ch) {
  const c = ch.codePointAt(0);
  return (c >= 0x0915 && c <= 0x0939) || (c >= 0x0958 && c <= 0x095f) || c === 0x0978 || (c >= 0x0979 && c <= 0x097f);
}

/** Zero-width joiners/non-joiners only change how a conjunct is drawn, not what was typed. */
export function stripZeroWidth(str) {
  return str.replace(ZERO_WIDTH, "");
}

/**
 * Split a Devanagari word into visual clusters (aksharas), returned as code-point
 * ranges. A cluster is a base character plus every combining mark after it, and a
 * consonant that follows a virama stays in the same cluster — so "क्ष", "स्थि" and
 * "न्हें" are never split, which would break conjunct shaping when each piece is
 * wrapped in its own <span> for highlighting.
 */
export function segmentDevanagari(cps) {
  const clusters = [];
  let start = 0;
  for (let i = 1; i <= cps.length; i++) {
    if (i === cps.length) {
      clusters.push({ start, end: i });
      break;
    }
    const ch = cps[i];
    const prev = cps[i - 1];
    const joins = isMark(ch) || (prev === VIRAMA && isDevanagariConsonant(ch));
    if (!joins) {
      clusters.push({ start, end: i });
      start = i;
    }
  }
  return cps.length ? clusters : [];
}

/** One cluster per code point, except combining marks stay with their base (é typed as e + ◌́). */
export function segmentSimple(cps) {
  const clusters = [];
  for (let i = 0; i < cps.length; i++) {
    if (i > 0 && isMark(cps[i])) clusters[clusters.length - 1].end = i + 1;
    else clusters.push({ start: i, end: i + 1 });
  }
  return clusters;
}
