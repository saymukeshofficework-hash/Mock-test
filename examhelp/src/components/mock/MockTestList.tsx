"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isDesktopExamHeaderPage } from "@/components/layout/DesktopExamHeader";
import { CheckCircle2, CreditCard, FileText, Lock, PlayCircle, Unlock } from "lucide-react";
import { MOCK_SERIES } from "@/data/mockTests";
import { buyNotes, checkout, claimPurchase, mainSiteUnlock } from "@/lib/checkout";
import { freeAccessOn } from "@/lib/site";

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
  loginErr: { hi: "भुगतान से पहले कृपया लॉगिन करें।", en: "Please log in before paying." },
  otherDevice: { hi: "दूसरे फ़ोन/कंप्यूटर पर? Payment ID से यहाँ अनलॉक करें", en: "On another device? Unlock with your Payment ID here" },
  pattern: { hi: "परीक्षा पैटर्न", en: "Exam pattern" },
  freeTitle: { hi: "🎉 4 नवंबर 2026 तक सभी टेस्ट फ्री", en: "🎉 All tests free till 4 Nov 2026" },
  freeLogin: { hi: "बस लॉगिन करें और कोई भी टेस्ट दें", en: "Just log in and take any test" },
  freeLoginBtn: { hi: "लॉगिन करें", en: "Log in" },
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
  // 14-day free offer: read on the client so the static build never freezes it
  const [freeNow, setFreeNow] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginHref, setLoginHref] = useState("/login.html");
  useEffect(() => {
    setFreeNow(freeAccessOn());
    setLoginHref(`/login.html?next=${encodeURIComponent(location.pathname)}`);
    try {
      setLoggedIn(!!localStorage.getItem("sb-ovaubhekxjtkodkhsybg-auth-token"));
    } catch {
      /* ignore */
    }
  }, []);
  // The desktop header toggle switches the whole page language.
  useEffect(() => {
    const onChange = (e: Event) => {
      const value = (e as CustomEvent).detail;
      if (value === "hi" || value === "en") setLang(value);
    };
    window.addEventListener("testhub-language-change", onChange);
    return () => window.removeEventListener("testhub-language-change", onChange);
  }, []);
  const chooseLang = (value: Lang) => {
    setLang(value);
    try { localStorage.setItem("testhub_lang_pref", value); } catch {}
    window.dispatchEvent(new CustomEvent("testhub-language-change", { detail: value }));
  };
  // On desktop these pages have the toggle in the header, so the body toggle is phone-only.
  const headerToggle = isDesktopExamHeaderPage(usePathname());
  useEffect(() => {
    document.body.classList.add("mock-test-list-page");
    return () => document.body.classList.remove("mock-test-list-page");
  }, []);
  // RRB NTPC Graduate tests open on the main site: a paid token adds them to the student's profile
  const mainSite = S.product === "rrbg-tests" || S.product === "rrbu-tests";
  useEffect(() => {
    if (mainSite && token) mainSiteUnlock();
  }, [mainSite, token]);
  useEffect(() => {
    // Fully free series (e.g. MP Gramin Bank) must not call checkout/status or purchase-claim APIs.
    if (S.free.length === S.total) return;
    let tk: string | null = null;
    try {
      tk = localStorage.getItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    if (tk) {
      // show "unlocked" only for a token the server still accepts for this series
      const saved = tk;
      checkout<{ product?: string }>({ action: "download", token: saved, peek: true })
        .then((r) => {
          if (r.product) setToken(saved);
          else if (r.error) {
            try {
              localStorage.removeItem(TOKEN_KEY);
            } catch {
              /* ignore */
            }
          }
        })
        .catch(() => {});
    } else {
      claimPurchase(S.product).then((t) => t && setToken(t));
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
      onError: (e) => setPayErr(e === "login_required" ? t("loginErr") : t("payErr")),
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
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const t = (k: keyof typeof T) => (T[k] as Record<Lang, string>)[lang];

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">{S.title[lang]}</h1>
          <p className="mt-2 max-w-2xl text-ink-600">{S.sub[lang]}</p>
        </div>
        <div className={`flex shrink-0 items-center gap-1 rounded-xl border border-ink-200 bg-surface p-1 ${headerToggle ? "lg:hidden" : ""}`} role="group" aria-label="Language / भाषा">
          <button type="button" onClick={() => chooseLang("hi")} aria-pressed={lang === "hi"} className={`rounded-lg px-3 py-2 text-sm font-bold ${lang === "hi" ? "bg-brand-700 text-white" : "text-ink-700"}`}>हिन्दी</button>
          <button type="button" onClick={() => chooseLang("en")} aria-pressed={lang === "en"} className={`rounded-lg px-3 py-2 text-sm font-bold ${lang === "en" ? "bg-brand-700 text-white" : "text-ink-700"}`}>English</button>
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

      <section data-sale className="card mt-6 flex flex-col gap-4 border-accent-100 bg-accent-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-ink-900">{S.unlockTitle[lang]}</h2>
          {S.links.map((l) => {
            const [path, hash] = l.href.split("#");
            return (
              <a key={l.href} href={`${base}${path}${lang === "en" ? "?lang=en" : ""}${hash ? "#" + hash : ""}`} className={`mt-2 mr-4 inline-block text-sm font-semibold underline ${l.tone === "accent" ? "text-accent-700" : "text-brand-700"}`}>
                {l.label[lang]}
              </a>
            );
          })}
        </div>
        {S.free.length < S.total ? (
        <div className="shrink-0 sm:w-72">
          {freeNow ? (
            <div className="rounded-lg bg-success-50 px-4 py-3 text-center text-success-700">
              <p className="font-semibold">{t("freeTitle")}</p>
              {loggedIn ? null : (
                <>
                  <p className="mt-1 text-sm">{t("freeLogin")}</p>
                  <a href={loginHref} className="btn-primary mt-2 w-full">{t("freeLoginBtn")}</a>
                </>
              )}
            </div>
          ) : S.unlockHref ? (
            <a href={S.unlockHref} className="btn-primary w-full">
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              {S.unlockBtn[lang]}
            </a>
          ) : token ? (
            <>
              <p className="rounded-lg bg-success-50 px-4 py-2 text-center font-semibold text-success-700">{t("unlocked")}</p>
            </>
          ) : (
            <>
              <button type="button" onClick={unlock} disabled={(!canBuy && !mainSite) || payState !== "idle"} className="btn-primary w-full disabled:opacity-60">
                <CreditCard className="h-4 w-4" aria-hidden="true" />
                {payState !== "idle" ? t("wait") : (canBuy || mainSite) ? S.unlockBtn[lang] : t("soon")}
              </button>
              {payErr ? <p role="alert" className="mt-2 text-sm text-danger-700">{payErr}</p> : null}
              <a href={`${base}/download/?recover=1`} className="mt-2 block text-center text-xs text-brand-700 underline">{t("otherDevice")}</a>
            </>
          )}
        </div>
        ) : null}
      </section>


      <ol className="mock-test-grid mt-8 grid gap-3">
        {Array.from({ length: S.total }, (_, i) => i + 1).map((n) => {
          const isFree = S.free.includes(n);
          const ready = S.openAll || (isFree ? S.free.includes(n) : freeNow ? !!S.unlockHref || mainSite || paidReady.includes(n) : !S.unlockHref && !!token && (mainSite || paidReady.includes(n)));
          const lockedPaid = !isFree && !token && !freeNow;
          const b = best[n];
          const href = S.testHref ? S.testHref(n).replace(/([?&]lang=)(hi|en)/, `$1${lang}`) : `${base}${S.enginePath}?t=${String(n).padStart(2, "0")}&lang=${lang}`;
          return (
            <li key={n} className={`mock-test-card card flex flex-col p-3 sm:p-4 ${isFree ? "is-free" : "is-paid"}`}>
              <div className="mock-test-card-head flex items-center justify-between gap-1">
                <span className="mock-test-logo" aria-hidden="true">{String(n).padStart(2, "0")}</span>
                <h3 className="font-bold text-ink-900">
                  {t("test")} {n}
                  {isFree ? <span className="ml-2 rounded-full bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-700">{t("free")}</span> : null}
                </h3>
                {b ? <CheckCircle2 className="h-5 w-5 text-success-700" aria-hidden="true" /> : null}
              </div>
              <p className="mt-1 flex items-center gap-3 text-xs text-ink-500">
                <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" aria-hidden="true" />{S.meta ? S.meta[lang] : t("meta")}</span>
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
                  S.unlockHref && !freeNow ? (
                    <a href={S.unlockHref} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-canvas px-3 py-2 text-sm font-semibold text-ink-500 ring-1 ring-ink-200">
                      <Lock className="h-4 w-4" aria-hidden="true" />
                      {t("locked")}
                    </a>
                  ) : (
                  <span className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-canvas px-3 py-2 text-sm font-semibold text-ink-500 ring-1 ring-ink-200">
                    {lockedPaid ? <Lock className="h-4 w-4" aria-hidden="true" /> : <Unlock className="h-4 w-4" aria-hidden="true" />}
                    {lockedPaid ? t("locked") : t("soon")}
                  </span>
                  )
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
