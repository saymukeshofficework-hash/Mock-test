// Typing Practice page controller: screens, settings, test lifecycle and events.
// The typing logic itself lives in ./engine (UI-independent, unit-tested).

import { TypingEngine } from "./engine/typing-engine.js";
import { getAdapter } from "./engine/adapters.js";
import { analyzeWords, characterErrors } from "./engine/analysis.js";
import { formatClock, MIN_MEASURABLE_MS } from "./engine/metrics.js";
import { FORMATS, getFormat, DURATIONS } from "./data/formats.js";
import { selectPassage, getPassages, dailyPassage, estimatedMinutes, lengthOf, DIFFICULTIES } from "./data/passages/index.js";
import {
  storage, loadPrefs, savePrefs, getRecentIds, pushRecentId, resultStore,
  todayKey, getDailyCompletion, markDailyComplete, newResultId,
} from "./storage.js";
import { tr, setLangGetter, currentLang } from "./strings.js";
import { PassageView } from "./ui/passage-view.js";
import { renderResult, resultAsText, shareText, durationLabel } from "./ui/result-view.js";
import { renderProgress, renderHistory } from "./ui/dashboard.js";

const $ = (id) => document.getElementById(id);
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isSmallScreen = () => window.matchMedia("(max-width: 720px)").matches;

// ------------------------------------------------------------------ language
// Follow the site-wide toggle from /js/i18n.js (Hindi by default). If that script
// failed to load, fall back to Hindi and a local toggle.
let fallbackLang = "hi";
const siteI18n = typeof window.getLang === "function" && typeof window.setLang === "function";
setLangGetter(() => (siteI18n ? window.getLang() : fallbackLang));

function toggleLanguage() {
  const next = currentLang() === "hi" ? "en" : "hi";
  if (siteI18n) window.setLang(next); // applies nav strings + calls I18N_ONCHANGE
  else {
    fallbackLang = next;
    onLanguageChange();
  }
}

function applyStrings() {
  const lang = currentLang();
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-tp]").forEach((el) => {
    el.textContent = tr(el.dataset.tp);
  });
  document.querySelectorAll("[data-tp-ph]").forEach((el) => {
    el.setAttribute("placeholder", tr(el.dataset.tpPh));
  });
  const label = lang === "hi" ? "EN" : "हिं";
  document.querySelectorAll("[data-lang-toggle]").forEach((b) => (b.textContent = label));
  const main = $("langToggle");
  if (main) main.textContent = label;
  $("passage").setAttribute("aria-label", tr("passage"));
}

function onLanguageChange() {
  applyStrings();
  renderSetup();
  renderDaily();
  refreshDashboard();
  if (view === "exam") renderExamSelects(true);
  if (session) updateTestHeader();
  if (lastResultCtx && view === "result") showResultView(lastResultCtx);
}

// ------------------------------------------------------------------ state
let prefs = loadPrefs();
let view = "home";
let session = null; // active test
let lastResultCtx = null;
let kdFontAvailable = null; // null = unknown yet

// ------------------------------------------------------------------ toast + dialog
let toastTimer = null;
function toast(msg, ms = 2600) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), ms);
}

function confirmDialog(title, message, okLabel) {
  const dlg = $("confirmDialog");
  if (typeof dlg.showModal !== "function") return Promise.resolve(window.confirm(`${title}\n${message}`));
  $("confirmTitle").textContent = title;
  $("confirmMsg").textContent = message;
  $("confirmOk").textContent = okLabel;
  $("confirmCancel").textContent = tr("cancel");
  return new Promise((resolve) => {
    dlg.addEventListener("close", () => resolve(dlg.returnValue === "ok"), { once: true });
    dlg.returnValue = "cancel";
    dlg.showModal();
    $("confirmCancel").focus();
  });
}

// ------------------------------------------------------------------ fonts
async function checkKrutidevFont() {
  if (kdFontAvailable !== null) return kdFontAvailable;
  try {
    if (!document.fonts || !document.fonts.load) return (kdFontAvailable = false);
    const faces = await document.fonts.load('20px "TTH Kruti Dev 010"', "dfr");
    kdFontAvailable = faces.length > 0;
  } catch {
    kdFontAvailable = false;
  }
  return kdFontAvailable;
}

// ------------------------------------------------------------------ views
function showView(name) {
  view = name;
  $("homeView").hidden = name !== "home";
  $("examView").hidden = name !== "exam";
  $("testView").hidden = name !== "test";
  $("resultView").hidden = name !== "result";
  document.body.classList.toggle("tp-in-test", name !== "home");
  window.scrollTo(0, 0);
}

// Browser/phone "back" during a test should not silently throw the attempt away.
function pushHistory(name) {
  try {
    history.pushState({ tp: name }, "");
  } catch {
    /* ignore */
  }
}
window.addEventListener("popstate", async () => {
  if (view === "test" && session && !session.engine.isFinished && session.engine.state !== "ready") {
    pauseTest();
    pushHistory("test");
    const ok = await confirmDialog(tr("end_t"), tr("end_m"), tr("end_test"));
    if (ok) finishTest("ended");
    return;
  }
  if (view !== "home") goHome();
});

function goHome(scrollTo) {
  teardownSession();
  showView("home");
  refreshDashboard();
  renderDaily();
  if (scrollTo) $(scrollTo)?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" });
}

// ------------------------------------------------------------------ home: setup
function durationChipLabel(sec) {
  return sec < 60 ? `${sec} ${tr("sec")}` : `${sec / 60} ${tr("min")}`;
}

function renderSetup() {
  const lang = currentLang();
  // Format cards (radiogroup with roving tabindex).
  const grid = $("formatGrid");
  grid.innerHTML = FORMATS.map((f) => {
    const on = f.id === prefs.format;
    return `<button type="button" class="tp-format" role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}" data-format="${f.id}">
      <span class="tp-format-name">${f.label[lang]}</span>
      <span class="tp-format-native"${f.lang === "hi" ? ' lang="hi"' : ""}>${f.native}</span>
      <span class="tp-format-desc">${f.desc[lang]}</span>
    </button>`;
  }).join("");

  // Duration chips.
  const isCustom = !!prefs.customDuration || !DURATIONS.includes(prefs.durationSec);
  $("durationChips").innerHTML =
    DURATIONS.map((d) => chip(durationChipLabel(d), !isCustom && d === prefs.durationSec, `data-duration="${d}"`)).join("") +
    chip(tr("custom"), isCustom, 'data-duration="custom"');
  $("customDurationWrap").hidden = !isCustom;
  if (isCustom) $("customMinutes").value = Math.round(prefs.durationSec / 60);

  $("difficultyChips").innerHTML = DIFFICULTIES.map((d) => chip(tr("d_" + d), d === prefs.difficulty, `data-difficulty="${d}"`)).join("");
  $("lengthChips").innerHTML = ["random", "short", "medium", "long"].map((l) => chip(tr("l_" + l), l === prefs.length, `data-length="${l}"`)).join("");

  const tipKey = { "hindi-unicode": "hi_tip", mangal: "mangal_tip", krutidev: "kd_tip" }[prefs.format];
  $("formatTip").textContent = tipKey ? tr(tipKey) : "";
  updateKdNotice();
}

function chip(label, on, attrs) {
  return `<button type="button" class="tp-chip" aria-pressed="${on}" ${attrs}>${label}</button>`;
}

async function updateKdNotice() {
  const notice = $("kdFontNotice");
  if (prefs.format !== "krutidev") {
    notice.hidden = true;
    return;
  }
  const ok = await checkKrutidevFont();
  notice.hidden = ok || prefs.format !== "krutidev";
}

function setPref(patch) {
  prefs = { ...prefs, ...patch };
  savePrefs(prefs);
  renderSetup();
  renderDaily();
}

function bindSetup() {
  $("formatGrid").addEventListener("click", (e) => {
    const b = e.target.closest("[data-format]");
    if (!b) return;
    setPref({ format: b.dataset.format });
    $("formatGrid").querySelector(`[data-format="${b.dataset.format}"]`)?.focus();
  });
  $("formatGrid").addEventListener("keydown", (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const i = FORMATS.findIndex((f) => f.id === prefs.format);
    const next = FORMATS[(i + keys[e.key] + FORMATS.length) % FORMATS.length];
    setPref({ format: next.id });
    $("formatGrid").querySelector(`[data-format="${next.id}"]`)?.focus();
  });
  $("durationChips").addEventListener("click", (e) => {
    const b = e.target.closest("[data-duration]");
    if (!b) return;
    if (b.dataset.duration === "custom") {
      setPref({ durationSec: clampMinutes($("customMinutes").value) * 60, customDuration: true });
      $("customMinutes").focus();
    } else {
      setPref({ durationSec: Number(b.dataset.duration), customDuration: false });
    }
  });
  $("customMinutes").addEventListener("change", () => {
    const mins = clampMinutes($("customMinutes").value);
    $("customMinutes").value = mins;
    prefs = { ...prefs, durationSec: mins * 60, customDuration: true };
    savePrefs(prefs);
  });
  $("difficultyChips").addEventListener("click", (e) => {
    const b = e.target.closest("[data-difficulty]");
    if (b) setPref({ difficulty: b.dataset.difficulty });
  });
  $("lengthChips").addEventListener("click", (e) => {
    const b = e.target.closest("[data-length]");
    if (b) setPref({ length: b.dataset.length });
  });
  $("startBtn").addEventListener("click", () => {
    startTest({ formatId: prefs.format, durationSec: prefs.durationSec, difficulty: prefs.difficulty, length: prefs.length, mode: "practice" });
  });
  document.querySelectorAll("[data-mode]").forEach((b) =>
    b.addEventListener("click", () => {
      const mode = b.dataset.mode;
      if (mode === "exam") return openExamIntro();
      const durationSec = { quick: 30, standard: 60, long: 300 }[mode];
      startTest({ formatId: prefs.format, durationSec, difficulty: prefs.difficulty, length: "random", mode });
    }),
  );
  $("clearHistoryBtn").addEventListener("click", async () => {
    if (await confirmDialog(tr("clear_confirm_t"), tr("clear_confirm_m"), tr("clear"))) {
      await resultStore.clear();
      refreshDashboard();
    }
  });
}

function clampMinutes(v) {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(60, Math.max(1, n)) : 3;
}

// ------------------------------------------------------------------ home: daily
function renderDaily() {
  const key = todayKey();
  const f = getFormat(prefs.format);
  const p = dailyPassage(f.id, key);
  const lang = currentLang();
  $("dailyDate").textContent = new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "long" }).format(new Date());
  const body = $("dailyBody");
  if (!p) {
    body.innerHTML = `<p class="tp-hint">${tr("no_passage")}</p>`;
    return;
  }
  const done = getDailyCompletion(key, f.id);
  const preview = f.id === "krutidev" ? p.unicodeText : p.text;
  body.innerHTML = `
    <p class="tp-daily-preview"${f.lang === "hi" ? ' lang="hi"' : ""}>${escapeHTML(preview)}</p>
    <div class="tp-meta-row">
      <span class="tp-meta">${tr("daily_lang")}: ${f.label[lang]}</span>
      <span class="tp-meta">${tr("difficulty")}: ${tr("d_" + p.difficulty)}</span>
      <span class="tp-meta">${tr("daily_est")}: ${estimatedMinutes(p)} ${tr("min")}</span>
      ${done ? `<span class="tp-meta done">✓ ${tr("daily_done")} · ${done.wpm} WPM · ${done.accuracy}%</span>` : ""}
    </div>
    <button type="button" class="btn ${done ? "btn-secondary" : "btn-primary"}" id="dailyBtn">${done ? tr("daily_again") : tr("daily_cta")}</button>
    <p class="tp-daily-note">${tr("daily_note")}</p>`;
  $("dailyBtn").addEventListener("click", () => {
    startTest({ formatId: f.id, durationSec: estimatedMinutes(p) * 60, difficulty: p.difficulty, mode: "daily", fixedPassage: p, dailyKey: key });
  });
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

// ------------------------------------------------------------------ home: progress/history
async function refreshDashboard() {
  const results = await resultStore.list();
  renderProgress($("progressBody"), results);
  renderHistory($("historyBody"), results);
  $("clearHistoryBtn").hidden = !results.length;
}

// ------------------------------------------------------------------ exam intro
const EXAM_DURATIONS = [60, 120, 300, 600, 900];

function openExamIntro() {
  renderExamSelects(false);
  $("examAgree").checked = false;
  $("examStartBtn").disabled = true;
  showView("exam");
  pushHistory("exam");
}

function renderExamSelects(keepValues) {
  const lang = currentLang();
  const cur = keepValues
    ? { format: $("examFormat").value, duration: $("examDuration").value, passage: $("examPassage").value }
    : { format: prefs.format, duration: String(EXAM_DURATIONS.includes(prefs.durationSec) ? prefs.durationSec : 600), passage: "" };
  $("examFormat").innerHTML = FORMATS.map((f) => `<option value="${f.id}">${f.label[lang]} — ${f.native}</option>`).join("");
  $("examFormat").value = cur.format;
  $("examDuration").innerHTML =
    EXAM_DURATIONS.map((d) => `<option value="${d}">${durationLabel(d)}</option>`).join("") + `<option value="custom">${tr("custom")}</option>`;
  $("examDuration").value = cur.duration;
  $("examCustomWrap").hidden = $("examDuration").value !== "custom";
  renderExamPassages(cur.passage);
  $("examSub").textContent = `${getFormat($("examFormat").value).label[lang]} · ${tr("mode_exam")}`;
}

function renderExamPassages(selected) {
  const formatId = $("examFormat").value;
  const passages = getPassages(formatId);
  const groups = DIFFICULTIES.map((d) => {
    const items = passages.filter((p) => p.difficulty === d);
    if (!items.length) return "";
    return `<optgroup label="${tr("d_" + d)}">${items.map((p) => `<option value="${p.id}">${escapeHTML(p.title)} · ${tr("l_" + lengthOf(p))}</option>`).join("")}</optgroup>`;
  }).join("");
  $("examPassage").innerHTML = groups;
  const firstExam = passages.find((p) => p.difficulty === "exam") || passages[0];
  $("examPassage").value = passages.some((p) => p.id === selected) ? selected : firstExam ? firstExam.id : "";
}

function bindExamIntro() {
  $("examFormat").addEventListener("change", () => {
    renderExamPassages("");
    $("examSub").textContent = `${getFormat($("examFormat").value).label[currentLang()]} · ${tr("mode_exam")}`;
  });
  $("examDuration").addEventListener("change", () => {
    $("examCustomWrap").hidden = $("examDuration").value !== "custom";
  });
  $("examAgree").addEventListener("change", () => {
    $("examStartBtn").disabled = !$("examAgree").checked;
  });
  $("examBackBtn").addEventListener("click", () => goHome("setup"));
  $("examForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!$("examAgree").checked) return;
    const formatId = $("examFormat").value;
    const passage = getPassages(formatId).find((p) => p.id === $("examPassage").value);
    const durationSec = $("examDuration").value === "custom" ? clampMinutes($("examCustom").value) * 60 : Number($("examDuration").value);
    startTest({
      formatId, durationSec, difficulty: passage ? passage.difficulty : "exam", mode: "exam", isExam: true,
      fixedPassage: passage || null, name: $("examName").value.trim().slice(0, 60),
    });
  });
}

// ------------------------------------------------------------------ test lifecycle
function startTest(config) {
  const formatId = config.formatId;
  let passage = config.fixedPassage
    ? { ...config.fixedPassage, ids: [config.fixedPassage.id] }
    : selectPassage({ formatId, difficulty: config.difficulty, length: config.length || "random", durationSec: config.durationSec, recentIds: getRecentIds(formatId) });
  if (!passage || !passage.text) {
    toast(tr("no_passage"));
    return;
  }
  teardownSession();
  let adapter;
  try {
    adapter = getAdapter(formatId);
  } catch {
    toast(tr("generic_error"));
    return;
  }

  session = {
    config: { ...config, fixedPassage: passage },
    formatId,
    adapter,
    passage,
    engine: new TypingEngine({ text: passage.text, adapter, durationMs: config.durationSec * 1000 }),
    integrity: { pastes: 0, largeInsertions: 0, tabSwitches: 0 },
    composing: false,
    rafId: 0,
    tickId: 0,
    finishing: false,
    autoPaused: false,
  };

  const input = $("typingInput");
  const passageEl = $("passage");
  const f = getFormat(formatId);
  // Font + language on both passage and input: Krutidev only in Krutidev mode.
  passageEl.className = `tf-passage ${adapter.fontClass}`;
  input.className = `tf-input ${adapter.fontClass}`;
  const inputLang = formatId === "krutidev" ? "en" : f.lang;
  passageEl.setAttribute("lang", formatId === "krutidev" ? "hi-Latn-x-krutidev" : f.lang);
  input.setAttribute("lang", inputLang);
  input.value = "";
  input.readOnly = false;

  session.view = new PassageView(passageEl, session.engine.prepared);
  passageEl.scrollTop = 0;

  // Krutidev without the font: show key codes + the Unicode text for reference.
  $("unicodeRef").hidden = true;
  $("testFontNotice").hidden = true;
  passageEl.classList.remove("kd-missing");
  input.classList.remove("kd-missing");
  if (formatId === "krutidev") {
    $("unicodeRefText").textContent = passage.unicodeText || "";
    checkKrutidevFont().then((ok) => {
      if (!session || session.formatId !== "krutidev") return;
      passageEl.classList.toggle("kd-missing", !ok);
      input.classList.toggle("kd-missing", !ok);
      $("unicodeRef").hidden = ok;
      $("testFontNotice").hidden = ok;
      $("testFontNotice").textContent = ok ? "" : tr("kd_font_missing");
    });
  }

  $("testWarn").hidden = true;
  $("pausedOverlay").hidden = true;
  $("doneOverlay").hidden = true;
  $("timerbar").classList.remove("warn", "paused");
  updateTestHeader();
  renderMetrics();
  updateControls();

  showView("test");
  pushHistory("test");
  // On phones the keyboard takes half the screen: hide the title bar for the whole
  // test (not on focus/blur — toggling it mid-tap would shift the control buttons).
  document.body.classList.toggle("tp-typing-mobile", isSmallScreen() && window.matchMedia("(pointer: coarse)").matches);
  pushRecentId(formatId, passage.id);

  // Called from a click, so focusing here is allowed to open the phone keyboard.
  input.focus({ preventScroll: true });
  session.tickId = window.setInterval(onTick, 200);
}

function updateTestHeader() {
  if (!session) return;
  const c = session.config;
  const f = getFormat(session.formatId);
  $("testTitle").textContent = c.isExam ? tr("exam_title") : tr("test_title");
  $("testSub").textContent = `${f.label[currentLang()]} · ${durationLabel(c.durationSec)} · ${tr("d_" + session.passage.difficulty)} · ${tr("mode_" + c.mode)}`;
  updateControls();
}

function teardownSession() {
  if (!session) return;
  window.clearInterval(session.tickId);
  window.cancelAnimationFrame(session.rafId);
  session = null;
  document.body.classList.remove("tp-typing-mobile");
}

function onTick() {
  if (!session) return;
  const r = session.engine.tick();
  renderClock();
  if (r.finished) finishTest("time");
}

// ------------------------------------------------------------------ rendering (rAF-batched)
function scheduleRender() {
  if (!session || session.rafId) return;
  session.rafId = window.requestAnimationFrame(() => {
    if (!session) return;
    session.rafId = 0;
    session.view.update(session.engine.comparison);
    renderMetrics();
  });
}

function renderClock() {
  if (!session) return;
  const e = session.engine;
  const remaining = e.getRemainingMs();
  $("timer").textContent = formatClock(remaining);
  $("mTime").textContent = formatClock(e.getElapsedMs(), { roundUp: false });
  const warnAt = Math.min(10000, e.durationMs * 0.2);
  $("timerbar").classList.toggle("warn", e.state === "running" && remaining <= warnAt);
}

function renderMetrics() {
  if (!session) return;
  const m = session.engine.getMetrics();
  const measurable = m.elapsedMs >= MIN_MEASURABLE_MS;
  $("mWpm").textContent = measurable ? m.wpm : 0;
  $("mCpm").textContent = measurable ? m.cpm : 0;
  $("mAcc").textContent = m.typedChars ? `${Math.round(m.accuracy)}%` : "—";
  $("mErr").textContent = m.errors;
  // Condensed stats shown in the timer bar when there's no room for the stats row.
  $("miniStats").textContent = `${measurable ? m.wpm : 0} WPM · ${m.typedChars ? Math.round(m.accuracy) + "%" : "—"}`;
  const p = Math.round(m.progress);
  $("mProg").textContent = `${p}%`;
  $("progressPct").textContent = `${p}%`;
  $("progressFill").style.transform = `scaleX(${Math.min(1, m.progress / 100)})`;
  $("progressBar").setAttribute("aria-valuenow", String(p));
  renderClock();
}

function updateControls() {
  if (!session) return;
  const st = session.engine.state;
  $("pauseBtn").disabled = !(st === "running" || st === "paused");
  const paused = st === "paused";
  $("pauseBtn").querySelector(".tf-ctl-txt").textContent = paused ? tr("resume") : tr("pause");
  $("pauseBtn").querySelector(".tf-ctl-ico").textContent = paused ? "▶" : "❚❚";
  $("pauseBtn").setAttribute("aria-label", paused ? tr("resume") : tr("pause"));
  $("restartBtn").setAttribute("aria-label", tr("restart"));
  $("endBtn").setAttribute("aria-label", tr("end_test"));
}

// ------------------------------------------------------------------ input
const LATIN = /[A-Za-z]/;

function handleInput() {
  if (!session || session.finishing) return;
  const input = $("typingInput");
  const value = input.value;
  // Phonetic Hindi IMEs (e.g. Gboard transliteration) show Latin letters while a word
  // is being composed; don't mark those as errors — wait for the Hindi to be committed.
  if (session.composing && session.adapter.lang === "hi" && session.formatId !== "krutidev" && LATIN.test(lastWord(value))) return;

  const wasReady = session.engine.state === "ready";
  const r = session.engine.setInput(value, { composing: session.composing });
  if (!r.accepted) return;
  if (wasReady && session.engine.state !== "ready") updateControls();
  if (r.largeInsertion && session.config.isExam) {
    session.integrity.largeInsertions++;
    showWarn(tr("exam_insert_warn"));
  }
  scheduleRender();
  if (r.completed) finishTest("completed");
}

function lastWord(v) {
  const m = v.match(/\S*$/);
  return m ? m[0] : "";
}

function showWarn(msg) {
  const w = $("testWarn");
  w.textContent = msg;
  w.hidden = false;
}

function blockPaste(e) {
  if (!session) return;
  e.preventDefault();
  if (session.config.isExam) {
    session.integrity.pastes++;
    showWarn(tr("exam_paste_warn"));
  } else {
    toast(tr("paste_blocked"));
  }
}

function bindTestInput() {
  const input = $("typingInput");
  input.addEventListener("input", handleInput);
  input.addEventListener("compositionstart", () => session && (session.composing = true));
  input.addEventListener("compositionend", () => {
    if (!session) return;
    session.composing = false;
    handleInput();
  });
  input.addEventListener("paste", blockPaste);
  input.addEventListener("drop", blockPaste);
  input.addEventListener("cut", (e) => {
    if (session?.config.isExam) blockPaste(e);
  });
  input.addEventListener("beforeinput", (e) => {
    if (e.inputType === "insertFromPaste" || e.inputType === "insertFromDrop" || e.inputType === "insertFromPasteAsQuotation") blockPaste(e);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      togglePause();
    } else if (e.key === "Enter") {
      // Passages are single paragraphs; a new line is never expected.
      e.preventDefault();
    }
  });

  // Tapping the passage puts the cursor back in the input.
  $("passage").addEventListener("click", () => {
    if (session && session.engine.state !== "paused" && !session.engine.isFinished) input.focus({ preventScroll: true });
  });
  // In exam mode don't let the passage itself be copied.
  $("passage").addEventListener("copy", (e) => {
    if (session?.config.isExam) e.preventDefault();
  });

  $("pauseBtn").addEventListener("click", togglePause);
  $("resumeBtn").addEventListener("click", resumeTest);
  $("restartBtn").addEventListener("click", async () => {
    if (!session) return;
    const wasRunning = session.engine.state === "running";
    if (wasRunning) pauseTest();
    const ok = await confirmDialog(tr("restart_t"), tr("restart_m"), tr("restart"));
    if (ok) restartTest();
    else if (wasRunning) resumeTest();
  });
  $("endBtn").addEventListener("click", async () => {
    if (!session) return;
    if (session.engine.state === "ready") {
      goHome("setup");
      return;
    }
    const wasRunning = session.engine.state === "running";
    if (wasRunning) pauseTest();
    const ok = await confirmDialog(tr("end_t"), tr("end_m"), tr("end_test"));
    if (ok) finishTest("ended");
    else if (wasRunning) resumeTest();
  });
}

function togglePause() {
  if (!session) return;
  if (session.engine.state === "running") pauseTest();
  else if (session.engine.state === "paused") resumeTest();
}

function pauseTest(auto = false) {
  if (!session || session.engine.state !== "running") return;
  session.engine.pause();
  session.autoPaused = auto;
  $("typingInput").readOnly = true;
  $("pausedMsg").textContent = auto ? tr("paused_auto") : tr("paused_m");
  $("pausedOverlay").hidden = false;
  $("timerbar").classList.add("paused");
  updateControls();
  renderMetrics();
  $("resumeBtn").focus({ preventScroll: true });
}

function resumeTest() {
  if (!session || session.engine.state !== "paused") return;
  session.engine.resume();
  const input = $("typingInput");
  input.readOnly = false;
  $("pausedOverlay").hidden = true;
  $("timerbar").classList.remove("paused");
  updateControls();
  input.focus({ preventScroll: true });
  // Put the caret at the end, exactly where the student stopped.
  const end = input.value.length;
  input.setSelectionRange(end, end);
}

function restartTest() {
  if (!session) return;
  const { config } = session;
  startTest(config); // same passage (config.fixedPassage), fresh engine
}

document.addEventListener("visibilitychange", () => {
  if (!session || session.engine.isFinished) return;
  if (document.hidden) {
    if (session.engine.state !== "running") return;
    if (session.config.isExam) {
      // Exams keep running, like the real thing; the switch is recorded.
      session.integrity.tabSwitches++;
      session.tabAway = true;
    } else {
      pauseTest(true);
    }
  } else {
    if (session.tabAway) {
      session.tabAway = false;
      showWarn(tr("exam_tab_warn"));
    }
    onTick(); // catch up immediately (the timer may have run out while away)
  }
});

window.addEventListener("beforeunload", (e) => {
  if (session && !session.engine.isFinished && session.engine.state !== "ready") {
    e.preventDefault();
    e.returnValue = tr("leave_warn");
  }
});

// Touch devices: the test screen is pinned to the *visible* viewport — the part the
// on-screen keyboard doesn't cover — and gets a compact layout when that area is
// short (keyboard open, or a phone in landscape).
document.body.classList.toggle("tp-touch", window.matchMedia("(pointer: coarse)").matches);
function updateViewport() {
  const vv = window.visualViewport;
  const h = vv ? vv.height : window.innerHeight;
  const w = vv ? vv.width : window.innerWidth;
  const root = document.documentElement.style;
  root.setProperty("--vvh", `${Math.round(h)}px`);
  root.setProperty("--vvtop", `${Math.round(vv ? vv.offsetTop : 0)}px`);
  document.body.classList.toggle("tp-short", h < 560);
  document.body.classList.toggle("tp-tiny", h < 300);
  // e.g. iPhone in landscape with the keyboard open: ~100 px of page left.
  const micro = h < 200;
  document.body.classList.toggle("tp-micro", micro);
  if (micro && w > h && session && !session.portraitTipShown) {
    session.portraitTipShown = true;
    toast(tr("portrait_tip"), 4000);
  }
  // Side by side only when clearly wide (a portrait phone with the keyboard open can be
  // slightly wider than tall and must stay stacked).
  document.body.classList.toggle("tp-landscape", w >= 560 && w > h * 1.3);
  if (session) session.view.keepCurrentVisible(Math.min(session.engine.comparison.currentIndex, session.engine.prepared.words.length - 1));
}
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", updateViewport);
  window.visualViewport.addEventListener("scroll", updateViewport);
}
window.addEventListener("resize", updateViewport);
updateViewport();

// ------------------------------------------------------------------ finish + result
function finishTest(reason) {
  if (!session || session.finishing) return;
  session.finishing = true;
  window.clearInterval(session.tickId);
  window.cancelAnimationFrame(session.rafId);
  session.rafId = 0;
  const input = $("typingInput");
  // Commit whatever the IME was still composing before scoring.
  if (!session.engine.isFinished) session.engine.setInput(input.value);
  const result = session.engine.finish(reason);
  input.readOnly = true;
  input.blur();
  session.view.update(session.engine.comparison);
  renderMetrics();
  $("pausedOverlay").hidden = true;

  const m = result.metrics;
  if (m.typedChars === 0) {
    toast(tr("nothing_typed"));
    goHome("setup");
    return;
  }
  if (m.elapsedMs < MIN_MEASURABLE_MS) {
    toast(tr("too_short"));
    goHome("setup");
    return;
  }

  $("doneOverlay").hidden = false;
  const s = session;
  window.setTimeout(() => completeResult(s, result), reducedMotion() ? 250 : 900);
}

async function completeResult(s, result) {
  const m = result.metrics;
  const c = s.config;
  const record = {
    id: newResultId(),
    testId: s.passage.id,
    passageId: s.passage.id,
    format: s.formatId,
    language: getFormat(s.formatId).lang,
    mode: c.mode,
    difficulty: s.passage.difficulty,
    duration: c.durationSec,
    timeTaken: Math.round(m.elapsedMs / 1000),
    wpm: m.wpm,
    grossWpm: m.grossWpm,
    netWpm: m.netWpm,
    cpm: m.cpm,
    accuracy: m.accuracy,
    correctChars: m.correctChars,
    incorrectChars: m.incorrectChars,
    errors: m.errors,
    correctedErrors: m.correctedErrors,
    progress: m.progress,
    endReason: result.endReason,
    completedAt: new Date().toISOString(),
  };
  let saved = false;
  try {
    await resultStore.save(record);
    saved = storage.available;
    if (c.mode === "daily" && c.dailyKey) markDailyComplete(c.dailyKey, s.formatId, { wpm: m.wpm, accuracy: m.accuracy });
  } catch {
    saved = false;
  }

  const words = analyzeWords(s.engine.prepared, result.input, s.adapter);
  const ctx = {
    record,
    metrics: m,
    speedSeries: downsample(result.speedSeries, 120),
    words,
    charErrors: characterErrors(words.rows, s.adapter),
    adapter: s.adapter,
    fontClass: s.adapter.fontClass + (s.formatId === "krutidev" && kdFontAvailable === false ? " kd-missing" : ""),
    name: c.name || "",
    integrity: { ...s.integrity, largeInsertions: Math.max(s.integrity.largeInsertions, c.isExam ? result.largeInsertions : 0) },
    isExam: !!c.isExam,
    saved,
    config: c,
  };
  if (session === s) teardownSession();
  lastResultCtx = ctx;
  showResultView(ctx);
}

function downsample(series, max) {
  if (series.length <= max) return series;
  const step = series.length / max;
  const out = [];
  for (let i = 0; i < max; i++) out.push(series[Math.floor(i * step)]);
  out.push(series[series.length - 1]);
  return out;
}

function showResultView(ctx) {
  renderResult($("resultView"), ctx, {
    onShare: () => shareResult(ctx),
    onCopy: () => copyText(shareText(ctx.record)),
    onPrint: () => window.print(),
    onDownload: () => downloadResult(ctx),
    onRetry: () => startTest(ctx.config),
    onNew: () => {
      const c = { ...ctx.config, fixedPassage: null };
      if (c.mode === "exam" || c.mode === "daily") c.mode = "practice";
      startTest(c);
    },
    onHome: () => goHome("progress"),
    onLang: toggleLanguage,
  });
  if (view !== "result") {
    showView("result");
    pushHistory("result");
  }
  $("resultView").querySelector("h1")?.focus({ preventScroll: true });
}

async function shareResult(ctx) {
  const text = shareText(ctx.record);
  if (navigator.share) {
    try {
      await navigator.share({ title: tr("result_h"), text });
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return;
    }
  }
  copyText(text);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast(tr("copied"));
    return;
  } catch {
    /* fall back below */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    toast(ok ? tr("copied") : tr("copy_failed"));
  } catch {
    toast(tr("copy_failed"));
  }
}

function downloadResult(ctx) {
  try {
    const blob = new Blob([resultAsText(ctx)], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `typing-result-${todayKey()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  } catch {
    toast(tr("generic_error"));
  }
}

// ------------------------------------------------------------------ boot
function boot() {
  applyStrings();
  if (siteI18n) {
    // i18n.js declares `let I18N_ONCHANGE` globally; assigning it hooks our re-render.
    try {
      // eslint-disable-next-line no-undef
      I18N_ONCHANGE = onLanguageChange;
    } catch {
      /* ignore */
    }
    if (typeof window.applyI18n === "function") window.applyI18n();
    applyStrings();
  }
  $("langToggle").addEventListener("click", toggleLanguage);
  document.querySelectorAll("[data-lang-toggle]").forEach((b) => b.addEventListener("click", toggleLanguage));
  $("storageNotice").hidden = storage.available;

  renderSetup();
  bindSetup();
  bindExamIntro();
  bindTestInput();
  renderDaily();
  refreshDashboard();
  history.replaceState({ tp: "home" }, "");
}

try {
  boot();
} catch (err) {
  console.error(err);
  const box = document.getElementById("storageNotice");
  if (box) {
    box.textContent = tr("generic_error");
    box.hidden = false;
  }
}
