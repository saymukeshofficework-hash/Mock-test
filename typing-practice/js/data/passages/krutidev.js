// Kruti Dev practice passages, generated from the Hindi Unicode passages by the
// Unicode → Kruti Dev conversion layer. Each passage keeps three separate texts:
//   text        — Kruti Dev (legacy ASCII) text: what is displayed with the Kruti Dev
//                 font and what the student's typing is compared against;
//   unicodeText — the same passage in Unicode, shown as a readable reference when
//                 the Kruti Dev font is not available on the device;
//   encoding    — "krutidev-legacy", so nothing downstream mistakes it for Unicode.
// To add a hand-typed Kruti Dev passage, append {id, category, difficulty, title,
// text, unicodeText} to EXTRA_KRUTIDEV_PASSAGES instead.

import { HINDI_PASSAGES } from "./hindi-unicode.js";
import { unicodeToKrutidev } from "../../engine/krutidev.js";

const EXTRA_KRUTIDEV_PASSAGES = [];

export const KRUTIDEV_PASSAGES = HINDI_PASSAGES.map((p) => ({
  id: p.id.replace(/^hi-/, "kd-"),
  category: p.category,
  difficulty: p.difficulty,
  title: p.title,
  text: unicodeToKrutidev(p.text),
  unicodeText: p.text,
  encoding: "krutidev-legacy",
})).concat(EXTRA_KRUTIDEV_PASSAGES);
