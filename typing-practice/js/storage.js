// Local persistence for Typing Practice: preferences, test history, recent passages
// and daily-challenge completion — all in this browser's localStorage.
//
// Results go through a small ResultStore interface { save, list, clear } so a
// Supabase-backed store can be added later without touching the UI. The planned
// `typing_results` table and the mapping are in toSupabaseRow() below and in
// docs/TYPING_PRACTICE.md. No login is required: the rest of the practice area
// works for anonymous visitors, so this does too.

const PREFIX = "tth.typing.";
const KEYS = {
  prefs: PREFIX + "prefs",
  history: PREFIX + "history",
  recent: PREFIX + "recent",
  daily: PREFIX + "daily",
};
const MAX_HISTORY = 200;
const MAX_RECENT = 5;

// ---------- safe storage (private mode, blocked cookies, quota) ----------
function createSafeStorage() {
  const memory = new Map();
  let available = false;
  try {
    const k = PREFIX + "__probe";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    available = true;
  } catch {
    available = false;
  }
  return {
    available,
    get(key, fallback) {
      try {
        const raw = available ? localStorage.getItem(key) : memory.get(key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      const raw = JSON.stringify(value);
      try {
        if (available) localStorage.setItem(key, raw);
        else memory.set(key, raw);
        return true;
      } catch {
        memory.set(key, raw);
        return false;
      }
    },
    remove(key) {
      try {
        if (available) localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      memory.delete(key);
    },
  };
}

export const storage = createSafeStorage();

// ---------- preferences ----------
export const DEFAULT_PREFS = { format: "english", durationSec: 60, customDuration: false, difficulty: "medium", length: "random" };

export function loadPrefs() {
  return { ...DEFAULT_PREFS, ...storage.get(KEYS.prefs, {}) };
}

export function savePrefs(prefs) {
  storage.set(KEYS.prefs, { ...loadPrefs(), ...prefs });
}

// ---------- recent passages (avoid immediate repeats) ----------
export function getRecentIds(formatId) {
  return storage.get(KEYS.recent, {})[formatId] || [];
}

export function pushRecentId(formatId, id) {
  const all = storage.get(KEYS.recent, {});
  const list = [id, ...(all[formatId] || []).filter((x) => x !== id)].slice(0, MAX_RECENT);
  all[formatId] = list;
  storage.set(KEYS.recent, all);
}

// ---------- daily challenge ----------
export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getDailyCompletion(dateKey, formatId) {
  return storage.get(KEYS.daily, {})[`${dateKey}|${formatId}`] || null;
}

export function markDailyComplete(dateKey, formatId, summary) {
  const all = storage.get(KEYS.daily, {});
  all[`${dateKey}|${formatId}`] = summary;
  // Keep only the last ~60 entries.
  const keys = Object.keys(all).sort().slice(0, -60);
  keys.forEach((k) => delete all[k]);
  storage.set(KEYS.daily, all);
}

// ---------- results ----------
/**
 * TypingResult (stored shape):
 * { id, testId, passageId, format, language, mode, difficulty, duration (s, configured),
 *   timeTaken (s), wpm, grossWpm, netWpm, cpm, accuracy, correctChars, incorrectChars,
 *   errors, correctedErrors, progress, endReason, completedAt (ISO) }
 */
export function createLocalResultStore() {
  return {
    kind: "local",
    async save(result) {
      const list = storage.get(KEYS.history, []);
      list.unshift(result);
      storage.set(KEYS.history, list.slice(0, MAX_HISTORY));
      return result;
    },
    async list({ limit = MAX_HISTORY } = {}) {
      return storage.get(KEYS.history, []).slice(0, limit);
    },
    async clear() {
      storage.remove(KEYS.history);
    },
  };
}

export const resultStore = createLocalResultStore();

/** Map a stored result to the planned Supabase `typing_results` row (see docs/TYPING_PRACTICE.md). */
export function toSupabaseRow(result, userId = null) {
  return {
    id: result.id,
    user_id: userId,
    language: result.language,
    typing_format: result.format,
    mode: result.mode,
    duration: result.duration,
    time_taken: result.timeTaken,
    gross_wpm: result.grossWpm,
    net_wpm: result.netWpm,
    wpm: result.wpm,
    cpm: result.cpm,
    accuracy: result.accuracy,
    correct_chars: result.correctChars,
    incorrect_chars: result.incorrectChars,
    errors: result.errors,
    passage_id: result.passageId,
    difficulty: result.difficulty,
    created_at: result.completedAt,
  };
}

/** Best / average / totals, overall and per format. */
export function summarizeProgress(results) {
  const summarize = (list) => {
    if (!list.length) return { tests: 0, bestWpm: 0, avgWpm: 0, bestAccuracy: 0, avgAccuracy: 0, totalSec: 0 };
    const sum = (f) => list.reduce((n, r) => n + (Number(r[f]) || 0), 0);
    return {
      tests: list.length,
      bestWpm: Math.max(...list.map((r) => r.wpm || 0)),
      avgWpm: Math.round(sum("wpm") / list.length),
      bestAccuracy: Math.max(...list.map((r) => r.accuracy || 0)),
      avgAccuracy: Math.round((sum("accuracy") / list.length) * 10) / 10,
      totalSec: Math.round(sum("timeTaken")),
    };
  };
  const byFormat = {};
  for (const r of results) (byFormat[r.format] ||= []).push(r);
  return {
    overall: summarize(results),
    byFormat: Object.fromEntries(Object.entries(byFormat).map(([k, v]) => [k, summarize(v)])),
  };
}

export function newResultId() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return "r-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}
