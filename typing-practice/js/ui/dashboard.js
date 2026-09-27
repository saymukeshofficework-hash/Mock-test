// "My Typing Progress" + "Test History" sections of the home screen.

import { tr, currentLang } from "../strings.js";
import { FORMATS, getFormat } from "../data/formats.js";
import { summarizeProgress } from "../storage.js";
import { durationLabel } from "./result-view.js";

const HISTORY_ROWS = 20;

function practiceTime(sec) {
  if (sec < 60) return `${sec} ${tr("sec")}`;
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m} ${tr("min")}`;
}

export function renderProgress(el, results) {
  const { overall, byFormat } = summarizeProgress(results);
  const lang = currentLang();
  const stat = (v, k) => `<div class="tp-stat"><span class="tp-stat-val">${v}</span><span class="tp-stat-label">${tr(k)}</span></div>`;
  const perFormat = FORMATS.map((f) => {
    const s = byFormat[f.id];
    const body = s
      ? `<dl>
          <dt>${tr("best")}</dt><dd>${s.bestWpm} WPM</dd>
          <dt>${tr("average")}</dt><dd>${s.avgWpm} WPM</dd>
          <dt>${tr("best_acc")}</dt><dd>${s.bestAccuracy}%</dd>
          <dt>${tr("tests_done")}</dt><dd>${s.tests}</dd>
        </dl>`
      : `<p class="tp-empty">${tr("no_tests_format")}</p>`;
    return `<div class="tp-fstat"><h3>${f.label[lang]}</h3>${body}</div>`;
  }).join("");

  el.innerHTML = `
    <div class="tp-stat-grid">
      ${stat(overall.bestWpm, "best_wpm")}
      ${stat(overall.avgWpm, "avg_wpm")}
      ${stat(`${overall.bestAccuracy}%`, "best_acc")}
      ${stat(overall.tests, "tests_done")}
      ${stat(practiceTime(overall.totalSec), "total_time")}
    </div>
    <div class="tp-format-stats">${perFormat}</div>`;
}

export function renderHistory(el, results) {
  if (!results.length) {
    el.innerHTML = `<div class="tp-empty-box">${tr("history_empty")}</div>`;
    return;
  }
  const locale = currentLang() === "hi" ? "hi-IN" : "en-IN";
  const fmtDate = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });
  const rows = results.slice(0, HISTORY_ROWS).map((r) => {
    const f = getFormat(r.format);
    return `<tr>
      <td data-label="${tr("h_date")}">${fmtDate.format(new Date(r.completedAt))}</td>
      <td data-label="${tr("h_lang")}">${f.label[currentLang()]}</td>
      <td data-label="${tr("h_mode")}">${tr("mode_" + r.mode)}</td>
      <td data-label="WPM" class="num"><strong>${r.wpm}</strong></td>
      <td data-label="${tr("accuracy")}" class="num">${r.accuracy}%</td>
      <td data-label="${tr("h_duration")}" class="num">${durationLabel(r.duration)}</td>
    </tr>`;
  });
  el.innerHTML = `<div class="tp-table-wrap"><table class="tp-table">
    <thead><tr>
      <th scope="col">${tr("h_date")}</th><th scope="col">${tr("h_lang")}</th><th scope="col">${tr("h_mode")}</th>
      <th scope="col" class="num">WPM</th><th scope="col" class="num">${tr("accuracy")}</th><th scope="col" class="num">${tr("h_duration")}</th>
    </tr></thead>
    <tbody>${rows.join("")}</tbody></table></div>`;
}
