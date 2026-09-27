// Typing adapters: the only place that knows how a given typing format turns raw
// text into comparable characters and visual clusters. The engine and UI never
// assume that Unicode Hindi and Kruti Dev text are the same thing — they keep five
// separate concerns, and each adapter answers them for its format:
//
//   1. display text    — what the student reads         (passage.text)
//   2. input text      — what the student types         (textarea value)
//   3. comparison text — both sides after normalize()    (code-point arrays)
//   4. font            — adapter.fontClass               (CSS class on passage + input)
//   5. encoding        — adapter.encoding                ("unicode" | "krutidev-legacy")
//
// Interface (duck-typed, documented as TypingAdapter):
//   id, encoding, fontClass, lang
//   normalize(text)                → string ready for comparison
//   toUnits(text)                  → array of comparable characters (code points)
//   segment(units)                 → [{start, end}] visual clusters over those units
//   compareUnits(expected, typed)  → boolean
//   calculateErrors(expectedUnits, typedUnits) → {correct, incorrect, extra, missing}
//   renderText(units, start, end)  → display string for one cluster

import { toCodePoints, stripZeroWidth, segmentDevanagari, segmentSimple } from "./unicode.js";

class TypingAdapter {
  constructor({ id, encoding, fontClass, lang }) {
    this.id = id;
    this.encoding = encoding;
    this.fontClass = fontClass;
    this.lang = lang;
  }
  normalize(text) {
    return String(text || "").normalize("NFC").replace(/\r\n?/g, "\n").replace(/[   ]/g, " ");
  }
  toUnits(text) {
    return toCodePoints(text);
  }
  segment(units) {
    return segmentSimple(units);
  }
  compareUnits(expected, typed) {
    return expected === typed;
  }
  /** Positional comparison of one word; extra typed units are errors, untyped ones are "missing". */
  calculateErrors(expectedUnits, typedUnits) {
    let correct = 0;
    let incorrect = 0;
    const n = Math.min(expectedUnits.length, typedUnits.length);
    for (let i = 0; i < n; i++) {
      if (this.compareUnits(expectedUnits[i], typedUnits[i])) correct++;
      else incorrect++;
    }
    const extra = Math.max(0, typedUnits.length - expectedUnits.length);
    const missing = Math.max(0, expectedUnits.length - typedUnits.length);
    return { correct, incorrect, extra, missing };
  }
  renderText(units, start = 0, end = units.length) {
    return units.slice(start, end).join("");
  }
}

export class EnglishTypingAdapter extends TypingAdapter {
  constructor() {
    super({ id: "english", encoding: "unicode", fontClass: "font-english", lang: "en" });
  }
  normalize(text) {
    // Phone keyboards "smart-quote" apostrophes and turn "--" into dashes; a student
    // typing ' should not be marked wrong because iOS replaced it with ’.
    return super
      .normalize(stripZeroWidth(text))
      .replace(/[‘’‛′]/g, "'")
      .replace(/[“”‟″]/g, '"')
      .replace(/[–—]/g, "-")
      .replace(/…/g, "...");
  }
}

export class UnicodeHindiTypingAdapter extends TypingAdapter {
  constructor({ id = "hindi-unicode", fontClass = "font-devanagari" } = {}) {
    super({ id, encoding: "unicode", fontClass, lang: "hi" });
  }
  normalize(text) {
    // NFC makes precomposed and decomposed forms identical (क़ U+0958 vs क + ़);
    // ZWJ/ZWNJ only change conjunct rendering; many IMEs type | or ॰ for the danda.
    return super
      .normalize(stripZeroWidth(text))
      .replace(/\|/g, "।")
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"');
  }
  segment(units) {
    return segmentDevanagari(units);
  }
}

export class KrutidevTypingAdapter extends TypingAdapter {
  constructor() {
    super({ id: "krutidev", encoding: "krutidev-legacy", fontClass: "font-krutidev", lang: "hi" });
  }
  normalize(text) {
    // Kruti Dev text is ASCII/Latin-1; never Unicode-normalize it into something else,
    // and never touch quotes — ' is श, " is ष in this layout.
    return String(text || "").replace(/\r\n?/g, "\n").replace(/ /g, " ");
  }
  segment(units) {
    // Kruti Dev draws matras/marks as zero-width glyphs after the letter, and "f" (ि)
    // before it — keep them in one cluster so highlighting covers the whole syllable.
    const ATTACH_PREV = new Set(["s", "S", "a", "¡", "Z", "~", "+", "q", "w", "`", "ª", "W", "z"]);
    const clusters = [];
    for (let i = 0; i < units.length; i++) {
      const prev = clusters[clusters.length - 1];
      if (prev && (ATTACH_PREV.has(units[i]) || units[prev.end - 1] === "f")) prev.end = i + 1;
      else clusters.push({ start: i, end: i + 1 });
    }
    return clusters;
  }
}

const ADAPTERS = {
  english: () => new EnglishTypingAdapter(),
  "hindi-unicode": () => new UnicodeHindiTypingAdapter(),
  // Mangal is a Unicode font: same engine as Hindi Unicode, different display font.
  mangal: () => new UnicodeHindiTypingAdapter({ id: "mangal", fontClass: "font-mangal" }),
  krutidev: () => new KrutidevTypingAdapter(),
};

export function getAdapter(formatId) {
  const make = ADAPTERS[formatId];
  if (!make) throw new Error(`Unknown typing format: ${formatId}`);
  return make();
}
