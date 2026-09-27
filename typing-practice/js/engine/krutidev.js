// Unicode Devanagari → Kruti Dev 010 (legacy, non-Unicode) conversion layer.
//
// Kruti Dev is not an encoding of Hindi — it is a font that draws Devanagari glyphs
// on top of ordinary ASCII / Latin-1 code points typed on the Remington keyboard
// layout. "शिक्षा" in Kruti Dev is literally the ASCII string "f'k{kk". So:
//   * the Krutidev passage the student sees is this ASCII string drawn with the
//     Kruti Dev font,
//   * the student types those same ASCII keys (a Krutidev typist's muscle memory),
//   * and comparison happens on the ASCII strings, never on Unicode Hindi.
//
// Passages are written once in Unicode (js/data/passages/hindi-unicode.js) and
// converted here, so the same content powers every Hindi format. The converter
// works syllable by syllable (akshara), which is how Kruti Dev text is typed:
//   [ि as "f"] + consonant cluster + other matras + [reph as "Z"] + [ं ँ ः]

const VIRAMA = "्";
const NUKTA = "़";
const I_MATRA = "ि"; // ि
const RA = "र"; // र

// Full form and (where one exists) half form of each consonant.
const CONSONANTS = {
  "क": ["d", "D"], "ख": ["[k", "["], "ग": ["x", "X"], "घ": ["?k", "?"], "ङ": ["³", null],
  "च": ["p", "P"], "छ": ["N", null], "ज": ["t", "T"], "झ": [">", "÷"], "ञ": ["¥", null],
  "ट": ["V", null], "ठ": ["B", null], "ड": ["M", null], "ढ": ["<", null], "ण": [".k", "."],
  "त": ["r", "R"], "थ": ["Fk", "F"], "द": ["n", null], "ध": ["/k", "/"], "न": ["u", "U"],
  "प": ["i", "I"], "फ": ["Q", "¶"], "ब": ["c", "C"], "भ": ["Hk", "H"], "म": ["e", "E"],
  "य": [";", "¸"], "र": ["j", null], "ल": ["y", "Y"], "ळ": ["G", null], "व": ["o", "O"],
  "श": ["'k", "'"], "ष": ['"k', '"'], "स": ["l", "L"], "ह": ["g", "º"],
};

// Conjuncts that have their own glyph in Kruti Dev (full form, half form).
const CONJUNCTS = {
  "क्ष": ["{k", "{"], "त्र": ["=", "«"], "ज्ञ": ["K", null], "श्र": ["J", null],
  "द्य": ["|", null], "द्व": ["}", null], "द्ध": [")", null], "त्त": ["Ùk", "Ù"],
  "द्द": ["í", null], "ह्म": ["ã", null], "ह्न": ["à", null], "ह्य": ["á", null],
  "क्र": ["Ø", null], "द्र": ["æ", null], "फ्र": ["Ý", null],
  "ट्र": ["Vª", null], "ड्र": ["Mª", null], "ढ्र": ["<ª", null], "छ्र": ["Nª", null],
};

// Consonants whose Kruti Dev glyph has no vertical bar take "ª" for a subscript र;
// the rest take "z" (प्र → iz, ग्र → xz).
const ROUND_CONSONANTS = new Set(["ट", "ठ", "ड", "ढ", "छ"]);

const INDEPENDENT_VOWELS = {
  "अ": "v", "आ": "vk", "इ": "b", "ई": "bZ", "उ": "m", "ऊ": "Å", "ऋ": "_",
  "ए": ",", "ऐ": ",s", "ओ": "vks", "औ": "vkS", "ऑ": "vkW",
};

const MATRAS = {
  "ा": "k", "ी": "h", "ु": "q", "ू": "w", "ृ": "`", "े": "s", "ै": "S",
  "ो": "ks", "ौ": "kS", "ॉ": "kW", "ॅ": "W",
};

const MODIFIERS = { "ं": "a", "ँ": "¡", "ः": "%" };

const PUNCTUATION = {
  "।": "A", "॥": "AA", ",": "]", ".": "-", "?": "\\", "-": "&", "(": "¼", ")": "½",
  "‘": "^", "’": "*", "“": "Þ", "”": "ß", "=": "¾", "ऽ": "·",
};

const isConsonant = (ch) => Object.prototype.hasOwnProperty.call(CONSONANTS, ch);

/** Parse Unicode text into aksharas + passthrough characters. */
function parseAksharas(text) {
  const cps = Array.from(text.normalize("NFC"));
  const out = [];
  let i = 0;
  while (i < cps.length) {
    const ch = cps[i];
    // Reph: र + ् + consonant at the start of a syllable (not after another consonant+virama).
    let reph = false;
    if (ch === RA && cps[i + 1] === VIRAMA && isConsonant(cps[i + 2] || "")) {
      reph = true;
      i += 2;
    }
    const c = cps[i];
    if (isConsonant(c)) {
      const units = []; // [{ch, nukta}]
      let trailingVirama = false;
      while (i < cps.length && isConsonant(cps[i])) {
        const unit = { ch: cps[i], nukta: false };
        i++;
        if (cps[i] === NUKTA) {
          unit.nukta = true;
          i++;
        }
        units.push(unit);
        if (cps[i] === VIRAMA) {
          if (isConsonant(cps[i + 1] || "")) {
            i++;
            continue;
          }
          trailingVirama = true;
          i++;
        }
        break;
      }
      const matras = [];
      const mods = [];
      while (i < cps.length && (MATRAS[cps[i]] || cps[i] === I_MATRA || MODIFIERS[cps[i]])) {
        if (MODIFIERS[cps[i]]) mods.push(cps[i]);
        else matras.push(cps[i]);
        i++;
      }
      out.push({ type: "akshara", reph, units, trailingVirama, matras, mods });
      continue;
    }
    if (reph) {
      // र् not followed by a consonant cluster we understand — emit literally.
      out.push({ type: "raw", text: "j~" });
      continue;
    }
    if (INDEPENDENT_VOWELS[c]) {
      const mods = [];
      i++;
      while (i < cps.length && MODIFIERS[cps[i]]) mods.push(cps[i++]);
      out.push({ type: "vowel", ch: c, mods });
      continue;
    }
    out.push({ type: "raw", text: c });
    i++;
  }
  return out;
}

/** Convert a consonant cluster (list of units, implicit viramas between them). */
function convertCluster(units, trailingVirama) {
  let s = "";
  let i = 0;
  while (i < units.length) {
    const u = units[i];
    const next = units[i + 1];
    const isLast = i === units.length - 1;
    // Two-consonant conjunct with its own glyph?
    if (next && !u.nukta && !next.nukta) {
      const key = u.ch + VIRAMA + next.ch;
      const conj = CONJUNCTS[key];
      if (conj) {
        const afterIsLast = i + 1 === units.length - 1;
        const needsHalf = !afterIsLast || trailingVirama;
        if (needsHalf) s += conj[1] != null ? conj[1] : conj[0] + "~";
        else s += conj[0];
        i += 2;
        continue;
      }
      // Subscript र: C + ् + र
      if (next.ch === RA && i + 1 === units.length - 1 && !trailingVirama) {
        s += CONSONANTS[u.ch][0] + (u.nukta ? "+" : "") + (ROUND_CONSONANTS.has(u.ch) ? "ª" : "z");
        i += 2;
        continue;
      }
    }
    const [full, half] = CONSONANTS[u.ch];
    const nukta = u.nukta ? "+" : "";
    if (!isLast) {
      // Half form before another consonant; consonants without one keep an explicit halant.
      s += half != null ? half + nukta : full + nukta + "~";
    } else {
      s += full + nukta + (trailingVirama ? "~" : "");
    }
    i++;
  }
  return s;
}

export function unicodeToKrutidev(text) {
  let out = "";
  for (const part of parseAksharas(text)) {
    if (part.type === "raw") {
      out += PUNCTUATION[part.text] != null ? PUNCTUATION[part.text] : part.text;
    } else if (part.type === "vowel") {
      out += INDEPENDENT_VOWELS[part.ch] + part.mods.map((m) => MODIFIERS[m]).join("");
    } else {
      const hasI = part.matras.includes(I_MATRA);
      const otherMatras = part.matras.filter((m) => m !== I_MATRA);
      let cluster;
      // रु / रू have dedicated glyphs.
      if (part.units.length === 1 && part.units[0].ch === RA && !part.units[0].nukta && (otherMatras[0] === "ु" || otherMatras[0] === "ू")) {
        cluster = otherMatras.shift() === "ु" ? ":" : "#";
      } else {
        cluster = convertCluster(part.units, part.trailingVirama);
      }
      out +=
        (hasI ? "f" : "") +
        cluster +
        otherMatras.map((m) => MATRAS[m]).join("") +
        (part.reph ? "Z" : "") +
        part.mods.map((m) => MODIFIERS[m]).join("");
    }
  }
  return out;
}

/** Characters that only appear in Kruti Dev output when the source had Devanagari we could not map. */
export function findUnconvertedDevanagari(krutidevText) {
  return Array.from(new Set(Array.from(krutidevText).filter((ch) => /[ऀ-ॿ]/.test(ch))));
}
