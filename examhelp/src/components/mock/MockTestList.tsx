"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, FileText, Lock, PlayCircle, Unlock } from "lucide-react";
import { MOCK_SERIES } from "@/data/mockTests";
import { buyNotes, checkout, downloadPath } from "@/lib/checkout";

type Lang = "hi" | "en";
type Best = { last: number; best: number; total: number; at: number };

const T = {
  test: { hi: "मॉक टेस्ट", en: "Mock Test" },
  start: { hi: "टेस्ट शुरू करें", en: "Start test" },
  again: { hi: "फिर से दें", en: "Retake" },
  soon: { hi: "जल्द उपलब्ध", en: "Coming soon" },
  best: { hi: "सर्वश्रेष्ठ", en: "Best" },
  meta: { hi: "100 प्रश्न · 120 मिनट", en: "100 Qs · 120 min" },
  free: { hi: "फ्री", en: "Free" },
  locked: { hi: "टेस्ट सीरीज़ में", en: "In test series" },
  unlocked: { hi: "टेस्ट सीरीज़ अनलॉक है ✓", en: "Test series unlocked ✓" },
  wait: { hi: "कृपया प्रतीक्षा करें…", en: "Please wait…" },
  payErr: { hi: "भुगतान पूरा नहीं हुआ। कृपया दोबारा प्रयास करें।", en: "Payment didn't go through. Please try again." },
  otherDevice: { hi: "दूसरे फ़ोन/कंप्यूटर पर? Payment ID से यहाँ अनलॉक करें", en: "On another device? Unlock with your Payment ID here" },
  pattern: { hi: "परीक्षा पैटर्न", en: "Exam pattern" },
};
export function MockTestList({ series = "ag3" }: { series?: string }) {
  const S = MOCK_SERIES[series];
  const TOKEN_KEY = `testhub_dl_${S.product}`;
  const [lang, setLang] = useState<Lang>("hi");
  const [best, setBest] = useState<Record<number, Best>>({});
  const [token, setToken] = useState<string | null>(null);
  const [paidReady, setPaidReady] = useState<number[]>([]);
  const [canBuy, setCanBuy] = useState(false);
  const [payState, setPayState] = useState("idle");
  const [payErr, setPayErr] = useState("");
  useEffect(() => {
    try {
      setToken(localStorage.getItem(TOKEN_KEY));
    } catch {
      /* ignore */
    }
    checkout<{ ready: boolean; tests?: number[] }>({ action: "status", product: S.product })
      .then((r) => {
        setCanBuy(!!r.ready);
        setPaidReady(r.tests ?? []);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const unlock = () => {
    setPayErr("");
    buyNotes(S.product, {
      onState: setPayState,
      onError: () => setPayErr(t("payErr")),
      onPaid: (tk) => {
        try {
          localStorage.setItem(TOKEN_KEY, tk);
        } catch {
          /* ignore */
        }
        setToken(tk);
      },
    });
  };
  useEffect(() => {
    try {
      const q = new URLSearchParams(location.search).get("lang");
      const l = (q || localStorage.getItem("testhub_lang_pref")) as Lang | null;
      if (l === "en" || l === "hi") setLang(l);
      const m: Record<number, Best> = {};
      for (let i = 1; i <= S.total; i++) {
        const v = localStorage.getItem(`${S.scorePrefix}${String(i).padStart(2, "0")}`);
        if (v) m[i] = JSON.parse(v);
      }
      setBest(m);
    } catch {
      /* ignore */
    }
  }, []);
  const switchLang = (l: Lang) => {
    setLang(l);
    try {
      localStorage.setItem("testhub_lang_pref", l);
    } catch {
      /* ignore */
    }
  };
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const t = (k: keyof typeof T) => (T[k] as Record<Lang, string>)[lang];

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">{S.title[lang]}</h1>
          <p className="mt-2 max-w-2xl text-ink-600">{S.sub[lang]}</p>
        </div>
        <div className="inline-flex shrink-0 rounded-full border border-ink-200 bg-white p-0.5 text-sm font-semibold" role="group" aria-label="भाषा / Language">
          {(["hi", "en"] as Lang[]).map((l) => (
            <button key={l} type="button" onClick={() => switchLang(l)} aria-pressed={lang === l}
              className={`rounded-full px-3 py-1 ${lang === l ? "bg-brand-700 text-white" : "text-ink-700"}`}>
              {l === "hi" ? "हिंदी" : "English"}
            </button>
          ))}
        </div>
      </div>

      <section className="card mt-6 overflow-x-auto p-5" aria-labelledby="pat-h">
        <h2 id="pat-h" className="font-bold text-ink-900">{t("pattern")}</h2>
        <table className="mt-3 w-full text-sm">
          <tbody>
            {S.rows[lang].map(([a, b, c]) => (
              <tr key={a} className="border-t border-ink-100">
                <td className="py-2 pr-3 font-medium text-ink-900">{a}</td>
                <td className="px-3 py-2">{b}</td>
                <td className="py-2 pl-3 text-ink-600">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-sm font-semibold text-ink-800">{S.totalLine[lang]}</p>
        <p className="mt-1 text-xs text-ink-500">{S.neg[lang]}</p>
      </section>

      <section className="card mt-6 flex flex-col gap-4 border-accent-100 bg-accent-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-ink-900">{S.unlockTitle[lang]}</h2>
          <p className="mt-1 text-sm text-ink-600">{S.unlockSub[lang]}</p>
          {S.links.map((l) => {
            const [path, hash] = l.href.split("#");
            return (
              <a key={l.href} href={`${base}${path}${lang === "en" ? "?lang=en" : ""}${hash ? "#" + hash : ""}`} className={`mt-2 mr-4 inline-block text-sm font-semibold underline ${l.tone === "accent" ? "text-accent-700" : "text-brand-700"}`}>
                {l.label[lang]}
              </a>
            );
          })}
        </div>
        <div className="shrink-0 sm:w-72">
          {token ? (
            <>
              <p className="rounded-lg bg-success-50 px-4 py-2 text-center font-semibold text-success-700">{t("unlocked")}</p>
              <a href={downloadPath(token)} className="mt-2 block text-center text-xs text-brand-700 underline">
                {lang === "hi" ? "दूसरे डिवाइस के लिए यह लिंक सेव करें" : "Save this link to unlock another device"}
              </a>
            </>
          ) : (
            <>
              <button type="button" onClick={unlock} disabled={!canBuy || payState !== "idle"} className="btn-primary w-full disabled:opacity-60">
                <CreditCard className="h-4 w-4" aria-hidden="true" />
                {payState !== "idle" ? t("wait") : canBuy ? S.unlockBtn[lang] : t("soon")}
              </button>
              {payErr ? <p role="alert" className="mt-2 text-sm text-danger-700">{payErr}</p> : null}
              <a href={`${base}/download/`} className="mt-2 block text-center text-xs text-brand-700 underline">{t("otherDevice")}</a>
            </>
          )}
        </div>
      </section>

      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: S.total }, (_, i) => i + 1).map((n) => {
          const isFree = S.free.includes(n);
          const ready = isFree ? S.free.includes(n) : !!token && paidReady.includes(n);
          const lockedPaid = !isFree && !token;
          const b = best[n];
          const href = `${base}${S.enginePath}?t=${String(n).padStart(2, "0")}&lang=${lang}`;
          return (
            <li key={n} className="card flex flex-col p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-ink-900">
                  {t("test")} {n}
                  {isFree ? <span className="ml-2 rounded-full bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-700">{t("free")}</span> : null}
                </h3>
                {b ? <CheckCircle2 className="h-5 w-5 text-success-700" aria-hidden="true" /> : null}
              </div>
              <p className="mt-1 flex items-center gap-3 text-xs text-ink-500">
                <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" aria-hidden="true" />{t("meta")}</span>
              </p>
              {b ? (
                <p className="mt-2 text-sm text-ink-700">
                  {t("best")}: <b>{b.best}</b> / {b.total}
                </p>
              ) : null}
              <div className="mt-auto pt-4">
                {ready ? (
                  <a href={href} className="btn-primary w-full">
                    <PlayCircle className="h-4 w-4" aria-hidden="true" />
                    {b ? t("again") : t("start")}
                  </a>
                ) : (
                  <span className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-canvas px-3 py-2 text-sm font-semibold text-ink-500 ring-1 ring-ink-200">
                    {lockedPaid ? <Lock className="h-4 w-4" aria-hidden="true" /> : <Unlock className="h-4 w-4" aria-hidden="true" />}
                    {lockedPaid ? t("locked") : t("soon")}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
