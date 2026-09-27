// Tiny dependency-free SVG/HTML charts for the result screen. The site has no chart
// library, and a single line chart does not justify adding one.

/** Speed-over-time line chart. series: [{t (s), wpm, avg}] */
export function speedChartSVG(series, { secondsLabel = "seconds", ariaLabel = "Speed over time", width = 640 } = {}) {
  // Drawn at (roughly) its on-screen width so axis labels stay readable on phones.
  const W = Math.max(280, Math.min(640, Math.round(width)));
  const H = 220;
  const pad = { l: 38, r: 12, t: 12, b: 34 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const maxT = Math.max(1, series[series.length - 1].t);
  const maxV = Math.max(10, ...series.map((p) => Math.max(p.wpm, p.avg)));
  const rawStep = maxV / 4;
  const mag = 10 ** Math.floor(Math.log10(rawStep));
  const yStep = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => s >= rawStep);
  const yMax = yStep * 4;
  const x = (t) => pad.l + (t / maxT) * iw;
  const y = (v) => pad.t + ih - (v / yMax) * ih;

  const pts = [{ t: 0, wpm: 0 }, ...series];
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p.wpm).toFixed(1)}`).join("");
  const area = `${line}L${x(maxT).toFixed(1)},${y(0)}L${x(0)},${y(0)}Z`;
  const avg = series.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p.avg).toFixed(1)}`).join("");

  // Axis ticks: ~6 on x at friendly steps, 4 on y.
  const steps = [5, 10, 15, 30, 60, 120, 300];
  const maxTicks = W < 420 ? 4 : 6;
  const xStep = steps.find((s) => maxT / s <= maxTicks) || 600;
  let grid = "";
  for (let i = 0; i <= 4; i++) {
    const v = (yMax / 4) * i;
    grid += `<line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}"/><text class="lbl" x="${pad.l - 6}" y="${y(v) + 4}" text-anchor="end">${Math.round(v)}</text>`;
  }
  for (let t = 0; t <= maxT + 0.001; t += xStep) {
    grid += `<text class="lbl" x="${x(t)}" y="${H - pad.b + 16}" text-anchor="middle">${t}</text>`;
  }
  grid += `<text class="lbl" x="${pad.l + iw / 2}" y="${H - 4}" text-anchor="middle">${secondsLabel}</text>`;

  return `<svg class="rchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${ariaLabel}">
    ${grid}
    <line class="axis" x1="${pad.l}" x2="${W - pad.r}" y1="${y(0)}" y2="${y(0)}"/>
    <path class="area" d="${area}"/>
    <path class="line" d="${line}"/>
    <path class="avg" d="${avg}"/>
  </svg>`;
}

/** Horizontal summary bars: speed (vs a 60 WPM scale), accuracy, errors (share of typed). */
export function summaryBarsHTML({ wpm, accuracy, errors, typedChars }, labels) {
  const speedScale = Math.max(60, Math.ceil(wpm / 20) * 20);
  const errPct = typedChars ? Math.min(100, (errors / typedChars) * 100) : 0;
  const bar = (label, pct, cls, value) =>
    `<div class="rbar"><span>${label}</span><div class="rbar-track" aria-hidden="true"><div class="rbar-fill ${cls}" style="width:${Math.max(0, Math.min(100, pct)).toFixed(1)}%"></div></div><b>${value}</b></div>`;
  return `<div class="rbars">
    ${bar(labels.speed, (wpm / speedScale) * 100, "", `${wpm}`)}
    ${bar(labels.accuracy, accuracy, "acc", `${accuracy}%`)}
    ${bar(labels.errors, errPct, "err", `${errors}`)}
  </div>`;
}
