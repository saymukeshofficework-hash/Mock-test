// Passage data + Kruti Dev conversion checks.
import { test } from "node:test";
import assert from "node:assert/strict";

import { unicodeToKrutidev, findUnconvertedDevanagari } from "../js/engine/krutidev.js";
import { ENGLISH_PASSAGES } from "../js/data/passages/english.js";
import { HINDI_PASSAGES } from "../js/data/passages/hindi-unicode.js";
import { KRUTIDEV_PASSAGES } from "../js/data/passages/krutidev.js";
import { selectPassage, dailyPassage, chainForDuration, charsNeeded, getPassages } from "../js/data/passages/index.js";

test("Kruti Dev: standard spellings of common words", () => {
  const cases = {
    "शिक्षा": "f'k{kk", "हमें": "gesa", "भारत": "Hkkjr", "किताब": "fdrkc", "प्रदेश": "izns'k",
    "कर्म": "deZ", "विद्यालय": "fo|ky;", "स्कूल": "Ldwy", "हिंदी": "fganh", "क्षेत्र": "{ks=",
    "राष्ट्र": 'jk"Vª', "पर्यावरण": "i;kZoj.k", "मैं": "eSa", "रुपये": ":i;s", "स्थिति": "fLFkfr",
    "ज्ञान": "Kku", "श्रम": "Je", "पृथ्वी": "i`Foh", "संख्या": "la[;k", "महत्वपूर्ण": "egRoiw.kZ",
    "दृष्टि": 'n`f"V', "उन्होंने": "mUgksaus", "द्वारा": "}kjk", "विद्यार्थी": "fo|kFkhZ",
    "कीर्ति": "dhfrZ", "पढ़ाई": "i<+kbZ", "लक्ष्मी": "y{eh", "विश्व": "fo'o", "प्रिय": "fiz;",
    "जगत्": "txr~", "शुद्ध": "'kq)", "ज़रूरी": "t+#jh", "बच्चे": "cPps", "है।": "gSA",
  };
  for (const [u, k] of Object.entries(cases)) assert.equal(unicodeToKrutidev(u), k, u);
});

test("Kruti Dev: every Hindi passage converts completely", () => {
  assert.equal(KRUTIDEV_PASSAGES.length, HINDI_PASSAGES.length);
  for (const p of KRUTIDEV_PASSAGES) {
    assert.deepEqual(findUnconvertedDevanagari(p.text), [], p.id);
    assert.equal(p.encoding, "krutidev-legacy");
    assert.ok(p.unicodeText.length > 0);
  }
});

test("passages: ids are unique and fields valid", () => {
  const all = [...ENGLISH_PASSAGES, ...HINDI_PASSAGES, ...KRUTIDEV_PASSAGES];
  const ids = new Set();
  for (const p of all) {
    assert.ok(!ids.has(p.id), `duplicate id ${p.id}`);
    ids.add(p.id);
    assert.ok(["easy", "medium", "hard", "exam"].includes(p.difficulty), p.id);
    assert.ok(p.text.trim().length > 50, p.id);
    assert.equal(p.text, p.text.normalize("NFC"), p.id);
  }
  // Hindi passages keep to the punctuation Kruti Dev handles well.
  for (const p of HINDI_PASSAGES) assert.doesNotMatch(p.text, /[0-9०-९?!"'()\-:;]/, p.id);
});

test("selection: filters by difficulty and avoids recent passages", () => {
  const easy = getPassages("english").filter((p) => p.difficulty === "easy").map((p) => p.id);
  const recent = easy.slice(0, easy.length - 1);
  for (let i = 0; i < 10; i++) {
    const p = selectPassage({ formatId: "english", difficulty: "easy", durationSec: 15, recentIds: recent });
    assert.equal(p.id, easy[easy.length - 1]);
  }
});

test("selection: long durations chain passages; unknown format returns null", () => {
  const first = getPassages("hindi-unicode")[0];
  const chained = chainForDuration("hindi-unicode", first, 600);
  assert.ok(Array.from(chained.text).length >= Math.min(charsNeeded(600), 3000) || chained.ids.length === getPassages("hindi-unicode").length);
  assert.ok(chained.ids.length > 1);
  assert.equal(selectPassage({ formatId: "nope" }), null);
});

test("daily passage is deterministic per date and format", () => {
  const a = dailyPassage("english", "2026-09-27");
  assert.equal(dailyPassage("english", "2026-09-27").id, a.id);
  assert.ok(["easy", "medium"].includes(a.difficulty));
});
