// TypingEngine — UI-independent typing test engine.
//
// It owns the test state (idle → ready → running ⇄ paused → finished), the clock,
// comparison and metrics, and nothing else: no DOM, no storage. The page feeds it
// the textarea value via setInput() and calls tick() on a timer; the same engine can
// run mock typing exams, school practice or government-style typing tests.
//
// Time is measured from a monotonic clock (performance.now by default) as
// accumulated running time, never by counting setInterval ticks — so a throttled
// background tab or a slow phone cannot make the timer drift.

import { preparePassage, compareTyped } from "./compare.js";
import { calculateMetrics } from "./metrics.js";

const defaultNow = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

export const ENGINE_STATES = Object.freeze({
  IDLE: "idle",
  READY: "ready",
  RUNNING: "running",
  PAUSED: "paused",
  FINISHED: "finished",
});

export class TypingEngine {
  /**
   * @param {object} opts
   * @param {string} opts.text        passage in the adapter's encoding
   * @param {object} opts.adapter     a TypingAdapter (see adapters.js)
   * @param {number} opts.durationMs  test length; Infinity for untimed
   * @param {() => number} [opts.now] clock, injectable for tests
   * @param {number} [opts.largeInsertThreshold] units inserted in one event that count as a suspicious insertion
   */
  constructor({ text, adapter, durationMs, now = defaultNow, largeInsertThreshold = 25 }) {
    this.adapter = adapter;
    this.durationMs = durationMs;
    this.now = now;
    this.largeInsertThreshold = largeInsertThreshold;
    this.prepared = preparePassage(text, adapter);
    this.reset();
  }

  reset() {
    this.state = ENGINE_STATES.READY;
    this.input = "";
    this.accumulatedMs = 0;
    this.runningSince = null;
    this.comparison = compareTyped(this.prepared, "", this.adapter);
    this.mistakesMade = 0;
    this.samples = []; // [{t: seconds, correct, typed}]
    this.largeInsertions = 0;
    this.endReason = null;
  }

  // ---------- lifecycle ----------
  start() {
    if (this.state !== ENGINE_STATES.READY) return;
    this.state = ENGINE_STATES.RUNNING;
    this.runningSince = this.now();
  }

  pause() {
    if (this.state !== ENGINE_STATES.RUNNING) return;
    this.accumulatedMs += this.now() - this.runningSince;
    this.runningSince = null;
    this.state = ENGINE_STATES.PAUSED;
  }

  resume() {
    if (this.state !== ENGINE_STATES.PAUSED) return;
    this.runningSince = this.now();
    this.state = ENGINE_STATES.RUNNING;
  }

  finish(reason = "ended") {
    if (this.state === ENGINE_STATES.FINISHED) return this.getResult();
    if (this.state === ENGINE_STATES.RUNNING) {
      this.accumulatedMs += this.now() - this.runningSince;
      this.runningSince = null;
    }
    this.accumulatedMs = Math.min(this.accumulatedMs, this.durationMs);
    this.state = ENGINE_STATES.FINISHED;
    this.recordSamples(true);
    this.endReason = reason;
    return this.getResult();
  }

  get isRunning() {
    return this.state === ENGINE_STATES.RUNNING;
  }
  get isFinished() {
    return this.state === ENGINE_STATES.FINISHED;
  }

  // ---------- time ----------
  getElapsedMs() {
    const live = this.state === ENGINE_STATES.RUNNING ? this.now() - this.runningSince : 0;
    return Math.min(this.accumulatedMs + live, this.durationMs);
  }

  getRemainingMs() {
    return Math.max(0, this.durationMs - this.getElapsedMs());
  }

  /** Call periodically while running. Returns {finished, reason} when the test ends. */
  tick() {
    if (this.state !== ENGINE_STATES.RUNNING) return { finished: false };
    this.recordSamples(false);
    if (this.getRemainingMs() <= 0) {
      this.finish("time");
      return { finished: true, reason: "time" };
    }
    return { finished: false };
  }

  recordSamples(final) {
    const elapsed = this.getElapsedMs();
    const whole = Math.floor(elapsed / 1000);
    const last = this.samples.length ? this.samples[this.samples.length - 1].t : 0;
    // One sample per elapsed second; the current counts are used for every second
    // that passed since the last sample (e.g. after a long frame).
    for (let t = last + 1; t <= whole; t++) {
      this.samples.push({ t, correct: this.comparison.correct, typed: this.comparison.typed });
    }
    if (final && elapsed / 1000 > (this.samples.length ? this.samples[this.samples.length - 1].t : 0) + 0.2) {
      this.samples.push({ t: Math.round((elapsed / 1000) * 10) / 10, correct: this.comparison.correct, typed: this.comparison.typed });
    }
  }

  // ---------- input ----------
  /**
   * Feed the full current input value.
   * @param {string} value
   * @param {object} [opts]
   * @param {boolean} [opts.composing] true while an IME composition is in progress;
   *        intermediate composition states are not counted as mistakes.
   * @returns {{accepted: boolean, completed: boolean, largeInsertion: boolean}}
   */
  setInput(value, { composing = false } = {}) {
    if (this.state === ENGINE_STATES.FINISHED || this.state === ENGINE_STATES.PAUSED) {
      return { accepted: false, completed: false, largeInsertion: false };
    }
    if (this.state === ENGINE_STATES.READY) {
      if (!value) return { accepted: true, completed: false, largeInsertion: false };
      this.start(); // the timer starts with the first character
    }
    const before = this.comparison;
    const prevLen = Array.from(this.input).length;
    this.input = value;
    this.comparison = compareTyped(this.prepared, value, this.adapter);

    const inserted = Array.from(value).length - prevLen;
    const largeInsertion = !composing && inserted >= this.largeInsertThreshold;
    if (largeInsertion) this.largeInsertions++;
    if (!composing && this.comparison.typed > before.typed) {
      this.mistakesMade += Math.max(0, this.comparison.incorrect - before.incorrect);
    }
    const completed = !composing && this.comparison.complete;
    if (completed) this.finish("completed");
    return { accepted: true, completed, largeInsertion };
  }

  // ---------- results ----------
  getMetrics() {
    const correctedErrors = Math.max(0, this.mistakesMade - this.comparison.incorrect);
    return calculateMetrics(this.comparison, this.getElapsedMs(), { correctedErrors });
  }

  /** Speed over time: WPM over a sliding window, plus the running average. */
  getSpeedSeries(windowSec = 5) {
    const s = this.samples;
    return s.map((p, idx) => {
      let j = idx;
      while (j > 0 && p.t - s[j - 1].t < windowSec) j--;
      const base = j > 0 ? s[j - 1] : { t: 0, correct: 0 };
      const dt = (p.t - base.t) / 60;
      return {
        t: p.t,
        wpm: dt > 0 ? Math.max(0, Math.round((p.correct - base.correct) / 5 / dt)) : 0,
        avg: p.t > 0 ? Math.round(p.correct / 5 / (p.t / 60)) : 0,
      };
    });
  }

  getResult() {
    return {
      metrics: this.getMetrics(),
      endReason: this.endReason,
      speedSeries: this.getSpeedSeries(),
      input: this.input,
      largeInsertions: this.largeInsertions,
    };
  }
}
