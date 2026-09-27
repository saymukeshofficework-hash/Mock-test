// Post-test analysis: word-by-word alignment and character error pairs. This runs
// once when the test ends (never per keystroke), so an O(n·m) alignment is fine.

import { splitTyped } from "./compare.js";

/**
 * Align typed words to passage words with a minimum-edit-distance alignment, so a
 * skipped word shows up as "missed" and an inserted word as "extra" instead of
 * making every following word look wrong.
 * Only the attempted part of the passage is considered (plus a small look-ahead so
 * a skipped word near the end is still detected).
 */
export function analyzeWords(prepared, typedText, adapter) {
  const typed = splitTyped(adapter.toUnits(adapter.normalize(typedText))).words
    .filter((w) => w.length)
    .map((w) => w.join(""));
  const expectedAll = prepared.words.map((w) => w.text);
  const expected = expectedAll.slice(0, Math.min(expectedAll.length, typed.length + 3));
  const n = expected.length;
  const m = typed.length;

  // Substituting a word costs 1 when it is a misspelling of the expected word and 2
  // (the same as missed + extra) when it is a different word, so "the brown" for
  // "the quick brown" aligns as a missed word instead of two wrong ones.
  const subCost = (a, b) => (a === b ? 0 : isMisspelling(a, b, adapter) ? 1 : 2);

  // dp[i][j] = cost to align expected[i:] with typed[j:]
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n; i >= 0; i--) {
    for (let j = m; j >= 0; j--) {
      if (i === n) dp[i][j] = m - j;
      else if (j === m) dp[i][j] = n - i;
      else {
        const sub = dp[i + 1][j + 1] + subCost(expected[i], typed[j]);
        dp[i][j] = Math.min(sub, dp[i + 1][j] + 1, dp[i][j + 1] + 1);
      }
    }
  }

  const rows = [];
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && dp[i][j] === dp[i + 1][j + 1] + subCost(expected[i], typed[j])) {
      rows.push({ type: expected[i] === typed[j] ? "correct" : "incorrect", expected: expected[i], typed: typed[j] });
      i++;
      j++;
    } else if (i < n && dp[i][j] === dp[i + 1][j] + 1) {
      rows.push({ type: "missed", expected: expected[i], typed: "" });
      i++;
    } else {
      rows.push({ type: "extra", expected: "", typed: typed[j] });
      j++;
    }
  }
  // Trailing "missed" words are just the part of the look-ahead the student never reached.
  while (rows.length && rows[rows.length - 1].type === "missed") rows.pop();
  // A word still being typed when the test ended ("fr" for "from") is unfinished, not wrong.
  const endsMidWord = typedText.length > 0 && !/\s$/.test(typedText);
  const last = rows[rows.length - 1];
  if (endsMidWord && last && last.type === "incorrect" && last.expected.startsWith(last.typed)) rows.pop();

  const count = (t) => rows.filter((r) => r.type === t).length;
  return {
    rows,
    correct: count("correct"),
    incorrect: count("incorrect"),
    missed: count("missed"),
    extra: count("extra"),
    attempted: rows.length,
  };
}

/** True when `typed` is within ~half the length of `expected` in character edits. */
function isMisspelling(expected, typed, adapter) {
  const a = adapter.toUnits(expected);
  const b = adapter.toUnits(typed);
  let prev = Array.from({ length: b.length + 1 }, (_, k) => k);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let k = 1; k <= b.length; k++) {
      cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + (a[i - 1] === b[k - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length] <= Math.max(1, Math.floor(Math.max(a.length, b.length) / 2));
}

/**
 * Character-level diff of one wrong word, for highlighting in the error list.
 * Returns [{expected, typed, ok}] segments over the adapter's visual clusters.
 */
export function diffWord(expectedWord, typedWord, adapter) {
  const e = adapter.toUnits(expectedWord);
  const t = adapter.toUnits(typedWord);
  const clusters = adapter.segment(e);
  return clusters.map(({ start, end }) => {
    const exp = e.slice(start, end).join("");
    const typ = t.slice(start, end).join("");
    return { expected: exp, typed: typ, ok: exp === typ };
  }).concat(t.length > e.length ? [{ expected: "", typed: t.slice(e.length).join(""), ok: false }] : []);
}

/** Most frequent "expected X, typed Y" character substitutions within aligned words. */
export function characterErrors(wordRows, adapter, limit = 8) {
  const counts = new Map();
  for (const r of wordRows) {
    if (r.type !== "incorrect") continue;
    const e = adapter.toUnits(r.expected);
    const t = adapter.toUnits(r.typed);
    const len = Math.max(e.length, t.length);
    for (let k = 0; k < len; k++) {
      if (e[k] === t[k]) continue;
      const key = `${e[k] || ""}\u0000${t[k] || ""}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => {
      const [expected, typed] = key.split("\u0000");
      return { expected, typed, count };
    });
}
