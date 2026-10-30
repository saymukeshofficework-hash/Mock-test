// Mangal font trainer (Remington Gail layout). Mangal on the Remington Gail keyboard
// uses the same key positions as Kruti Dev, so the key sequence for each Unicode word
// comes from the existing unicodeToKrutidev converter. The student types English keys;
// the page shows the Unicode word in Mangal and lights up the next key.

import { unicodeToKrutidev } from "./engine/krutidev.js";

const LESSONS = [
  { id: "home", name: "1. बीच की लाइन / Home row",
    words: "कर सर हार कहा सही हरा रस यह सिर राय साया हीरा किसका हाय सार कहीं कसक रहा सरस हिसार" },
  { id: "top", name: "2. ऊपर की लाइन / Top row",
    words: "मन तन जल नल पल वन चल तुम पूजा मेला नमन पवन चमन जीवन लोग तीन मोती चाचा नाम पानी" },
  { id: "bottom", name: "3. नीचे की लाइन / Bottom row",
    words: "गगन बस अब इस दम उस एक गाना बादल नगर अमर उपवन दिन बगीचा इनाम उदास एकता गीत अनाज बाग" },
  { id: "shift", name: "4. Shift अक्षर / Shift keys",
    words: "भारत थाना खाना घर छत टमाटर ठग डर ढोल फल झरना भाषा थैला घड़ी छाता टोपी ठंडा डाक फूल भैया" },
  { id: "conjunct", name: "5. संयुक्त अक्षर / Conjuncts",
    words: "प्रकाश क्या विद्यालय स्कूल शिक्षा धर्म कर्म पत्र ज्ञान श्रम प्रश्न स्वच्छ विद्या मित्र राष्ट्र कक्षा परीक्षा न्याय स्थान प्यार" },
  { id: "sentence", name: "6. वाक्य / Sentences",
    lines: [
      "भारत एक विशाल देश है।",
      "हम सब मिलकर काम करते हैं।",
      "रोज़ अभ्यास करने से गति बढ़ती है।",
      "मध्य प्रदेश भारत के बीच में है।",
      "परीक्षा में शुद्धता सबसे ज़रूरी है।",
      "पेड़ लगाओ और पानी बचाओ।",
    ] },
];

// Keyboard labels: [normal, shifted] Hindi glyph for each key on Remington Gail.
const ROWS = [
  [["`", "ृ"], ["1", "1"], ["2", "2"], ["3", "3", "रू"], ["4", "4"], ["5", "5", "ः"], ["6", "6", "‘"], ["7", "7", "-"], ["8", "8", "’"], ["9", "9"], ["0", "0", "द्ध"], ["-", "."], ["=", "त्र", "़"]],
  [["q", "ु", "फ"], ["w", "ू", "ॅ"], ["e", "म", "म्"], ["r", "त", "त्"], ["t", "ज", "ज्"], ["y", "ल", "ल्"], ["u", "न", "न्"], ["i", "प", "प्"], ["o", "व", "व्"], ["p", "च", "च्"], ["[", "ख्", "क्ष्"], ["]", ",", "द्व"], ["\\", "?", "द्य"]],
  [["a", "ं", "।"], ["s", "े", "ै"], ["d", "क", "क्"], ["f", "ि", "थ्"], ["g", "ह", "ळ"], ["h", "ी", "भ्"], ["j", "र", "श्र"], ["k", "ा", "ज्ञ"], ["l", "स", "स्"], [";", "य"], ["'", "श्", "ष्"]],
  [["z", "्र", "र्"], ["x", "ग", "ग्"], ["c", "ब", "ब्"], ["v", "अ", "ट"], ["b", "इ", "ठ"], ["n", "द", "छ"], ["m", "उ", "ड"], [",", "ए", "ढ"], [".", "ण्", "झ"], ["/", "ध्", "घ्"]],
];
const SHIFTED = { "~": "`", "!": "1", "@": "2", "#": "3", "$": "4", "%": "5", "^": "6", "&": "7", "*": "8", "(": "9", ")": "0", "_": "-", "+": "=",
  "{": "[", "}": "]", "|": "\\", ":": ";", '"': "'", "<": ",", ">": ".", "?": "/" };
const baseKey = (ch) => (/[A-Z]/.test(ch) ? ch.toLowerCase() : SHIFTED[ch] || ch);
const needsShift = (ch) => /[A-Z]/.test(ch) || ch in SHIFTED;

// Only keep words whose key sequence uses plain keyboard keys (no Alt codes).
const typeable = (w) => /^[\x20-\x7e]+$/.test(unicodeToKrutidev(w));

const $ = (id) => document.getElementById(id);
const kbKeys = {};
let lesson = LESSONS[0];
let words = [];   // [{ hi, keys }]
let wi = 0;       // current word
let ki = 0;       // current key in word
let good = 0, bad = 0, started = 0, flash = false;

function buildKeyboard() {
  const kb = $("kb");
  ROWS.forEach((row, r) => {
    const div = document.createElement("div");
    div.className = "mt-row";
    if (r === 3) div.appendChild(Object.assign(document.createElement("div"), { className: "mt-k wide", textContent: "Shift" }));
    row.forEach(([k, lo, up]) => {
      const el = document.createElement("div");
      el.className = "mt-k font-mangal";
      el.innerHTML = `<small></small><span></span>`;
      el.querySelector("small").textContent = up || "";
      el.querySelector("span").textContent = lo;
      div.appendChild(el);
      kbKeys[k] = el;
    });
    if (r === 3) div.appendChild(Object.assign(document.createElement("div"), { className: "mt-k wide", textContent: "Shift" }));
    kb.appendChild(div);
  });
  const sp = document.createElement("div");
  sp.className = "mt-row";
  const space = Object.assign(document.createElement("div"), { className: "mt-k space", textContent: "Space" });
  sp.appendChild(space);
  kb.appendChild(sp);
  kbKeys[" "] = space;
}

function buildLessons() {
  const nav = $("lessons");
  LESSONS.forEach((l) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = l.name;
    b.className = "font-mangal";
    b.addEventListener("click", () => { lesson = l; newLine(); });
    nav.appendChild(b);
    l.btn = b;
  });
}

function pickWords() {
  if (lesson.lines) {
    const line = lesson.lines[Math.floor(Math.random() * lesson.lines.length)];
    return line.split(" ").filter(typeable);
  }
  const pool = lesson.words.split(" ").filter(typeable);
  const out = [];
  while (out.length < 8) out.push(pool[Math.floor(Math.random() * pool.length)]);
  return out;
}

function newLine() {
  const list = pickWords();
  // Each word except the last ends with a space key.
  words = list.map((hi, i) => ({ hi, keys: unicodeToKrutidev(hi) + (i < list.length - 1 ? " " : "") }));
  wi = 0; ki = 0; good = 0; bad = 0; started = 0;
  LESSONS.forEach((l) => l.btn.classList.toggle("on", l === lesson));
  $("done").hidden = true;
  $("box").value = "";
  render();
  $("box").focus();
}

function render() {
  const line = $("line");
  line.textContent = "";
  words.forEach((w, i) => {
    const s = document.createElement("span");
    s.textContent = w.hi;
    if (i < wi) s.className = "done";
    else if (i === wi) s.className = "cur";
    line.appendChild(s);
    line.appendChild(document.createTextNode(" "));
  });

  const keys = $("keys");
  keys.textContent = "";
  const w = words[wi];
  if (w) {
    [...w.keys].forEach((ch, i) => {
      const b = document.createElement("b");
      b.textContent = ch === " " ? "Space" : ch;
      if (i < ki) b.className = "ok";
      else if (i === ki) b.className = flash ? "bad" : "next";
      keys.appendChild(b);
    });
  }

  Object.values(kbKeys).forEach((el) => el.classList.remove("hit", "hit-shift"));
  const next = w && w.keys[ki];
  if (next) {
    const el = kbKeys[baseKey(next)];
    if (el) {
      el.classList.add("hit");
      if (needsShift(next)) el.classList.add("hit-shift");
    }
  }

  const mins = started ? (Date.now() - started) / 60000 : 0;
  $("wpm").textContent = mins > 0.05 ? Math.round(good / 5 / mins) : 0;
  $("acc").textContent = good + bad ? Math.round((good * 100) / (good + bad)) : 100;
  $("err").textContent = bad;
}

function press(ch) {
  const w = words[wi];
  if (!w) return;
  if (!started) started = Date.now();
  if (ch === w.keys[ki]) {
    good++; ki++; flash = false;
    if (ki >= w.keys.length) { wi++; ki = 0; }
    if (wi >= words.length) $("done").hidden = false;
  } else {
    bad++; flash = true;
  }
  render();
}

function init() {
  buildKeyboard();
  buildLessons();
  const box = $("box");
  box.addEventListener("input", () => {
    const typed = box.value;
    box.value = "";
    for (const ch of typed) press(ch);
  });
  box.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !$("done").hidden) { e.preventDefault(); newLine(); }
  });
  $("nextBtn").addEventListener("click", newLine);
  newLine();
}

init();
