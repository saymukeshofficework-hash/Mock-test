// Result dashboard in the TET Test Hub result format: navy score hero, then
// details. Pure rendering — actions are passed in as callbacks.

import { tr, currentLang } from "../strings.js";
import { formatClock, performanceLevel } from "../engine/metrics.js";
import { diffWord } from "../engine/analysis.js";
import { speedChartSVG, summaryBarsHTML } from "./charts.js";
import { getFormat } from "../data/formats.js";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const MAX_ERROR_ROWS = 30;

export function durationLabel(sec) {
  if (sec < 60) return `${sec} ${tr("sec")}`;
  const m = sec / 60;
  return `${Number.isInteger(m) ? m : m.toFixed(1)} ${tr("min")}`;
}

export function shareText(r) {
  const f = getFormat(r.format);
  const url = "https://tettesthub.in/typing-practice/";
  if (currentLang() === "hi") {
    return `मैंने TETTESTHUB पर ${f.label.en} Typing Test में ${r.wpm} WPM और ${r.accuracy}% Accuracy हासिल की। ${url}`;
  }
  return `I scored ${r.wpm} WPM with ${r.accuracy}% accuracy in the ${f.label.en} Typing Test on TETTESTHUB. ${url}`;
}

function wordDiffHTML(row, adapter) {
  if (row.type !== "incorrect") {
    return {
      exp: row.expected ? esc(row.expected) : `<em>${tr("extra")}</em>`,
      typ: row.typed ? `<span class="hl-bad">${esc(row.typed)}</span>` : `<em>${tr("missing")}</em>`,
    };
  }
  const segs = diffWord(row.expected, row.typed, adapter);
  return {
    exp: segs.map((s) => (s.ok || !s.expected ? esc(s.expected) : `<span class="hl-exp">${esc(s.expected)}</span>`)).join(""),
    typ: segs.map((s) => (s.ok ? esc(s.typed) : s.typed ? `<span class="hl-bad">${esc(s.typed)}</span>` : "")).join(""),
  };
}

/**
 * @param {HTMLElement} el
 * @param {object} ctx {record, metrics, speedSeries, words, charErrors, adapter, fontClass,
 *                      name, integrity, isExam, saved}
 * @param {object} actions {onShare, onCopy, onPrint, onDownload, onRetry, onNew, onHome, onLang}
 */
export function renderResult(el, ctx, actions) {
  const { record: r, metrics: m, speedSeries, words, charErrors, fontClass, integrity } = ctx;
  const f = getFormat(r.format);
  const lang = currentLang();
  // Classified on Net WPM so fast-but-inaccurate typing is not called "Excellent".
  const level = performanceLevel(m.netWpm, f.lang);
  const endKey = { time: "end_time", completed: "end_completed" }[r.endReason] || "end_ended";
  const fontLang = f.lang === "hi" && r.format !== "krutidev" ? ' lang="hi"' : "";

  const cells = [
    ["accuracy", `${m.accuracy}%`, m.accuracy >= 95 ? "good" : m.accuracy < 85 ? "bad" : ""],
    ["net_wpm", m.netWpm, ""],
    ["gross_wpm", m.grossWpm, ""],
    ["cpm", m.cpm, ""],
    ["correct_chars", m.correctChars, "good"],
    ["incorrect_chars", m.incorrectChars, m.incorrectChars ? "bad" : ""],
    ["errors", m.errors, m.errors ? "bad" : ""],
    ["time", formatClock(m.elapsedMs, { roundUp: false }), ""],
  ];
  if (m.correctedErrors) cells.push(["corrected", m.correctedErrors, ""]);

  const wrongRows = words.rows.filter((row) => row.type !== "correct");
  const errorRows = wrongRows.slice(0, MAX_ERROR_ROWS).map((row) => {
    const d = wordDiffHTML(row, ctx.adapter);
    const tag = row.type === "missed" ? `<span class="tag missed">${tr("w_missed")}</span>` : row.type === "extra" ? `<span class="tag extra">${tr("w_extra")}</span>` : "";
    return `<div class="rerr-row"><span class="${fontClass}"${fontLang}>${d.exp}${tag}</span><span class="${fontClass}"${fontLang}>${d.typ}</span></div>`;
  });

  const charChips = charErrors
    .map((c) => {
      const e = c.expected ? `<b class="${fontClass}">${esc(c.expected === " " ? "␣" : c.expected)}</b>` : tr("extra");
      const t = c.typed ? `<b class="${fontClass}">${esc(c.typed === " " ? "␣" : c.typed)}</b>` : tr("missing");
      return `<span class="rchar">${e} → ${t} <small>×${c.count}</small></span>`;
    })
    .join("");

  const motivation = `<p>${tr("mot_" + level)}</p>${m.accuracy < 90 && m.typedChars > 20 ? `<p>${tr("mot_accuracy")}</p>` : ""}`;

  const integrityHTML =
    ctx.isExam && (integrity.pastes || integrity.largeInsertions || integrity.tabSwitches)
      ? `<section class="rsec"><div class="rintegrity"><strong>${tr("integrity")}</strong><ul>
          ${integrity.pastes ? `<li>${tr("paste_attempts")}: ${integrity.pastes}</li>` : ""}
          ${integrity.largeInsertions ? `<li>${tr("large_inserts")}: ${integrity.largeInsertions}</li>` : ""}
          ${integrity.tabSwitches ? `<li>${tr("tab_switches")}: ${integrity.tabSwitches}</li>` : ""}
        </ul></div></section>`
      : "";

  const chart =
    speedSeries.length >= 2
      ? `<section class="rsec"><h2>${tr("speed_graph")}</h2>${speedChartSVG(speedSeries, { secondsLabel: tr("seconds"), ariaLabel: tr("speed_graph"), width: Math.min(window.innerWidth, 760) - 32 })}<p class="rnote">${tr("speed_graph_note")}</p></section>`
      : "";

  el.innerHTML = `
    <div class="rhero">
      <button class="tf-lang" type="button" data-act="lang">${lang === "hi" ? "EN" : "हिं"}</button>
      <div class="rbrand">TET Test Hub · ${esc(f.label[lang])}</div>
      <h1 tabindex="-1">${tr("result_h")}</h1>
      ${ctx.name ? `<div class="rname">${esc(ctx.name)}</div>` : ""}
      <div class="rscore">${r.wpm}<small>WPM</small></div>
      <div class="routof">${esc(f.label[lang])} · ${durationLabel(r.duration)} · ${tr("d_" + r.difficulty)} · ${tr(endKey)}</div>
      <div class="rpills">
        <span class="rpill">${m.accuracy}% ${tr("accuracy")}</span>
        <span class="rpill lvl-${level}">${tr("lvl_" + level)}</span>
      </div>
    </div>
    <div class="rwrap">
      <div class="rmotiv">${motivation}</div>
      <section class="rsec">
        <div class="rgrid">${cells.map(([k, v, cls]) => `<div class="rcell ${cls}"><span class="v">${v}</span><span class="l">${tr(k)}</span></div>`).join("")}</div>
      </section>
      <section class="rsec">
        <h2>${tr("your_perf")}</h2>
        ${summaryBarsHTML(m, { speed: `${tr("speed")} (WPM)`, accuracy: tr("accuracy"), errors: tr("errors") })}
      </section>
      ${chart}
      <section class="rsec">
        <h2>${tr("word_analysis")}</h2>
        <div class="rwords">
          <div class="rcell good"><span class="v">${words.correct}</span><span class="l">${tr("w_correct")}</span></div>
          <div class="rcell ${words.incorrect ? "bad" : ""}"><span class="v">${words.incorrect}</span><span class="l">${tr("w_incorrect")}</span></div>
          <div class="rcell"><span class="v">${words.missed}</span><span class="l">${tr("w_missed")}</span></div>
          <div class="rcell"><span class="v">${words.extra}</span><span class="l">${tr("w_extra")}</span></div>
        </div>
      </section>
      <section class="rsec">
        <h2>${tr("error_analysis")}</h2>
        ${
          errorRows.length
            ? `<div class="rerr"><div class="rerr-row rerr-head"><span>${tr("expected")}</span><span>${tr("typed")}</span></div>${errorRows.join("")}</div>
               ${wrongRows.length > MAX_ERROR_ROWS ? `<p class="rmore">+${wrongRows.length - MAX_ERROR_ROWS} ${tr("more_errors")}</p>` : ""}
               ${charChips ? `<h2 style="margin-top:14px">${tr("char_errors")}</h2><div class="rchars">${charChips}</div>` : ""}`
            : `<p class="rnote">${tr("no_errors")}</p>`
        }
      </section>
      ${integrityHTML}
      <div class="ractions">
        <button class="tf-btn tf-btn-primary" type="button" data-act="share">${tr("share")}</button>
        <button class="tf-btn tf-btn-outline" type="button" data-act="copy">${tr("copy")}</button>
        <button class="tf-btn tf-btn-outline" type="button" data-act="print">${tr("print")}</button>
        <button class="tf-btn tf-btn-outline" type="button" data-act="download">${tr("download")}</button>
        <button class="tf-btn tf-btn-green" type="button" data-act="retry">${tr("try_again")}</button>
        <button class="tf-btn tf-btn-outline" type="button" data-act="new">${tr("new_passage")}</button>
        <button class="tf-btn tf-btn-ghost wide" type="button" data-act="home">${tr("back_home")}</button>
      </div>
      ${ctx.saved ? `<p class="rsaved">${tr("saved_note")}</p>` : ""}
    </div>`;

  const map = { share: actions.onShare, copy: actions.onCopy, print: actions.onPrint, download: actions.onDownload, retry: actions.onRetry, new: actions.onNew, home: actions.onHome, lang: actions.onLang };
  el.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => map[b.dataset.act]?.()));
}

/** Plain-text result for Download / Copy. */
export function resultAsText(ctx) {
  const { record: r, metrics: m } = ctx;
  const f = getFormat(r.format);
  const lines = [
    `TET Test Hub — ${tr("result_h")}`,
    ctx.name ? ctx.name : null,
    `${f.label.en} · ${durationLabel(r.duration)} · ${tr("d_" + r.difficulty)}`,
    new Date(r.completedAt).toLocaleString(currentLang() === "hi" ? "hi-IN" : "en-IN"),
    "",
    `WPM: ${m.wpm}`,
    `${tr("accuracy")}: ${m.accuracy}%`,
    `${tr("net_wpm")}: ${m.netWpm}`,
    `${tr("gross_wpm")}: ${m.grossWpm}`,
    `CPM: ${m.cpm}`,
    `${tr("correct_chars")}: ${m.correctChars}`,
    `${tr("incorrect_chars")}: ${m.incorrectChars}`,
    `${tr("errors")}: ${m.errors}`,
    `${tr("time")}: ${formatClock(m.elapsedMs, { roundUp: false })}`,
    "",
    "https://tettesthub.in/typing-practice/",
  ];
  return lines.filter((l) => l !== null).join("\n");
}
