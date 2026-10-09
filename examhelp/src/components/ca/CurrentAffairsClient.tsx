"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Check, CreditCard, Download, Globe2, Landmark, Lock, MapPin, Newspaper, ShieldCheck, Sparkles } from "lucide-react";
import { buyNotes, checkout } from "@/lib/checkout";

/**
 * Daily current affairs (MP, India, World) behind a ₹49 / 30-day pass.
 * Content lives in Supabase (table ca_days) and is served only to valid pass holders
 * by the notes-checkout edge function (actions ca_index / ca_day).
 */

type Lang = "hi" | "en";
type Bi = { hi: string; en: string };
type Item = {
  id: string;
  region: "mp" | "india" | "world";
  cat: string;
  title: Bi;
  summary: Bi;
  points: { hi: string[]; en: string[] };
  sources?: { name: string; url: string }[];
};
type Quiz = { q: Bi; o: { hi: string[]; en: string[] }; a: number; exp: Bi };
type Day = { day: string; title?: Bi; items: Item[]; oneliners?: { hi: string[]; en: string[] }; quiz?: Quiz[] };
type IndexRow = { day: string; items: number };

const PRODUCT = "ca-30";
const TOKEN_KEY = `testhub_dl_${PRODUCT}`;
const PDF_LIB = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";

const REGIONS: { key: "all" | Item["region"]; label: Bi; Icon: typeof MapPin }[] = [
  { key: "all", label: { hi: "सभी", en: "All" }, Icon: Newspaper },
  { key: "mp", label: { hi: "मध्यप्रदेश", en: "Madhya Pradesh" }, Icon: MapPin },
  { key: "india", label: { hi: "राष्ट्रीय", en: "India" }, Icon: Landmark },
  { key: "world", label: { hi: "अंतरराष्ट्रीय", en: "World" }, Icon: Globe2 },
];
const CATS: Record<string, Bi> = {
  polity: { hi: "राजव्यवस्था", en: "Polity" },
  economy: { hi: "अर्थव्यवस्था", en: "Economy" },
  science: { hi: "विज्ञान-तकनीक", en: "Science & Tech" },
  sports: { hi: "खेल", en: "Sports" },
  awards: { hi: "पुरस्कार", en: "Awards" },
  schemes: { hi: "योजनाएँ", en: "Schemes" },
  environment: { hi: "पर्यावरण", en: "Environment" },
  defence: { hi: "रक्षा", en: "Defence" },
  appointments: { hi: "नियुक्तियाँ", en: "Appointments" },
  days: { hi: "महत्वपूर्ण दिवस", en: "Important days" },
  relations: { hi: "अंतरराष्ट्रीय संबंध", en: "International relations" },
  reports: { hi: "रिपोर्ट व सूचकांक", en: "Reports & indices" },
  other: { hi: "अन्य", en: "Other" },
};
const REGION_LABEL: Record<Item["region"], Bi> = {
  mp: { hi: "मध्यप्रदेश", en: "Madhya Pradesh" },
  india: { hi: "राष्ट्रीय", en: "India" },
  world: { hi: "अंतरराष्ट्रीय", en: "World" },
};

const fmtDay = (d: string, lang: Lang, long = false) =>
  new Date(d + "T00:00:00+05:30").toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: long ? "long" : "short",
    ...(long ? { year: "numeric", weekday: "long" } : {}),
    timeZone: "Asia/Kolkata",
  });

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("script"));
    document.body.appendChild(s);
  });
}

export function CurrentAffairsClient() {
  const [lang, setLang] = useState<Lang>("hi");
  const [token, setToken] = useState<string | null>(null);
  const [index, setIndex] = useState<IndexRow[]>([]);
  const [canBuy, setCanBuy] = useState(false);
  const [state, setState] = useState<"loading" | "locked" | "expired" | "ready">("loading");
  const [expires, setExpires] = useState<string | null>(null);
  const [day, setDay] = useState<Day | null>(null);
  const [region, setRegion] = useState<"all" | Item["region"]>("all");
  const [payState, setPayState] = useState("idle");
  const [payErr, setPayErr] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [shown, setShown] = useState<Record<number, number | undefined>>({});
  const printRef = useRef<HTMLDivElement>(null);
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const L = (b?: Bi) => (b ? b[lang] || b.hi : "");

  const openDay = useCallback(async (tk: string, d?: string) => {
    const r = await checkout<{ data: Day | null; day: string | null; expires_at: string }>({ action: "ca_day", token: tk, day: d });
    if (r.error === "expired") {
      setExpires(r.expires_at ?? null);
      setState("expired");
      return;
    }
    if (r.error) {
      setState("locked");
      return;
    }
    setExpires(r.expires_at);
    setDay(r.data ? { ...r.data, day: r.day ?? r.data.day } : null);
    setShown({});
    setState("ready");
  }, []);

  useEffect(() => {
    try {
      const q = new URLSearchParams(location.search).get("lang");
      const l = (q || localStorage.getItem("testhub_lang_pref")) as Lang | null;
      if (l === "en" || l === "hi") setLang(l);
    } catch {
      /* ignore */
    }
    checkout<{ days: IndexRow[]; ready: boolean }>({ action: "ca_index" })
      .then((r) => {
        setIndex(r.days ?? []);
        setCanBuy(!!r.ready);
      })
      .catch(() => {});
    let tk: string | null = null;
    try {
      tk = localStorage.getItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    setToken(tk);
    if (tk) openDay(tk);
    else setState("locked");
  }, [openDay]);

  const buy = () => {
    setPayErr("");
    buyNotes(PRODUCT, {
      onState: setPayState,
      onError: (e) =>
        setPayErr(
          e.startsWith("verify:")
            ? (lang === "hi" ? "भुगतान हो गया पर पुष्टि अटक गई। यह Payment ID संभालकर रखें: " : "Payment received but confirmation got stuck. Keep this Payment ID: ") + e.slice(7)
            : lang === "hi" ? "भुगतान पूरा नहीं हुआ। कृपया दोबारा प्रयास करें।" : "Payment didn't go through. Please try again.",
        ),
      onPaid: (tk) => {
        try {
          localStorage.setItem(TOKEN_KEY, tk);
        } catch {
          /* ignore */
        }
        setToken(tk);
        openDay(tk);
      },
    });
  };

  const items = useMemo(() => (day?.items ?? []).filter((i) => region === "all" || i.region === region), [day, region]);

  const downloadPdf = async () => {
    if (!day || !printRef.current) return;
    setPdfBusy(true);
    try {
      await loadScript(PDF_LIB);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const h2p = (window as any).html2pdf;
      await h2p()
        .set({
          margin: [8, 8, 10, 8],
          filename: `TETTESTHUB-Current-Affairs-${day.day}-${lang}.pdf`,
          image: { type: "jpeg", quality: 0.92 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff", scrollX: 0, scrollY: 0, x: 0, y: 0, windowWidth: 734 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"], avoid: [".ca-avoid"] },
        })
        .from(printRef.current)
        .save();
    } catch {
      window.print();
    } finally {
      setPdfBusy(false);
    }
  };

  const switchLang = (l: Lang) => {
    setLang(l);
    try {
      localStorage.setItem("testhub_lang_pref", l);
    } catch {
      /* ignore */
    }
  };

  const LangToggle = () => (
    <div className="inline-flex rounded-full border border-ink-200 bg-surface p-0.5 text-sm font-semibold" role="group" aria-label="भाषा / Language">
      {(["hi", "en"] as Lang[]).map((l) => (
        <button key={l} type="button" onClick={() => switchLang(l)} aria-pressed={lang === l}
          className={`rounded-full px-3 py-1 ${lang === l ? "bg-brand-700 text-white" : "text-ink-700"}`}>
          {l === "hi" ? "हिंदी" : "English"}
        </button>
      ))}
    </div>
  );

  // ---------------- paywall ----------------
  if (state === "loading") return <div className="container-page py-20 text-center text-ink-500">{lang === "hi" ? "लोड हो रहा है…" : "Loading…"}</div>;

  if (state === "locked" || state === "expired") {
    const perks: Bi[] = [
      { hi: "रोज़ाना मध्यप्रदेश, राष्ट्रीय व अंतरराष्ट्रीय करेंट अफेयर्स", en: "Daily Madhya Pradesh, national and international current affairs" },
      { hi: "हर खबर के परीक्षा-उपयोगी मुख्य तथ्य", en: "Exam-ready key facts for every story" },
      { hi: "एक-पंक्ति तथ्य + रोज़ का क्विज़", en: "One-liners + a daily quiz" },
      { hi: "हर दिन की PDF डाउनलोड", en: "PDF download for every day" },
      { hi: "पिछले दिनों का पूरा संग्रह", en: "Full archive of previous days" },
      { hi: "हिंदी और English दोनों में", en: "In Hindi and English" },
    ];
    return (
      <div className="container-page py-10 sm:py-14">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand-700">{lang === "hi" ? "MPPSC • MPESB • पुलिस • शिक्षक • हाई कोर्ट" : "MPPSC • MPESB • Police • Teacher • High Court"}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">{lang === "hi" ? "दैनिक करेंट अफेयर्स" : "Daily Current Affairs"}</h1>
            <p className="mt-3 max-w-2xl text-ink-500 sm:text-lg">
              {lang === "hi" ? "मध्यप्रदेश, भारत और दुनिया — रोज़ की ज़रूरी खबरें, परीक्षा के नज़रिए से। साथ में PDF डाउनलोड।" : "Madhya Pradesh, India and the world — the day's key news from an exam point of view, with PDF download."}
            </p>
          </div>
          <LangToggle />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl border border-ink-200 bg-surface p-6">
            {state === "expired" ? (
              <p className="mb-4 rounded-lg bg-warning-50 px-3 py-2 text-sm font-semibold text-warning-700">
                {lang === "hi" ? "आपका 30 दिन का पास समाप्त हो गया है। जारी रखने के लिए फिर से पास लें।" : "Your 30-day pass has ended. Get a new pass to continue."}
              </p>
            ) : null}
            <p className="text-sm font-bold text-brand-700">{lang === "hi" ? "30 दिन का पास" : "30-day pass"}</p>
            <p className="mt-1 text-5xl font-extrabold text-ink-900">
              ₹49<span className="ml-2 text-base font-semibold text-ink-500">{lang === "hi" ? "/ 30 दिन" : "/ 30 days"}</span>
            </p>
            <ul className="mt-5 space-y-2.5 text-[15px] text-ink-700">
              {perks.map((p) => (
                <li key={p.en} className="flex gap-2">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-success-700" aria-hidden="true" />
                  {L(p)}
                </li>
              ))}
            </ul>
            <button type="button" onClick={buy} disabled={!canBuy || payState !== "idle"} className="btn-primary mt-6 w-full text-base disabled:opacity-60">
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              {payState !== "idle" ? (lang === "hi" ? "कृपया प्रतीक्षा करें…" : "Please wait…") : canBuy ? (lang === "hi" ? "पास लें — ₹49" : "Get the pass — ₹49") : lang === "hi" ? "जल्द उपलब्ध" : "Coming soon"}
            </button>
            {payErr ? <p role="alert" className="mt-2 text-sm text-danger-700">{payErr}</p> : null}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-500">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {lang === "hi" ? "Razorpay द्वारा सुरक्षित · UPI, कार्ड, नेट बैंकिंग · कोई ऑटो-डेबिट नहीं" : "Secured by Razorpay · UPI, cards, net banking · No auto-debit"}
            </p>
            <p className="mt-4 text-center text-sm text-ink-500">
              {lang === "hi" ? "पहले पास लिया है, दूसरे फ़ोन पर हैं? " : "Already have a pass on another device? "}
              <a href={`${base}/download/`} className="font-semibold text-brand-700 underline">{lang === "hi" ? "Payment ID से खोलें" : "Unlock with Payment ID"}</a>
            </p>
          </div>

          <div className="rounded-2xl border border-ink-200 bg-surface p-6">
            <p className="flex items-center gap-2 font-bold text-ink-900">
              <CalendarDays className="h-5 w-5 text-brand-700" aria-hidden="true" />
              {lang === "hi" ? "प्रकाशित दिन" : "Published days"}
              <span className="ml-auto rounded-full bg-canvas px-2.5 py-0.5 text-xs text-ink-500">{index.length}</span>
            </p>
            <ul className="mt-4 space-y-2">
              {index.slice(0, 7).map((d) => (
                <li key={d.day} className="flex items-center justify-between rounded-xl border border-ink-200 bg-canvas px-4 py-3 text-sm">
                  <span className="font-semibold text-ink-900">{fmtDay(d.day, lang, true)}</span>
                  <span className="flex items-center gap-1.5 text-ink-500">
                    {d.items} {lang === "hi" ? "खबरें" : "stories"} <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </li>
              ))}
              {index.length === 0 ? <li className="text-sm text-ink-500">{lang === "hi" ? "पहला अंक जल्द प्रकाशित होगा।" : "The first edition is coming soon."}</li> : null}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- subscriber view ----------------
  const allItems = day?.items ?? [];
  return (
    <div className="container-page py-8 sm:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-success-700">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {lang === "hi" ? "पास सक्रिय" : "Pass active"} · {lang === "hi" ? "मान्य" : "valid till"} {expires ? fmtDay(expires.slice(0, 10), lang, false) : ""}{lang === "hi" ? " तक" : ""}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink-900">{lang === "hi" ? "दैनिक करेंट अफेयर्स" : "Daily Current Affairs"}</h1>
          {day ? <p className="mt-1 text-ink-500">{fmtDay(day.day, lang, true)}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LangToggle />
          <button type="button" onClick={downloadPdf} disabled={!day || pdfBusy} className="btn-primary disabled:opacity-60">
            <Download className="h-4 w-4" aria-hidden="true" />
            {pdfBusy ? (lang === "hi" ? "PDF बन रही है…" : "Making PDF…") : lang === "hi" ? "आज की PDF डाउनलोड" : "Download PDF"}
          </button>
        </div>
      </div>

      {/* days */}
      <div className="-mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {index.slice(0, 30).map((d) => (
          <button key={d.day} type="button" onClick={() => token && openDay(token, d.day)} aria-pressed={day?.day === d.day}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${day?.day === d.day ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 bg-surface text-ink-900 hover:border-ink-300"}`}>
            {fmtDay(d.day, lang)}
          </button>
        ))}
      </div>

      {!day ? (
        <p className="mt-10 rounded-2xl border border-ink-200 bg-surface p-8 text-center text-ink-500">{lang === "hi" ? "पहला अंक जल्द प्रकाशित होगा।" : "The first edition is coming soon."}</p>
      ) : (
        <>
          {/* regions */}
          <div className="mt-5 flex flex-wrap gap-2">
            {REGIONS.map(({ key, label, Icon }) => {
              const n = key === "all" ? allItems.length : allItems.filter((i) => i.region === key).length;
              return (
                <button key={key} type="button" onClick={() => setRegion(key)} aria-pressed={region === key}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold ${region === key ? "border-brand-700 bg-brand-50 text-brand-800" : "border-ink-200 bg-surface text-ink-700"}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {L(label)} <span className="text-xs font-normal text-ink-500">{n}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
            <ol className="space-y-4">
              {items.map((it, i) => (
                <li key={it.id} className="rounded-2xl border border-ink-200 bg-surface p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-md bg-brand-50 px-2 py-0.5 font-semibold text-brand-800">{L(REGION_LABEL[it.region])}</span>
                    <span className="rounded-md border border-ink-200 px-2 py-0.5 text-ink-500">{L(CATS[it.cat] ?? CATS.other)}</span>
                    <span className="ml-auto text-ink-500">#{i + 1}</span>
                  </div>
                  <h2 className="mt-2 text-lg leading-snug font-bold text-ink-900">{L(it.title)}</h2>
                  <p className="mt-1.5 text-[15px] text-ink-700">{L(it.summary)}</p>
                  {(it.points[lang] ?? it.points.hi)?.length ? (
                    <ul className="mt-3 space-y-1.5 rounded-xl bg-canvas p-3 text-sm text-ink-700">
                      {(it.points[lang] ?? it.points.hi).map((p) => (
                        <li key={p} className="flex gap-2">
                          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden="true" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {it.sources?.length ? (
                    <p className="mt-2 text-xs text-ink-500">
                      {lang === "hi" ? "स्रोत: " : "Source: "}
                      {it.sources.map((s, k) => (
                        <span key={s.url}>
                          {k ? ", " : ""}
                          <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">{s.name}</a>
                        </span>
                      ))}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>

            <aside className="space-y-6 lg:sticky lg:top-36 lg:self-start">
              {day.oneliners?.[lang]?.length ? (
                <section className="rounded-2xl border border-ink-200 bg-surface p-5">
                  <h2 className="font-bold text-ink-900">{lang === "hi" ? "एक-पंक्ति तथ्य" : "One-liners"}</h2>
                  <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-700">
                    {day.oneliners[lang].map((o) => <li key={o}>{o}</li>)}
                  </ol>
                </section>
              ) : null}
              {day.quiz?.length ? (
                <section className="rounded-2xl border border-ink-200 bg-surface p-5">
                  <h2 className="font-bold text-ink-900">{lang === "hi" ? "आज का क्विज़" : "Today's quiz"}</h2>
                  <ol className="mt-3 space-y-4">
                    {day.quiz.map((qz, qi) => (
                      <li key={qi} className="text-sm">
                        <p className="font-semibold text-ink-900">{qi + 1}. {L(qz.q)}</p>
                        <div className="mt-2 grid gap-1.5">
                          {(qz.o[lang] ?? qz.o.hi).map((op, oi) => {
                            const picked = shown[qi];
                            const done = picked !== undefined;
                            const cls = !done ? "border-ink-200 hover:border-ink-300" : oi === qz.a ? "border-success-700 bg-success-50 text-success-700" : oi === picked ? "border-danger-700 bg-danger-50 text-danger-700" : "border-ink-200 opacity-70";
                            return (
                              <button key={oi} type="button" disabled={done} onClick={() => setShown((m) => ({ ...m, [qi]: oi }))}
                                className={`rounded-lg border px-3 py-1.5 text-left ${cls}`}>
                                {String.fromCharCode(65 + oi)}. {op}
                              </button>
                            );
                          })}
                        </div>
                        {shown[qi] !== undefined ? <p className="mt-1.5 text-xs text-ink-500">{L(qz.exp)}</p> : null}
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}
            </aside>
          </div>

          {/* hidden print layout for the PDF */}
          <div aria-hidden="true" style={{ position: "fixed", left: -10000, top: 0, width: 734 }}>
            <div ref={printRef} style={{ width: "100%", boxSizing: "border-box", background: "#fff", color: "#14181f", fontFamily: "'Noto Sans Devanagari', 'Inter Variable', sans-serif", fontSize: 12.5, lineHeight: 1.55, padding: "6px 4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #0f766e", paddingBottom: 8, marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 20 }}>TETTEST<span style={{ color: "#0f766e" }}>HUB</span></div>
                  <div style={{ fontSize: 11, color: "#5d6672" }}>tettesthub.in · {lang === "hi" ? "दैनिक करेंट अफेयर्स" : "Daily Current Affairs"}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{fmtDay(day.day, lang, true)}</div>
              </div>
              {(["mp", "india", "world"] as const).map((rg) => {
                const list = allItems.filter((i) => i.region === rg);
                if (!list.length) return null;
                return (
                  <div key={rg} style={{ marginBottom: 10 }}>
                    <div className="ca-avoid" style={{ background: "#0f766e", color: "#fff", fontWeight: 700, padding: "4px 10px", borderRadius: 6, margin: "8px 0" }}>{L(REGION_LABEL[rg])}</div>
                    {list.map((it) => (
                      <div key={it.id} className="ca-avoid" style={{ border: "1px solid #e3e6e3", borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>
                        <div style={{ fontSize: 10.5, color: "#0f766e", fontWeight: 700 }}>{L(CATS[it.cat] ?? CATS.other)}</div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{L(it.title)}</div>
                        <div style={{ marginTop: 3 }}>{L(it.summary)}</div>
                        <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                          {(it.points[lang] ?? it.points.hi).map((p) => <li key={p}>{p}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                );
              })}
              {day.oneliners?.[lang]?.length ? (
                <div className="ca-avoid" style={{ marginTop: 10 }}>
                  <div style={{ background: "#e8a33d", color: "#2a1f08", fontWeight: 700, padding: "4px 10px", borderRadius: 6, margin: "8px 0" }}>{lang === "hi" ? "एक-पंक्ति तथ्य" : "One-liners"}</div>
                  <ol style={{ margin: 0, paddingLeft: 20 }}>{day.oneliners[lang].map((o) => <li key={o}>{o}</li>)}</ol>
                </div>
              ) : null}
              {day.quiz?.length ? (
                <div style={{ marginTop: 10 }}>
                  <div className="ca-avoid" style={{ background: "#1f2937", color: "#fff", fontWeight: 700, padding: "4px 10px", borderRadius: 6, margin: "8px 0" }}>{lang === "hi" ? "क्विज़ (उत्तर अंत में)" : "Quiz (answers at the end)"}</div>
                  {day.quiz.map((qz, qi) => (
                    <div key={qi} className="ca-avoid" style={{ marginBottom: 6 }}>
                      <b>{qi + 1}. {L(qz.q)}</b>
                      <div>{(qz.o[lang] ?? qz.o.hi).map((op, oi) => `(${String.fromCharCode(65 + oi)}) ${op}`).join("   ")}</div>
                    </div>
                  ))}
                  <div className="ca-avoid" style={{ marginTop: 6, fontSize: 11.5, color: "#374151" }}>
                    <b>{lang === "hi" ? "उत्तर: " : "Answers: "}</b>
                    {day.quiz.map((qz, qi) => `${qi + 1}-${String.fromCharCode(65 + qz.a)}`).join(", ")}
                  </div>
                </div>
              ) : null}
              <div style={{ marginTop: 14, borderTop: "1px solid #e3e6e3", paddingTop: 6, fontSize: 10, color: "#5d6672" }}>
                © TETTESTHUB · {lang === "hi" ? "केवल व्यक्तिगत अध्ययन हेतु" : "For personal study only"} · tettesthub.in
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
