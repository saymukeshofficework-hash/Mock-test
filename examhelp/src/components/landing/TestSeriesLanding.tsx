"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  FileText,
  Languages,
  ListChecks,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Smartphone,
  Timer,
  Trophy,
} from "lucide-react";
import { AG3_MOCK } from "@/data/mockTests";
import { buyNotes, checkout } from "@/lib/checkout";
import { site } from "@/lib/site";

type Lang = "hi" | "en";
type B = Record<Lang, string>;

const TOKEN_KEY = `testhub_dl_${AG3_MOCK.product}`;

const SCREENS: { src: string; cap: B }[] = [
  { src: "/samples/ag3-test-demo-1.webp", cap: { hi: "निर्देश और नाम", en: "Instructions & name" } },
  { src: "/samples/ag3-test-demo-2.webp", cap: { hi: "प्रश्न — हिंदी में", en: "Question — in Hindi" } },
  { src: "/samples/ag3-test-demo-3.webp", cap: { hi: "एक टैप में English", en: "English in one tap" } },
  { src: "/samples/ag3-test-demo-4.webp", cap: { hi: "प्रश्न पैलेट और टाइमर", en: "Question palette & timer" } },
  { src: "/samples/ag3-test-demo-5.webp", cap: { hi: "खंड-वार परिणाम", en: "Section-wise result" } },
  { src: "/samples/ag3-test-demo-6.webp", cap: { hi: "हर प्रश्न का उत्तर व व्याख्या", en: "Answer & explanation for every question" } },
];

const FEATURES: { Icon: typeof FileText; title: B; body: B }[] = [
  { Icon: ListChecks, title: { hi: "आधिकारिक पैटर्न", en: "Official pattern" }, body: { hi: "100 प्रश्न · 120 मिनट · 5 खंड × 20 — विज्ञापन 614/परीक्षा/2026 के अनुसार।", en: "100 questions · 120 min · 5 sections × 20 — as per advt. 614/Exam/2026." } },
  { Icon: FileText, title: { hi: "2,000 नए प्रश्न", en: "2,000 fresh questions" }, body: { hi: "20 फुल टेस्ट, हर टेस्ट अलग — पूरे सिलेबस से, आसान से कठिन तक।", en: "20 full tests, each one different — whole syllabus, easy to hard." } },
  { Icon: Languages, title: { hi: "हिंदी / English", en: "Hindi / English" }, body: { hi: "GK और गणित-रीज़निंग में एक टैप से भाषा बदलें — असली परीक्षा जैसा।", en: "Switch language in one tap for GK and Maths-Reasoning — just like the real exam." } },
  { Icon: Timer, title: { hi: "असली CBT जैसा अनुभव", en: "Real CBT feel" }, body: { hi: "टाइमर, प्रश्न पैलेट, Mark for Review, खंडों के बीच आना-जाना।", en: "Timer, question palette, mark for review, move between sections." } },
  { Icon: BarChart3, title: { hi: "तुरंत परिणाम", en: "Instant result" }, body: { hi: "कुल अंक, खंड-वार सही/गलत/छूटे — कमज़ोर विषय तुरंत पता चलें।", en: "Total score plus section-wise right/wrong/skipped — spot weak areas at once." } },
  { Icon: CheckCircle2, title: { hi: "हर प्रश्न की व्याख्या", en: "Explanation for every question" }, body: { hi: "सही उत्तर के साथ छोटा और साफ़ समाधान — गणित में पूरा हल।", en: "Short, clear solution with every answer — full working for maths." } },
];

const PATTERN: Record<Lang, [string, string][]> = {
  hi: [
    ["सामान्य ज्ञान + सामान्य अध्ययन (म.प्र. सहित)", "हिंदी / English"],
    ["गणित + तार्किक क्षमता", "हिंदी / English"],
    ["सामान्य हिंदी", "हिंदी"],
    ["अंग्रेज़ी ज्ञान", "English"],
    ["कंप्यूटर ज्ञान", "English"],
  ],
  en: [
    ["GK + General Studies (incl. M.P.)", "Hindi / English"],
    ["Maths + Logical Reasoning", "Hindi / English"],
    ["General Hindi", "Hindi"],
    ["English", "English"],
    ["Computer Knowledge", "English"],
  ],
};

const FAQ: { q: B; a: B }[] = [
  { q: { hi: "₹199 में क्या मिलेगा?", en: "What do I get for ₹199?" }, a: { hi: "20 फुल-लेंथ मॉक टेस्ट (2,000 प्रश्न), हर टेस्ट का परिणाम और हर प्रश्न का उत्तर-व्याख्या। टेस्ट 1 बिल्कुल फ्री है।", en: "20 full-length mock tests (2,000 questions), a result for every test and an explanation for every question. Test 1 is completely free." } },
  { q: { hi: "भुगतान के बाद टेस्ट कैसे खुलेंगे?", en: "How do the tests open after payment?" }, a: { hi: "भुगतान होते ही सभी टेस्ट इसी डिवाइस पर तुरंत अनलॉक हो जाते हैं। कोई लॉगिन नहीं चाहिए।", en: "As soon as you pay, all tests unlock instantly on this device. No login needed." } },
  { q: { hi: "दूसरे फ़ोन या कंप्यूटर पर कैसे खोलें?", en: "How do I open them on another phone or computer?" }, a: { hi: "\"डाउनलोड वापस पाएँ\" पेज पर अपना Payment ID और भुगतान वाला ईमेल/मोबाइल डालें — टेस्ट उस डिवाइस पर भी खुल जाएँगे।", en: "On the \"Recover\" page enter your Payment ID and the email/mobile used to pay — the tests open on that device too." } },
  { q: { hi: "क्या टेस्ट बार-बार दे सकते हैं?", en: "Can I retake tests?" }, a: { hi: "हाँ, हर टेस्ट जितनी बार चाहें दें। आपका सर्वश्रेष्ठ स्कोर सेव रहता है।", en: "Yes, take every test as many times as you like. Your best score is saved." } },
  { q: { hi: "क्या ऋणात्मक अंकन है?", en: "Is there negative marking?" }, a: { hi: "आधिकारिक विज्ञापन में ऋणात्मक अंकन का उल्लेख नहीं है, इसलिए इन टेस्ट में अंक नहीं कटते।", en: "The official advertisement doesn't mention negative marking, so none is applied in these tests." } },
  { q: { hi: "नोट्स भी चाहिए तो?", en: "What if I want the notes too?" }, a: { hi: "कॉम्बो लें: PDF नोट्स (हिंदी या English) + 20 मॉक टेस्ट सिर्फ़ ₹449 में — ₹49 की बचत।", en: "Take the combo: PDF notes (Hindi or English) + 20 mock tests for just ₹449 — save ₹49." } },
];

export function TestSeriesLanding() {
  const [lang, setLang] = useState<Lang>("hi");
  const [canBuy, setCanBuy] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [payState, setPayState] = useState<"creating" | "open" | "verifying" | "idle">("idle");
  const [payErr, setPayErr] = useState("");
  const [shot, setShot] = useState<number | null>(null);
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const L = (b: B) => b[lang];
  const listHref = `${base}/mp-high-court-assistant-grade-3-mock-tests/${lang === "en" ? "?lang=en" : ""}`;
  const freeHref = `${base}${AG3_MOCK.enginePath}?t=01&lang=${lang}`;
  const notesHref = `${base}/mp-high-court-assistant-grade-3-notes/${lang === "en" ? "?lang=en" : ""}#buy`;

  useEffect(() => {
    try {
      const q = new URLSearchParams(location.search).get("lang");
      const l = (q || localStorage.getItem("testhub_lang_pref")) as Lang | null;
      if (l === "en" || l === "hi") setLang(l);
      setToken(localStorage.getItem(TOKEN_KEY));
    } catch {
      /* ignore */
    }
    checkout<{ ready: boolean }>({ action: "status", product: AG3_MOCK.product })
      .then((r) => setCanBuy(!!r.ready))
      .catch(() => {});
  }, []);

  const switchLang = (l: Lang) => {
    setLang(l);
    try {
      localStorage.setItem("testhub_lang_pref", l);
      const u = new URL(location.href);
      if (l === "hi") u.searchParams.delete("lang");
      else u.searchParams.set("lang", l);
      history.replaceState(null, "", u);
    } catch {
      /* ignore */
    }
  };

  const buy = () => {
    setPayErr("");
    buyNotes(AG3_MOCK.product, {
      onState: setPayState,
      onError: (e) =>
        setPayErr(
          e.startsWith("verify:")
            ? `${lang === "hi" ? "भुगतान हो गया पर पुष्टि अटक गई। यह Payment ID संभालकर रखें:" : "Payment received but confirmation got stuck. Keep this Payment ID:"} ${e.slice(7)}`
            : lang === "hi"
              ? "भुगतान पूरा नहीं हुआ। कृपया दोबारा प्रयास करें।"
              : "Payment didn't go through. Please try again.",
        ),
      onPaid: (tk) => {
        try {
          localStorage.setItem(TOKEN_KEY, tk);
        } catch {
          /* ignore */
        }
        setToken(tk);
        window.location.href = listHref;
      },
    });
  };

  const BuyButton = ({ big = false }: { big?: boolean }) =>
    token ? (
      <a href={listHref} className={`btn-primary ${big ? "px-7 text-base" : "w-full"}`}>
        <PlayCircle className="h-4 w-4" aria-hidden="true" />
        {lang === "hi" ? "अनलॉक है — टेस्ट दें" : "Unlocked — take tests"}
      </a>
    ) : (
      <button type="button" onClick={buy} disabled={!canBuy || payState !== "idle"} className={`btn-primary disabled:opacity-60 ${big ? "px-7 text-base" : "w-full"}`}>
        <CreditCard className="h-4 w-4" aria-hidden="true" />
        {payState !== "idle"
          ? lang === "hi" ? "कृपया प्रतीक्षा करें…" : "Please wait…"
          : canBuy
            ? lang === "hi" ? "अभी खरीदें — ₹199" : "Buy now — ₹199"
            : lang === "hi" ? "जल्द उपलब्ध" : "Coming soon"}
      </button>
    );

  const Phone = ({ i, cls = "" }: { i: number; cls?: string }) => (
    <button type="button" onClick={() => setShot(i)} aria-label={L(SCREENS[i].cap)}
      className={`overflow-hidden rounded-[1.6rem] border-[6px] border-ink-900 bg-white shadow-2xl transition hover:-translate-y-1 ${cls}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${base}${SCREENS[i].src}`} alt={L(SCREENS[i].cap)} className="block w-full" />
    </button>
  );

  return (
    <div lang={lang} className="bg-canvas pb-20 lg:pb-0">
      {/* Sticky bar */}
      <div className="container-page sticky top-[5.25rem] z-40 mt-3 xl:top-[8.25rem]">
        <div className="flex h-12 items-center justify-between gap-3 rounded-xl border border-ink-200 bg-surface/95 px-3 shadow-sm backdrop-blur sm:px-4">
          <span className="truncate text-sm font-semibold text-brand-900">
            {lang === "hi" ? "AG-3 टेस्ट सीरीज़ " : "AG-3 Test Series "}
            <span className="text-accent-700">• ₹199</span>
          </span>
          <div role="group" aria-label="भाषा / Language" className="inline-flex shrink-0 rounded-lg border border-ink-200 bg-canvas p-0.5">
            {(["hi", "en"] as Lang[]).map((l) => (
              <button key={l} type="button" lang={l} aria-pressed={lang === l} onClick={() => switchLang(l)}
                className={`min-h-9 rounded-md px-3 text-sm font-semibold ${lang === l ? "bg-brand-700 text-white" : "text-ink-700 hover:bg-ink-100"}`}>
                {l === "hi" ? "हिंदी" : "English"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "22px 22px" }} aria-hidden="true" />
        <div className="container-page relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="chip bg-white/10 text-accent-100 ring-1 ring-white/20">
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
              {lang === "hi" ? "MP हाई कोर्ट सहायक ग्रेड-3 • 2026" : "MP High Court Assistant Grade-3 • 2026"}
            </p>
            <h1 className="mt-4 text-3xl leading-tight font-extrabold sm:text-4xl lg:text-5xl">
              {lang === "hi" ? "20 फुल मॉक टेस्ट — टेस्ट सीरीज़" : "20 Full Mock Tests — Test Series"}
            </h1>
            <p className="mt-4 max-w-xl text-base text-brand-100 sm:text-lg">
              {lang === "hi"
                ? "असली ऑनलाइन परीक्षा जैसा अनुभव — 100 प्रश्न, 120 मिनट, 5 खंड। हिंदी/English दोनों में, हर प्रश्न की व्याख्या के साथ।"
                : "The real online exam experience — 100 questions, 120 minutes, 5 sections. In Hindi and English, with an explanation for every question."}
            </p>
            <p className="mt-7 flex items-baseline gap-3">
              <span className="text-5xl font-extrabold sm:text-6xl">₹199</span>
              <span className="text-brand-100">{lang === "hi" ? "एक बार · 20 टेस्ट" : "one-time · 20 tests"}</span>
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <BuyButton big />
              <a href={freeHref} className="btn-ghost-light px-7 text-base">
                <PlayCircle className="h-4 w-4" aria-hidden="true" />
                {lang === "hi" ? "फ्री टेस्ट 1 दें" : "Take free Test 1"}
              </a>
            </div>
            {payErr ? <p role="alert" className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-sm text-accent-100">{payErr}</p> : null}
            <p className="mt-5 text-sm text-brand-100">
              {lang === "hi" ? "तुरंत अनलॉक" : "Instant unlock"} <span className="text-accent-500">•</span>{" "}
              {lang === "hi" ? "सुरक्षित Razorpay भुगतान" : "Secure Razorpay payment"} <span className="text-accent-500">•</span>{" "}
              {lang === "hi" ? "मोबाइल पर चलता है" : "Works on mobile"}
            </p>
            <a href="#demo" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-100 underline-offset-4 hover:underline">
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              {lang === "hi" ? "टेस्ट स्क्रीन का डेमो देखें" : "See the test screens"}
            </a>
          </div>

          <div className="relative mx-auto h-[420px] w-full max-w-[440px] sm:h-[480px]">
            <Phone i={4} cls="absolute left-0 top-10 w-[46%] -rotate-[7deg]" />
            <Phone i={2} cls="absolute right-0 top-4 w-[46%] rotate-[6deg]" />
            <Phone i={1} cls="absolute left-1/2 top-0 z-10 w-[50%] -translate-x-1/2" />
            <span className="absolute bottom-0 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-sm font-bold text-ink-900 shadow-lg">
              {lang === "hi" ? "20 टेस्ट · 2,000 प्रश्न" : "20 tests · 2,000 questions"}
            </span>
          </div>
        </div>
      </section>

      {/* Demo screens */}
      <section id="demo" className="section scroll-mt-48 bg-surface" aria-labelledby="demo-h">
        <div className="container-page">
          <h2 id="demo-h" className="text-2xl font-bold text-brand-900 sm:text-3xl">
            {lang === "hi" ? "टेस्ट स्क्रीन का डेमो" : "Demo of the test screens"}
          </h2>
          <p className="mt-2 text-ink-500">
            {lang === "hi" ? "असली टेस्ट की स्क्रीन — बड़ा देखने के लिए किसी पर टैप करें।" : "Real screens from the test — tap one to enlarge."}
          </p>
          <ul className="mt-6 flex snap-x gap-5 overflow-x-auto pb-4">
            {SCREENS.map((s, i) => (
              <li key={s.src} className="w-[56%] shrink-0 snap-start sm:w-[30%] lg:w-[15.5%]">
                <Phone i={i} cls="w-full" />
                <p className="mt-2 text-center text-sm font-semibold text-ink-700">{L(s.cap)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a href={freeHref} className="btn-outline">
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
              {lang === "hi" ? "खुद आज़माएँ — फ्री टेस्ट 1" : "Try it yourself — free Test 1"}
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" aria-labelledby="feat-h">
        <div className="container-page">
          <h2 id="feat-h" className="text-2xl font-bold text-brand-900 sm:text-3xl">{lang === "hi" ? "टेस्ट सीरीज़ में क्या मिलेगा" : "What you get"}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ Icon, title, body }) => (
              <li key={title.en} className="card p-5">
                <Icon className="h-6 w-6 text-accent-600" aria-hidden="true" />
                <h3 className="mt-3 font-bold text-ink-900">{L(title)}</h3>
                <p className="mt-1 text-sm text-ink-600">{L(body)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pattern */}
      <section className="section bg-surface" aria-labelledby="pat-h">
        <div className="container-page">
          <h2 id="pat-h" className="text-2xl font-bold text-brand-900 sm:text-3xl">{lang === "hi" ? "हर टेस्ट का पैटर्न" : "Pattern of every test"}</h2>
          <div className="card mt-6 overflow-x-auto p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-500">
                  <th className="py-2 pr-3">{lang === "hi" ? "खंड" : "Section"}</th>
                  <th className="px-3 py-2">{lang === "hi" ? "प्रश्न" : "Qs"}</th>
                  <th className="py-2 pl-3">{lang === "hi" ? "भाषा" : "Language"}</th>
                </tr>
              </thead>
              <tbody>
                {PATTERN[lang].map(([a, c]) => (
                  <tr key={a} className="border-t border-ink-100">
                    <td className="py-2 pr-3 font-medium text-ink-900">{a}</td>
                    <td className="px-3 py-2">20</td>
                    <td className="py-2 pl-3 text-ink-600">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink-800">
              <Clock className="h-4 w-4 text-brand-600" aria-hidden="true" />
              {lang === "hi" ? "कुल 100 प्रश्न · 100 अंक · 120 मिनट · कोई ऋणात्मक अंकन नहीं" : "Total 100 questions · 100 marks · 120 minutes · no negative marking"}
            </p>
          </div>
        </div>
      </section>

      {/* Buy box */}
      <section id="buy" className="section scroll-mt-48" aria-labelledby="buy-h">
        <div className="container-page">
          <h2 id="buy-h" className="text-2xl font-bold text-brand-900 sm:text-3xl">{lang === "hi" ? "अपना प्लान चुनें" : "Choose your plan"}</h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="card border-2 border-brand-700 p-6">
              <p className="text-sm font-bold text-brand-700">{lang === "hi" ? "टेस्ट सीरीज़" : "Test series"}</p>
              <p className="mt-2 text-4xl font-extrabold text-ink-900">₹199</p>
              <ul className="mt-4 space-y-2 text-sm text-ink-700">
                {[
                  { hi: "20 फुल मॉक टेस्ट (2,000 प्रश्न)", en: "20 full mock tests (2,000 questions)" },
                  { hi: "हिंदी / English टॉगल", en: "Hindi / English toggle" },
                  { hi: "परिणाम + हर प्रश्न की व्याख्या", en: "Result + explanation for every question" },
                  { hi: "जितनी बार चाहें दोबारा दें", en: "Retake as often as you like" },
                ].map((x) => (
                  <li key={x.en} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-success-700" aria-hidden="true" />{L(x)}</li>
                ))}
              </ul>
              <div className="mt-6"><BuyButton /></div>
              {payErr ? <p role="alert" className="mt-2 text-sm text-danger-700">{payErr}</p> : null}
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-500">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {lang === "hi" ? "Razorpay द्वारा सुरक्षित · UPI, कार्ड, नेट बैंकिंग" : "Secured by Razorpay · UPI, cards, net banking"}
              </p>
            </div>
            <div className="card relative bg-accent-50 p-6 ring-1 ring-accent-100">
              <span className="absolute right-4 top-4 rounded-full bg-accent-500 px-3 py-1 text-xs font-bold text-white">{lang === "hi" ? "₹49 की बचत" : "Save ₹49"}</span>
              <p className="text-sm font-bold text-accent-700">{lang === "hi" ? "कॉम्बो" : "Combo"}</p>
              <p className="mt-2 text-4xl font-extrabold text-ink-900">
                ₹449 <span className="text-lg font-semibold text-ink-400 line-through">₹498</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-ink-700">
                {[
                  { hi: "संपूर्ण PDF नोट्स (हिंदी या English)", en: "Complete PDF notes (Hindi or English)" },
                  { hi: "+ पूरी 20 टेस्ट सीरीज़", en: "+ the full 20-test series" },
                  { hi: "पढ़ें, फिर टेस्ट से जाँचें", en: "Study, then check yourself with tests" },
                ].map((x) => (
                  <li key={x.en} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-success-700" aria-hidden="true" />{L(x)}</li>
                ))}
              </ul>
              <a href={notesHref} className="btn-outline mt-6 w-full">{lang === "hi" ? "कॉम्बो लें — ₹449" : "Get the combo — ₹449"}</a>
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-600">
            {lang === "hi" ? "पहले खरीदा है, दूसरे डिवाइस पर खोलना है? " : "Bought already and on another device? "}
            <a href={`${base}/download/`} className="font-semibold text-brand-700 underline">{lang === "hi" ? "Payment ID से अनलॉक करें" : "Unlock with your Payment ID"}</a>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-surface" aria-labelledby="faq-h">
        <div className="container-page max-w-3xl">
          <h2 id="faq-h" className="text-2xl font-bold text-brand-900 sm:text-3xl">{lang === "hi" ? "अक्सर पूछे जाने वाले प्रश्न" : "FAQ"}</h2>
          <div className="mt-6 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q.en} className="card group p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-ink-900">
                  {L(f.q)}
                  <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="mt-2 text-sm text-ink-600">{L(f.a)}</p>
              </details>
            ))}
          </div>
          {site.contact.whatsapp ? (
            <a href={`${site.contact.whatsapp}?text=${encodeURIComponent("TETTESTHUB AG-3 test series")}`} className="mt-6 inline-flex items-center gap-2 font-semibold text-success-700">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {lang === "hi" ? "कोई समस्या? WhatsApp पर संपर्क करें" : "Any issue? Chat with us on WhatsApp"}
            </a>
          ) : null}
          <p className="mt-8 text-xs text-ink-500">
            {lang === "hi"
              ? "TETTESTHUB एक स्वतंत्र शैक्षिक प्लेटफ़ॉर्म है और मध्यप्रदेश उच्च न्यायालय से संबद्ध नहीं है।"
              : "TETTESTHUB is an independent educational platform and is not affiliated with the High Court of Madhya Pradesh."}
          </p>
        </div>
      </section>

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-[64px] z-40 border-t border-ink-200 bg-surface/95 p-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <p className="shrink-0 text-lg font-extrabold text-ink-900">₹199</p>
          <div className="flex-1"><BuyButton /></div>
        </div>
      </div>

      {shot !== null ? (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-3" onClick={() => setShot(null)}>
          <div className="relative max-h-full w-full max-w-sm overflow-auto rounded-2xl bg-white" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${base}${SCREENS[shot].src}`} alt={L(SCREENS[shot].cap)} className="w-full" />
          </div>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-ink-900">{L(SCREENS[shot].cap)}</p>
          <button type="button" aria-label="Close" onClick={() => setShot(null)} className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-sm font-bold text-ink-900">✕</button>
          {shot > 0 ? <button type="button" aria-label="Previous" onClick={(e) => { e.stopPropagation(); setShot(shot - 1); }} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-lg font-bold text-ink-900">‹</button> : null}
          {shot < SCREENS.length - 1 ? <button type="button" aria-label="Next" onClick={(e) => { e.stopPropagation(); setShot(shot + 1); }} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-lg font-bold text-ink-900">›</button> : null}
        </div>
      ) : null}
    </div>
  );
}
