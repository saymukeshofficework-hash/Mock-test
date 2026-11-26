"use client";

import { useEffect, useState } from "react";
import { MOCK_SERIES } from "@/data/mockTests";

// Exam landing helpers: real countdown, logged-in price card, sticky bottom bar.
// Default config is MP Police Constable GD; other dated exams pass `cfg` (see src/data/examLandings.ts).
export type GdCfg = {
  series: string;
  examAt: string; // ISO start of exam, IST
  dateHi: string; // e.g. "9 दिसंबर से"
  path: string; // page path without /examhelp, e.g. "/ctet-paper-1-mock-tests/"
  packHi?: string; // what the one payment opens, e.g. "CTET पेपर 1 + 2 के सभी 75 टेस्ट"
  packEn?: string;
};
const GD: GdCfg = { series: "pcgd", examAt: "2026-12-09T00:00:00+05:30", dateHi: "9 दिसंबर से", path: "/mp-police-constable-gd-mock-tests/" };
const loginFor = (c: GdCfg) => `/login.html?next=/examhelp${c.path}`;

function useLeft(c: GdCfg = GD) {
  const EXAM_AT = new Date(c.examAt).getTime();
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, EXAM_AT - Date.now()));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [EXAM_AT]);
  return left;
}

function useAccount(c: GdCfg = GD) {
  const S = MOCK_SERIES[c.series];
  const [st, setSt] = useState({ ready: false, loggedIn: false, unlocked: false });
  useEffect(() => {
    try {
      setSt({
        ready: true,
        loggedIn: !!localStorage.getItem("sb-ovaubhekxjtkodkhsybg-auth-token"),
        unlocked: !!localStorage.getItem(`testhub_dl_${S.product}`),
      });
    } catch {
      setSt({ ready: true, loggedIn: false, unlocked: false });
    }
  }, [S.product]);
  return st;
}

const days = (ms: number) => Math.ceil(ms / 864e5);
const buyNow = () => {
  const b = document.getElementById("series-unlock-btn") as HTMLButtonElement | null;
  if (b) {
    b.scrollIntoView({ behavior: "smooth", block: "center" });
    b.click();
  }
};

export function GdDaysChip({ cfg = GD }: { cfg?: GdCfg }) {
  const left = useLeft(cfg);
  if (!left) return null;
  return (
    <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-800">
      ⏰ परीक्षा {cfg.dateHi} • {days(left)} दिन बाकी ({days(left)} days left)
    </p>
  );
}

export function GdCountdown({ cfg = GD }: { cfg?: GdCfg }) {
  const left = useLeft(cfg);
  if (!left) return null;
  const total = MOCK_SERIES[cfg.series].total;
  const perDay = Math.max(1, Math.ceil(total / Math.max(1, days(left))));
  const d = Math.floor(left / 864e5);
  const h = Math.floor(left / 36e5) % 24;
  const m = Math.floor(left / 6e4) % 60;
  const box = (v: number, l: string) => (
    <div className="rounded-xl bg-brand-900 px-2 py-2 text-center text-white">
      <b className="block text-2xl leading-tight">{String(v).padStart(2, "0")}</b>
      <small className="text-xs opacity-85">{l}</small>
    </div>
  );
  return (
    <section aria-labelledby="gd-cd-h" className="card p-5 sm:p-6">
      <h2 id="gd-cd-h" className="text-lg font-bold text-brand-900">⏳ परीक्षा में कितना समय बचा है? (Time left)</h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {box(d, "दिन / Days")}
        {box(h, "घंटे / Hrs")}
        {box(m, "मिनट / Min")}
      </div>
      <p className="mt-3 text-sm text-ink-700">
        बचे दिनों में {total} टेस्ट = रोज़ लगभग {perDay} टेस्ट। आज से शुरू करें तो परीक्षा से पहले सारे पेपर पूरे होंगे। Start today to finish all {total} before the exam.
      </p>
    </section>
  );
}

// Shown only to logged-in students who have not unlocked yet (via MockTestList topCtaIn).
export function GdBuyCard({ cfg = GD }: { cfg?: GdCfg }) {
  const S = MOCK_SERIES[cfg.series];
  const n = S.total;
  return (
    <section aria-labelledby="gd-buy-h" className="card border-2 border-brand-600 p-5 sm:p-6" data-sale>
      <GdDaysChip cfg={cfg} />
      <p id="gd-buy-h" className="mt-3 flex items-baseline gap-2">
        <span className="text-4xl font-extrabold text-brand-900">₹{S.price}</span>
        <span className="text-ink-700">में {cfg.packHi ?? `सभी ${n} फुल टेस्ट`} ({cfg.packEn ?? `All ${n} full tests`})</span>
      </p>
      <p className="mt-1 text-sm text-ink-600">1 बार का भुगतान, तुरंत अनलॉक। One-time payment, opens instantly.</p>
      <button type="button" onClick={buyNow} className="btn-unlock mt-4 w-full">
        ₹{S.price} में {cfg.packHi ? "" : `${n} `}टेस्ट अनलॉक करें (Unlock)
      </button>
      <a href={S.testHref ? S.testHref(1) : `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${S.enginePath}?t=01&lang=hi`} className="btn-outline mt-2 w-full">
        पहले Test 1 दें (Try Test 1)
      </a>
      <p className="mt-2 text-center text-xs text-ink-500">🔒 UPI • Card • Net Banking — Razorpay सुरक्षित भुगतान (secure payment)</p>
    </section>
  );
}

export function GdSticky({ cfg = GD, label = "MP GD" }: { cfg?: GdCfg; label?: string }) {
  const S = MOCK_SERIES[cfg.series];
  const left = useLeft(cfg);
  const a = useAccount(cfg);
  if (!a.ready || a.unlocked) return null;
  return (
    <div {...(a.loggedIn ? { "data-sale": "" } : {})} className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-ink-200 bg-surface px-4 py-2.5 shadow-[0_-4px_14px_rgba(0,0,0,0.1)] sm:hidden">
      <div className="text-xs leading-tight text-ink-700">
        {S.total} फुल टेस्ट
        <b className="block text-base text-brand-900">{a.loggedIn ? `₹${S.price}` : left ? `${days(left)} दिन बाकी` : label}</b>
      </div>
      {a.loggedIn ? (
        <button type="button" onClick={buyNow} className="btn-unlock flex-1">
          अभी अनलॉक करें (Unlock)
        </button>
      ) : (
        <a href={loginFor(cfg)} className="btn-primary flex-1">
          रजिस्टर करें (Register, 1 min)
        </a>
      )}
    </div>
  );
}
