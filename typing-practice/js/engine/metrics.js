// Speed and accuracy formulas. Every formula uses the international "standard word"
// of 5 characters (keystrokes), for English and Hindi alike, so scores stay
// comparable across formats. A "character" is one code point after normalization.
//
//   minutes      = elapsed time in minutes (the time actually typed, pauses excluded)
//   typed        = correct + incorrect characters (spaces included)
//   errors       = incorrect characters + characters skipped in finished words
//   WPM          = (correct characters / 5) / minutes
//   Gross WPM    = (typed characters / 5) / minutes
//   Net WPM      = Gross WPM − (errors / minutes), never below 0
//                  (each uncorrected error costs one word per minute — the usual
//                   net-speed rule in typing exams)
//   CPM          = correct characters / minutes
//   Accuracy     = correct characters / typed characters × 100
//   Progress     = position reached in the passage / passage length × 100
//
// Errors fixed with Backspace are not in "errors"; they are reported separately as
// `correctedErrors` so a student can see how many mistakes they caught.

export const CHARS_PER_WORD = 5;
/** Below this, speed numbers are meaningless (1 character in 0.2 s = 60 WPM). */
export const MIN_MEASURABLE_MS = 2000;

const round1 = (n) => Math.round(n * 10) / 10;

export function calculateMetrics({ correct = 0, incorrect = 0, missed = 0, progress = 0 }, elapsedMs, extra = {}) {
  const typed = correct + incorrect;
  const errors = incorrect + missed;
  const minutes = elapsedMs > 0 ? elapsedMs / 60000 : 0;
  const perMin = (n) => (minutes > 0 ? n / minutes : 0);
  const grossWpm = perMin(typed / CHARS_PER_WORD);
  const netWpm = Math.max(0, grossWpm - perMin(errors));
  return {
    wpm: Math.round(perMin(correct / CHARS_PER_WORD)),
    grossWpm: Math.round(grossWpm),
    netWpm: Math.round(netWpm),
    cpm: Math.round(perMin(correct)),
    accuracy: typed > 0 ? round1((correct / typed) * 100) : 0,
    correctChars: correct,
    incorrectChars: incorrect,
    missedChars: missed,
    errors,
    typedChars: typed,
    progress: round1(progress),
    elapsedMs: Math.max(0, Math.round(elapsedMs)),
    correctedErrors: extra.correctedErrors || 0,
  };
}

/** Performance bands, applied to Net WPM. Hindi bands are lower: Hindi exams expect ~25–35 WPM. */
export const PERFORMANCE_LEVELS = {
  en: [
    { min: 90, key: "excellent" },
    { min: 70, key: "veryGood" },
    { min: 50, key: "good" },
    { min: 35, key: "average" },
    { min: 0, key: "needsPractice" },
  ],
  hi: [
    { min: 60, key: "excellent" },
    { min: 45, key: "veryGood" },
    { min: 35, key: "good" },
    { min: 25, key: "average" },
    { min: 0, key: "needsPractice" },
  ],
};

export function performanceLevel(wpm, lang = "en") {
  const bands = PERFORMANCE_LEVELS[lang] || PERFORMANCE_LEVELS.en;
  return bands.find((b) => wpm >= b.min).key;
}

/** mm:ss. Countdowns round up (00:01 until time is really up); elapsed times round down. */
export function formatClock(ms, { roundUp = true } = {}) {
  const secs = Math.max(0, ms) / 1000;
  const total = roundUp ? Math.ceil(secs) : Math.floor(secs);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
