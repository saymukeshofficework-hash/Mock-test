"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  IndianRupee,
  Languages,
  Scale,
  Share2,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import { formatExamDate } from "@/lib/dates";
import { buyNotes, checkout, downloadPath } from "@/lib/checkout";
import { formatINR } from "@/lib/format";
import type { Bilingual, Exam, ExamDate, Lang, NoteProduct } from "@/types";

/**
 * Shareable sales landing page for MP High Court Assistant Grade-3 notes.
 * Language is switched in the browser (works on static hosting too) and can
 * be preset with ?lang=en so an English link can be shared directly.
 */

type T = Bilingual;
const t = (b: T, l: Lang) => b[l];

const copy = {
  badge: { hi: "MP हाई कोर्ट • जिला न्यायालय भर्ती 2026", en: "MP High Court • District Court Recruitment 2026" },
  title: { hi: "सहायक ग्रेड-3 परीक्षा 2026 — संपूर्ण नोट्स", en: "Assistant Grade-3 Exam 2026 — Complete Notes" },
  subtitle: {
    hi: "1174 पदों की भर्ती के लिए परीक्षा-केंद्रित PDF नोट्स — हिंदी और English दोनों में, केवल ₹299 में।",
    en: "Exam-focused PDF notes for the 1174-post recruitment — in Hindi and English, just ₹299.",
  },
  preparing: { hi: "नोट्स तैयार हो रहे हैं — जल्द उपलब्ध", en: "Notes are being prepared — available soon" },
  chooseLang: { hi: "अपनी भाषा चुनें", en: "Choose your language" },
  hindiPdf: { hi: "हिंदी PDF", en: "Hindi PDF" },
  englishPdf: { hi: "English PDF", en: "English PDF" },
  buy: { hi: "अभी खरीदें", en: "Buy now" },
  notify: { hi: "उपलब्ध होने पर सूचना पाएँ", en: "Notify me when available" },
  comingSoon: { hi: "जल्द उपलब्ध", en: "Coming soon" },
  readySoon: { hi: "PDF तैयार — ऑनलाइन भुगतान जल्द शुरू", en: "PDF ready — online payment opens soon" },
  availableNow: { hi: "अभी उपलब्ध — भुगतान के बाद तुरंत डाउनलोड", en: "Available now — instant download after payment" },
  wait: { hi: "कृपया प्रतीक्षा करें…", en: "Please wait…" },
  instant: { hi: "भुगतान के तुरंत बाद PDF डाउनलोड करें — कोई ईमेल इंतज़ार नहीं।", en: "Download the PDF right after payment — no waiting for email." },
  alreadyBought: { hi: "पहले खरीदा है? अपना PDF डाउनलोड करें", en: "Already bought? Download your PDF" },
  payFailed: { hi: "भुगतान पूरा नहीं हुआ। कृपया दोबारा प्रयास करें।", en: "Payment didn't go through. Please try again." },
  payNet: { hi: "कनेक्शन में समस्या। कृपया दोबारा प्रयास करें।", en: "Connection problem. Please try again." },
  payVerify: { hi: "भुगतान हो गया पर पुष्टि अटक गई। Payment ID संभालकर रखें और \"डाउनलोड वापस पाएँ\" पेज पर जाएँ:", en: "Payment received but confirmation got stuck. Keep your Payment ID and use the \"Recover download\" page:" },
  perPdf: { hi: "प्रति PDF", en: "per PDF" },
  secure: { hi: "Razorpay द्वारा सुरक्षित भुगतान", en: "Secure payment by Razorpay" },
  payMethods: { hi: "UPI • डेबिट/क्रेडिट कार्ड • नेट बैंकिंग • वॉलेट", en: "UPI • Debit/Credit card • Net banking • Wallets" },
  factsTitle: { hi: "परीक्षा एक नज़र में", en: "Exam at a glance" },
  posts: { hi: "कुल पद", en: "Total posts" },
  pay: { hi: "वेतनमान (7वाँ वेतनमान)", en: "Pay (7th Pay Commission)" },
  payValue: { hi: "पे-मैट्रिक्स ₹19,500–62,000", en: "Pay matrix ₹19,500–62,000" },
  mode: { hi: "चयन का पहला चरण", en: "First stage" },
  modeValue: { hi: "ऑनलाइन प्रारंभिक परीक्षा", en: "Online preliminary exam" },
  examDate: { hi: "परीक्षा तिथि", en: "Exam date" },
  tba: { hi: "बाद में अधिसूचित होगी", en: "To be notified later" },
  datesTitle: { hi: "महत्वपूर्ण तिथियाँ", en: "Important dates" },
  appStart: { hi: "ऑनलाइन आवेदन शुरू", en: "Online application opened" },
  appEnd: { hi: "आवेदन की अंतिम तिथि (बढ़ाई गई)", en: "Last date to apply (extended)" },
  correction: { hi: "आवेदन में त्रुटि सुधार", en: "Application correction window" },
  correctionValue: { hi: "6 – 8 अक्टूबर 2026", en: "6 – 8 October 2026" },
  prelim: { hi: "ऑनलाइन प्रारंभिक परीक्षा", en: "Online preliminary exam" },
  source: { hi: "स्रोत: मध्यप्रदेश उच्च न्यायालय का आधिकारिक विज्ञापन (14.08.2026) एवं तिथि-विस्तार सूचना (15.09.2026)", en: "Source: High Court of MP official advertisement (14.08.2026) and date-extension notice (15.09.2026)" },
  officialAdvt: { hi: "आधिकारिक विज्ञापन देखें", en: "View official advertisement" },
  whyTitle: { hi: "इन नोट्स में क्या मिलेगा", en: "What you get" },
  why: [
    { icon: FileText, title: { hi: "परीक्षा-केंद्रित PDF", en: "Exam-focused PDF" }, body: { hi: "सिर्फ़ वही जो इस परीक्षा के लिए ज़रूरी है — सीधी और साफ़ भाषा में।", en: "Only what this exam needs — clear and to the point." } },
    { icon: Languages, title: { hi: "हिंदी और English", en: "Hindi & English" }, body: { hi: "अपनी पसंद की भाषा चुनें — दोनों के अलग PDF।", en: "Pick your language — separate PDFs for each." } },
    { icon: Smartphone, title: { hi: "मोबाइल पर पढ़ें", en: "Read on mobile" }, body: { hi: "फ़ोन, टैबलेट या कंप्यूटर — कहीं भी पढ़ें, प्रिंट भी कर सकते हैं।", en: "Phone, tablet or computer — read anywhere, print if you like." } },
    { icon: IndianRupee, title: { hi: "सिर्फ़ ₹299", en: "Just ₹299" }, body: { hi: "एक बार भुगतान, कोई छुपा शुल्क नहीं।", en: "One-time payment, no hidden charges." } },
  ],
  topicsTitle: { hi: "शामिल विषय", en: "Topics covered" },
  topicsPending: { hi: "विषय-सूची नोट्स जारी होने के साथ यहाँ जोड़ी जाएगी।", en: "The topic list will be added here when the notes are released." },
  howTitle: { hi: "कैसे खरीदें", en: "How to buy" },
  how: [
    { icon: Languages, title: { hi: "भाषा चुनें", en: "Choose language" }, body: { hi: "सबसे ऊपर \"हिंदी\" या \"English\" चुनें — उसी भाषा की PDF मिलेगी।", en: "Pick \"हिंदी\" or \"English\" at the top — you get the PDF in that language." } },
    { icon: CreditCard, title: { hi: "₹299 का भुगतान करें", en: "Pay ₹299" }, body: { hi: "Razorpay पर UPI, कार्ड या नेट बैंकिंग से।", en: "On Razorpay via UPI, card or net banking." } },
    { icon: Download, title: { hi: "PDF प्राप्त करें", en: "Get your PDF" }, body: { hi: "भुगतान के बाद PDF आपको भेज दी जाएगी।", en: "Your PDF is sent to you after payment." } },
  ],
  faqTitle: { hi: "अक्सर पूछे जाने वाले प्रश्न", en: "Frequently asked questions" },
  faqs: [
    { q: { hi: "नोट्स की कीमत कितनी है?", en: "How much do the notes cost?" }, a: { hi: "हिंदी PDF और English PDF — दोनों ₹299 प्रत्येक।", en: "Hindi PDF and English PDF — ₹299 each." } },
    { q: { hi: "नोट्स कब उपलब्ध होंगे?", en: "When will the notes be available?" }, a: { hi: "नोट्स अभी तैयार हो रहे हैं। उपलब्ध होते ही इसी पेज पर \"अभी खरीदें\" बटन चालू हो जाएगा।", en: "The notes are being prepared. As soon as they're ready, the \"Buy now\" button on this page goes live." } },
    { q: { hi: "भुगतान कैसे करें?", en: "How do I pay?" }, a: { hi: "भुगतान Razorpay से होगा — UPI, डेबिट/क्रेडिट कार्ड, नेट बैंकिंग या वॉलेट से।", en: "Payment is through Razorpay — UPI, debit/credit card, net banking or wallets." } },
    { q: { hi: "क्या दोनों भाषाओं के नोट्स एक जैसे हैं?", en: "Are the Hindi and English notes the same?" }, a: { hi: "हाँ, विषय-वस्तु एक ही है — सिर्फ़ भाषा अलग है। अपनी परीक्षा की भाषा के अनुसार चुनें।", en: "Yes, the content is the same — only the language differs. Choose the language you'll write the exam in." } },
    { q: { hi: "परीक्षा तिथि कब घोषित होगी?", en: "When will the exam date be announced?" }, a: { hi: "आधिकारिक विज्ञापन के अनुसार प्रारंभिक परीक्षा की तिथि बाद में अधिसूचित की जाएगी। तिथि आते ही यहाँ अपडेट होगी।", en: "Per the official advertisement, the preliminary exam date will be notified later. We'll update it here as soon as it's out." } },
  ],
  shareTitle: { hi: "दोस्तों के साथ शेयर करें", en: "Share with friends" },
  shareText: { hi: "MP हाई कोर्ट सहायक ग्रेड-3 (1174 पद) — हिंदी/English PDF नोट्स सिर्फ़ ₹299 में:", en: "MP High Court Assistant Grade-3 (1174 posts) — Hindi/English PDF notes for just ₹299:" },
  copy: { hi: "लिंक कॉपी करें", en: "Copy link" },
  copied: { hi: "कॉपी हो गया!", en: "Copied!" },
  more: { hi: "और", en: "More" },
  examPage: { hi: "परीक्षा की पूरी जानकारी देखें", en: "See full exam details" },
  disclaimer: {
    hi: "TETTESTHUB एक स्वतंत्र शैक्षिक प्लेटफ़ॉर्म है और मध्यप्रदेश उच्च न्यायालय से संबद्ध नहीं है। परीक्षा संबंधी हर जानकारी की पुष्टि आधिकारिक वेबसाइट mphc.gov.in से करें।",
    en: "TETTESTHUB is an independent educational platform and is not affiliated with the High Court of Madhya Pradesh. Verify all exam information on the official website mphc.gov.in.",
  },
};

/** Official prelim subjects (advt. 614/Exam/2026, p.13) with commonly asked sub-topics. */
const syllabus: { name: T; short: T; medium: T; topics: T[] }[] = [
  {
    name: { hi: "सामान्य ज्ञान + सामान्य अध्ययन (म.प्र. GK सहित)", en: "G.K. + G.S. (including G.K. of M.P.)" },
    short: { hi: "सामान्य ज्ञान + सामान्य अध्ययन (म.प्र. सहित)", en: "G.K. + G.S. incl. M.P." },
    medium: { hi: "हिंदी व English", en: "Hindi & English" },
    topics: [
      { hi: "मध्यप्रदेश सामान्य ज्ञान", en: "Madhya Pradesh GK" },
      { hi: "भारतीय इतिहास", en: "Indian History" },
      { hi: "भारत का भूगोल", en: "Indian Geography" },
      { hi: "भारतीय राजव्यवस्था", en: "Indian Polity" },
      { hi: "सामान्य विज्ञान", en: "General Science" },
      { hi: "समसामयिक घटनाएँ", en: "Current Affairs" },
    ],
  },
  {
    name: { hi: "गणित + तार्किक क्षमता", en: "Maths + Logical Reasoning" },
    short: { hi: "गणित + तार्किक क्षमता", en: "Maths + Logical Reasoning" },
    medium: { hi: "हिंदी व English", en: "Hindi & English" },
    topics: [
      { hi: "संख्या पद्धति", en: "Number System" },
      { hi: "प्रतिशत, औसत", en: "Percentage, Average" },
      { hi: "अनुपात-समानुपात", en: "Ratio & Proportion" },
      { hi: "लाभ-हानि, ब्याज", en: "Profit & Loss, Interest" },
      { hi: "समय-कार्य, चाल-दूरी", en: "Time & Work, Speed & Distance" },
      { hi: "श्रेणी, कोडिंग-डिकोडिंग", en: "Series, Coding-Decoding" },
      { hi: "रक्त संबंध, दिशा", en: "Blood Relations, Directions" },
    ],
  },
  {
    name: { hi: "सामान्य हिंदी", en: "General Hindi" },
    short: { hi: "सामान्य हिंदी", en: "General Hindi" },
    medium: { hi: "हिंदी", en: "Hindi" },
    topics: [
      { hi: "संधि, समास", en: "Sandhi, Samas" },
      { hi: "पर्यायवाची, विलोम", en: "Synonyms, Antonyms (Hindi)" },
      { hi: "वाक्यांश के लिए एक शब्द", en: "One-word substitution (Hindi)" },
      { hi: "मुहावरे, लोकोक्तियाँ", en: "Idioms & Proverbs (Hindi)" },
      { hi: "वाक्य शुद्धि", en: "Sentence correction (Hindi)" },
      { hi: "संज्ञा, सर्वनाम, विशेषण, क्रिया", en: "Parts of speech (Hindi)" },
    ],
  },
  {
    name: { hi: "अंग्रेज़ी ज्ञान", en: "English Knowledge" },
    short: { hi: "अंग्रेज़ी", en: "English" },
    medium: { hi: "English", en: "English" },
    topics: [
      { hi: "Parts of Speech, Tenses", en: "Parts of Speech, Tenses" },
      { hi: "Articles, Prepositions", en: "Articles, Prepositions" },
      { hi: "Synonyms, Antonyms", en: "Synonyms, Antonyms" },
      { hi: "One Word Substitution", en: "One Word Substitution" },
      { hi: "Active-Passive, Direct-Indirect", en: "Active-Passive, Direct-Indirect" },
      { hi: "Error Detection, Fill in the Blanks", en: "Error Detection, Fill in the Blanks" },
    ],
  },
  {
    name: { hi: "कंप्यूटर ज्ञान", en: "Computer Knowledge" },
    short: { hi: "कंप्यूटर", en: "Computer" },
    medium: { hi: "English", en: "English" },
    topics: [
      { hi: "कंप्यूटर के मूल सिद्धांत", en: "Computer Fundamentals" },
      { hi: "हार्डवेयर, सॉफ्टवेयर, OS", en: "Hardware, Software, OS" },
      { hi: "MS Word, Excel, PowerPoint", en: "MS Word, Excel, PowerPoint" },
      { hi: "इंटरनेट, ईमेल, नेटवर्क", en: "Internet, Email, Networking" },
      { hi: "साइबर सुरक्षा", en: "Cyber Security" },
      { hi: "कीबोर्ड शॉर्टकट", en: "Keyboard Shortcuts" },
    ],
  },
];

export function AG3Landing({
  exam,
  notes,
  initialLang,
  notifyHref,
}: {
  exam: Exam;
  notes: { hi?: NoteProduct; en?: NoteProduct };
  initialLang: Lang;
  notifyHref: string;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [demoIdx, setDemoIdx] = useState<number | null>(null);
  const [payReady, setPayReady] = useState<Record<string, boolean>>({});
  const [payState, setPayState] = useState<"creating" | "open" | "verifying" | "idle">("idle");
  const [payError, setPayError] = useState("");
  const [ownedToken, setOwnedToken] = useState<Record<string, string | null>>({});

  // Is secure checkout live for these products? (server answers; no redeploy needed once keys are added)
  useEffect(() => {
    const products = [notes.hi?.checkoutProduct, notes.en?.checkoutProduct, notes.hi?.comboProduct, notes.en?.comboProduct].filter(Boolean) as string[];
    products.forEach((p) => {
      checkout<{ ready: boolean }>({ action: "status", product: p })
        .then((r) => setPayReady((m) => ({ ...m, [p]: !!r.ready })))
        .catch(() => {});
      try {
        const tok = localStorage.getItem(`testhub_dl_${p}`);
        if (tok) setOwnedToken((m) => ({ ...m, [p]: tok }));
      } catch {
        /* ignore */
      }
    });
  }, [notes.hi?.checkoutProduct, notes.en?.checkoutProduct, notes.hi?.comboProduct, notes.en?.comboProduct]);

  const startBuy = (product: string) => {
    setPayError("");
    buyNotes(product, {
      onState: setPayState,
      onError: (e) => {
        if (e === "failed") setPayError(t(copy.payFailed, lang));
        else if (e.startsWith("verify:")) setPayError(`${t(copy.payVerify, lang)} ${e.slice(7)}`);
        else setPayError(t(copy.payNet, lang));
      },
    });
  };

  // ?lang=en / ?lang=hi preset (read on the client so the page stays static).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "en" || q === "hi") setLang(q);
    setUrl(window.location.href.split("#")[0]);
  }, []);

  const switchLang = (l: Lang) => {
    setLang(l);
    document.documentElement.lang = l;
    const u = new URL(window.location.href);
    if (l === "hi") u.searchParams.delete("lang");
    else u.searchParams.set("lang", l);
    window.history.replaceState(null, "", u);
    setUrl(u.href.split("#")[0]);
  };

  const shareMsg = `${t(copy.shareText, lang)} ${url}`;
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: ignore */
    }
  };
  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: t(copy.title, lang), text: t(copy.shareText, lang), url });
      } catch {
        /* cancelled */
      }
    } else doCopy();
  };

  const d = exam.dates;
  const fmt = (x?: ExamDate) => formatExamDate(x, lang) ?? t(copy.tba, lang);

  return (
    <div lang={lang} className="bg-canvas">
      {/* Sticky language bar */}
      <div className="container-page sticky top-[5.25rem] z-40 mt-3 xl:top-[8.25rem]">
        <div className="flex h-12 items-center justify-between gap-3 rounded-xl border border-ink-200 bg-surface/95 px-3 shadow-sm backdrop-blur sm:px-4">
          <span className="flex min-w-0 items-center gap-2 truncate text-sm font-semibold text-brand-900">
            <Scale className="h-4 w-4 shrink-0 text-accent-600" aria-hidden="true" />
            <span className="truncate">
              {lang === "hi" ? "नोट्स: " : "Notes: "}
              <span className="text-accent-700">{lang === "hi" ? "हिंदी PDF" : "English PDF"}</span>
              <span className="hidden sm:inline"> • ₹299</span>
            </span>
          </span>
          <div role="group" aria-label="भाषा / Language" className="inline-flex shrink-0 rounded-lg border border-ink-200 bg-canvas p-0.5">
            {(["hi", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                lang={l}
                aria-pressed={lang === l}
                onClick={() => switchLang(l)}
                className={`min-h-9 rounded-md px-3 text-sm font-semibold transition-colors ${lang === l ? "bg-brand-700 text-white" : "text-ink-700 hover:bg-ink-100"}`}
              >
                {l === "hi" ? "हिंदी" : "English"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "22px 22px" }}
          aria-hidden="true"
        />
        <div className="container-page relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="chip bg-white/10 text-accent-100 ring-1 ring-white/20">
              <Scale className="h-3.5 w-3.5" aria-hidden="true" />
              {t(copy.badge, lang)}
            </p>
            <h1 className="mt-4 text-3xl leading-tight font-extrabold sm:text-4xl lg:text-5xl">{t(copy.title, lang)}</h1>
            <p className="mt-4 max-w-xl text-base text-brand-100 sm:text-lg">{t(copy.subtitle, lang)}</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-500/15 px-4 py-2 text-sm font-semibold text-accent-100 ring-1 ring-accent-500/40">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent-500" aria-hidden="true" />
              {(() => {
                const n = lang === "hi" ? notes.hi : notes.en;
                if (n?.checkoutProduct && payReady[n.checkoutProduct]) return t(copy.availableNow, lang);
                return t(n?.pages ? copy.readySoon : copy.preparing, lang);
              })()}
            </div>
            {(() => {
              const n = lang === "hi" ? notes.hi : notes.en;
              const demo = n?.samplePages ?? [];
              return (
                <>
                  <p className="mt-7 flex items-baseline gap-3">
                    <span className="text-5xl font-extrabold sm:text-6xl">₹299</span>
                    <span className="text-brand-100">{lang === "hi" ? "एक बार का भुगतान · PDF" : "one-time payment · PDF"}</span>
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <a href="#buy" className="btn-primary px-7 text-base">
                      {lang === "hi" ? "अभी खरीदें — ₹299" : "Buy now — ₹299"}
                    </a>
                    {demo.length ? (
                      <button type="button" onClick={() => setDemoIdx(0)} className="btn-ghost-light px-7 text-base">
                        <BookOpen className="h-4 w-4" aria-hidden="true" />
                        {lang === "hi" ? "सैंपल पेज देखें" : "See sample pages"}
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-5 text-sm text-brand-100">
                    {lang === "hi" ? "तुरंत डिजिटल एक्सेस" : "Instant digital access"} <span className="text-accent-500">•</span>{" "}
                    {lang === "hi" ? "सुरक्षित Razorpay भुगतान" : "Secure Razorpay payment"} <span className="text-accent-500">•</span> {lang === "hi" ? "PDF नोट्स" : "PDF notes"}
                  </p>
                  {n?.comboProduct && payReady[n.comboProduct] ? (
                    <a href="#buy" className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-500 px-4 py-1.5 text-sm font-bold text-white shadow">
                      {lang === "hi" ? "कॉम्बो: नोट्स + 20 मॉक टेस्ट सिर्फ़ ₹449" : "Combo: notes + 20 mock tests just ₹449"}
                    </a>
                  ) : null}
                  <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
                    <Link href={`/mp-high-court-assistant-grade-3-test-series${lang === "en" ? "?lang=en" : ""}`} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-brand-900 shadow hover:bg-accent-50">
                      <FileText className="h-4 w-4 text-accent-600" aria-hidden="true" />
                      {lang === "hi" ? "टेस्ट सीरीज़: 20 मॉक टेस्ट — ₹199" : "Test series: 20 mock tests — ₹199"}
                    </Link>
                    <a href="#share" className="inline-flex items-center gap-1.5 text-accent-100 underline-offset-4 hover:underline">
                      <Share2 className="h-4 w-4" aria-hidden="true" />
                      {t(copy.shareTitle, lang)}
                    </a>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Fanned sample pages (like a stack of notes) */}
          {(() => {
            const n = lang === "hi" ? notes.hi : notes.en;
            const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
            const demo = n?.samplePages ?? [];
            if (demo.length < 3) return null;
            const fan = [
              { i: 1, cls: "left-[2%] top-[10%] -rotate-[8deg]" },
              { i: 2, cls: "right-[2%] top-[4%] rotate-[7deg]" },
              { i: 0, cls: "left-1/2 top-[14%] -translate-x-1/2 z-10" },
            ];
            return (
              <div className="relative mx-auto h-[360px] w-full max-w-[460px] sm:h-[420px]">
                {fan.map(({ i, cls }) => (
                  <button key={i} type="button" onClick={() => setDemoIdx(i)} aria-label={`${lang === "hi" ? "सैंपल पेज" : "Sample page"} ${i + 1}`}
                    className={`absolute w-[58%] overflow-hidden rounded-md bg-white shadow-2xl ring-1 ring-black/10 transition hover:-translate-y-1 ${cls}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${base}${demo[i]}`} alt="" className="w-full" />
                  </button>
                ))}
                <span className="absolute bottom-0 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-sm font-bold text-ink-900 shadow-lg">
                  {lang === "hi" ? `${n?.chapters?.length ?? 18} अध्याय · ${n?.pages ?? ""} पेज` : `${n?.chapters?.length ?? 18} chapters · ${n?.pages ?? ""} pages`}
                </span>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Facts */}
      {/* Demo pages of the notes (current language) */}
      {(() => {
        const note = lang === "hi" ? notes.hi : notes.en;
        if (!note?.samplePages.length) return null;
        const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
        const pages = note.samplePages;
        return (
          <section id="demo" className="section scroll-mt-48 bg-surface" aria-labelledby="demo-h">
            <div className="container-page">
              <h2 id="demo-h" className="text-2xl font-bold text-brand-900 sm:text-3xl">
                {lang === "hi" ? "नोट्स के डेमो पेज देखें" : "See demo pages of the notes"}
              </h2>
              <p className="mt-2 text-ink-500">
                {lang === "hi" ? "खरीदने से पहले असली PDF के पेज देखें — बड़ा देखने के लिए किसी पेज पर टैप करें।" : "Preview real pages from the PDF before you buy — tap a page to enlarge."}
              </p>
              <ul className="mt-6 flex snap-x gap-4 overflow-x-auto pb-3">
                {pages.map((src, i) => (
                  <li key={src} className="w-[62%] shrink-0 snap-start sm:w-[30%] lg:w-[18%]">
                    <button type="button" onClick={() => setDemoIdx(i)} className="block w-full overflow-hidden rounded-lg border border-ink-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`${base}${src}`} alt={`${lang === "hi" ? "डेमो पेज" : "Demo page"} ${i + 1}`} loading="lazy" className="w-full" />
                    </button>
                  </li>
                ))}
              </ul>
              {demoIdx !== null ? (
                <div role="dialog" aria-modal="true" aria-label={lang === "hi" ? "डेमो पेज" : "Demo page"} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-3" onClick={() => setDemoIdx(null)}>
                  <div className="relative max-h-full max-w-3xl overflow-auto rounded-lg bg-white" onClick={(e) => e.stopPropagation()}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${base}${pages[demoIdx]}`} alt={`${lang === "hi" ? "डेमो पेज" : "Demo page"} ${demoIdx + 1}`} className="w-full" />
                  </div>
                  <button type="button" aria-label="Close" onClick={() => setDemoIdx(null)} className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-sm font-bold text-ink-900">✕</button>
                  {demoIdx > 0 ? <button type="button" aria-label="Previous" onClick={(e) => { e.stopPropagation(); setDemoIdx(demoIdx - 1); }} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-lg font-bold text-ink-900">‹</button> : null}
                  {demoIdx < pages.length - 1 ? <button type="button" aria-label="Next" onClick={(e) => { e.stopPropagation(); setDemoIdx(demoIdx + 1); }} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-lg font-bold text-ink-900">›</button> : null}
                </div>
              ) : null}
            </div>
          </section>
        );
      })()}

      <section className="section" aria-labelledby="facts-h">
        <div className="container-page">
          <h2 id="facts-h" className="text-2xl font-bold text-brand-900 sm:text-3xl">
            {t(copy.factsTitle, lang)}
          </h2>
          <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { Icon: Users, label: copy.posts, value: exam.posts ? exam.posts.toLocaleString(lang === "hi" ? "hi-IN" : "en-IN") : "—" },
              { Icon: IndianRupee, label: copy.pay, value: t(copy.payValue, lang) },
              { Icon: FileText, label: copy.mode, value: t(copy.modeValue, lang) },
              { Icon: CalendarDays, label: copy.examDate, value: d.exam?.date ? fmt(d.exam) : t(copy.tba, lang) },
            ].map(({ Icon, label, value }) => (
              <div key={label.en} className="card p-4 sm:p-5">
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-ink-500 sm:text-sm">
                  <Icon className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  {t(label, lang)}
                </dt>
                <dd className="mt-1.5 text-base font-bold text-ink-900 sm:text-lg">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Buy — one simple choice: the language you pick is the PDF you get */}
      <section id="buy" className="section scroll-mt-48 bg-surface" aria-labelledby="buy-h">
        <div className="container-page max-w-xl">
          <h2 id="buy-h" className="sr-only">
            {lang === "hi" ? "नोट्स खरीदें" : "Buy the notes"}
          </h2>
          {(() => {
            const note = lang === "hi" ? notes.hi : notes.en;
            const secure = !!note?.checkoutProduct && payReady[note.checkoutProduct] === true;
            const live = secure || (note?.status === "AVAILABLE" && !!note.paymentUrl);
            return (
              <div className="card p-6 text-center">
                <p className="text-sm font-semibold text-ink-500">{t(lang === "hi" ? copy.hindiPdf : copy.englishPdf, lang)}</p>
                <p className="mt-1 text-5xl font-extrabold text-brand-900">{formatINR(note?.price.amount ?? 299, lang)}</p>
                {note?.pages ? <p className="mt-1 text-sm text-ink-500">{note.pages} {lang === "hi" ? "पृष्ठ" : "pages"}</p> : null}
                <div className="mt-5">
                  {secure ? (
                    <>
                      <button
                        type="button"
                        onClick={() => startBuy(note!.checkoutProduct!)}
                        disabled={payState !== "idle"}
                        className="btn-primary w-full text-base disabled:opacity-70"
                      >
                        <CreditCard className="h-5 w-5" aria-hidden="true" />
                        {payState === "idle" ? `${t(copy.buy, lang)} — ₹299` : t(copy.wait, lang)}
                      </button>
                      {payError ? <p role="alert" className="mt-3 text-sm text-danger-700">{payError}</p> : null}
                      {ownedToken[note!.checkoutProduct!] ? (
                        <a href={downloadPath(ownedToken[note!.checkoutProduct!]!)} className="btn-outline mt-3 w-full">
                          <Download className="h-4 w-4" aria-hidden="true" />
                          {t(copy.alreadyBought, lang)}
                        </a>
                      ) : null}
                      <p className="mt-3 text-xs text-ink-500">{t(copy.instant, lang)}</p>
                    </>
                  ) : live ? (
                    <a href={note!.paymentUrl} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-base">
                      <CreditCard className="h-5 w-5" aria-hidden="true" />
                      {t(copy.buy, lang)} — ₹299
                    </a>
                  ) : (
                    <>
                      <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent-100 px-3 py-1 text-sm font-semibold text-accent-700">
                        {t(note?.pages ? copy.readySoon : copy.comingSoon, lang)}
                      </p>
                      {notifyHref.startsWith("http") ? (
                        <a href={notifyHref} target="_blank" rel="noopener noreferrer" className="btn-outline w-full">
                          <Bell className="h-4 w-4" aria-hidden="true" />
                          {t(copy.notify, lang)}
                        </a>
                      ) : (
                        <Link href={`${notifyHref}${encodeURIComponent(`${note?.title.en ?? "AG-3 notes"} — notify me`)}`} className="btn-outline w-full">
                          <Bell className="h-4 w-4" aria-hidden="true" />
                          {t(copy.notify, lang)}
                        </Link>
                      )}
                    </>
                  )}
                </div>
                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-500">
                  <ShieldCheck className="h-4 w-4 text-success-700" aria-hidden="true" />
                  {t(copy.secure, lang)} • UPI / Card / Net banking
                </p>
              </div>
            );
          })()}
          {(() => {
            const note = lang === "hi" ? notes.hi : notes.en;
            const cp = note?.comboProduct;
            if (!cp || !payReady[cp]) return null;
            return (
              <div className="card relative mt-5 overflow-hidden border-2 border-accent-500 p-6 text-center">
                <span className="absolute right-0 top-0 rounded-bl-lg bg-accent-500 px-3 py-1 text-xs font-bold text-white">
                  {lang === "hi" ? "₹49 की बचत" : "Save ₹49"}
                </span>
                <p className="text-sm font-bold tracking-wide text-accent-700">{lang === "hi" ? "कॉम्बो ऑफ़र" : "COMBO OFFER"}</p>
                <p className="mt-1 font-semibold text-ink-900">
                  {lang === "hi" ? "हिंदी नोट्स PDF + 20 फुल मॉक टेस्ट" : "English notes PDF + 20 full mock tests"}
                </p>
                <p className="mt-2 flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-extrabold text-brand-900">₹449</span>
                  <span className="text-ink-400 line-through">₹498</span>
                </p>
                <button type="button" onClick={() => startBuy(cp)} disabled={payState !== "idle"} className="btn-primary mt-4 w-full text-base disabled:opacity-70">
                  <CreditCard className="h-5 w-5" aria-hidden="true" />
                  {payState === "idle" ? (lang === "hi" ? "कॉम्बो खरीदें — ₹449" : "Buy combo — ₹449") : t(copy.wait, lang)}
                </button>
                <p className="mt-3 text-xs text-ink-500">
                  {lang === "hi" ? "भुगतान के बाद PDF डाउनलोड करें और सभी 20 टेस्ट तुरंत अनलॉक।" : "Download the PDF and unlock all 20 tests right after payment."}
                </p>
              </div>
            );
          })()}
        </div>
      </section>

      {/* What's inside the PDF for the selected language (only once the PDF is finished) */}
      {(() => {
        const note = lang === "hi" ? notes.hi : notes.en;
        if (!note?.chapters?.length) return null;
        return (
          <section className="section" aria-labelledby="inside-h">
            <div className="container-page">
              <h2 id="inside-h" className="text-2xl font-bold text-brand-900 sm:text-3xl">
                {lang === "hi" ? "PDF में क्या है" : "What's inside the PDF"}
              </h2>
              <p className="mt-2 text-ink-500">
                {lang === "hi"
                  ? `${note.chapters.length} अध्याय • ${note.pages} पृष्ठ • हर अध्याय में नोट्स, तालिकाएँ, शॉर्टकट, सामान्य गलतियाँ और हल सहित MCQ`
                  : `${note.chapters.length} chapters • ${note.pages} pages • every chapter has notes, tables, shortcuts, common traps and solved MCQs`}
              </p>
              <ol className="mt-6 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {note.chapters.map((c, i) => (
                  <li key={c.en} className="flex gap-3 rounded-lg bg-surface px-3 py-2 ring-1 ring-ink-100">
                    <span className="w-7 shrink-0 font-bold text-accent-600">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm text-ink-800">{t(c, lang)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        );
      })()}

      {/* What you get */}
      <section className="section" aria-labelledby="why-h">
        <div className="container-page">
          <h2 id="why-h" className="text-2xl font-bold text-brand-900 sm:text-3xl">
            {t(copy.whyTitle, lang)}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {copy.why.map(({ icon: Icon, title, body }) => (
              <div key={title.en} className="card p-5">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 font-bold text-ink-900">{t(title, lang)}</h3>
                <p className="mt-1 text-sm text-ink-500">{t(body, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Syllabus covered + official exam pattern */}
      <section className="section bg-surface" aria-labelledby="syl-h">
        <div className="container-page">
          <h2 id="syl-h" className="text-2xl font-bold text-brand-900 sm:text-3xl">
            {t(copy.topicsTitle, lang)}
          </h2>
          <p className="mt-2 text-ink-500">
            {lang === "hi"
              ? "नोट्स ऑनलाइन प्रारंभिक परीक्षा के सभी 5 विषयों को कवर करते हैं।"
              : "The notes cover all 5 subjects of the online preliminary exam."}
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {syllabus.map((sub, i) => (
              <article key={sub.name.en} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-ink-900">
                    <span className="mr-1.5 text-accent-600">{i + 1}.</span>
                    {t(sub.name, lang)}
                  </h3>
                  <span className="chip shrink-0 bg-brand-50 text-brand-700">{lang === "hi" ? "20 प्रश्न" : "20 Qs"}</span>
                </div>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {sub.topics.map((tp) => (
                    <li key={tp.en} className="rounded-md bg-canvas px-2 py-1 text-xs text-ink-700 ring-1 ring-ink-200">
                      {t(tp, lang)}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <h3 className="mt-12 text-xl font-bold text-brand-900">{lang === "hi" ? "परीक्षा पैटर्न (आधिकारिक विज्ञापन के अनुसार)" : "Exam pattern (per the official advertisement)"}</h3>
          <div className="mt-4 max-w-3xl">
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="px-5 pt-4 text-left font-semibold text-ink-900">
                  {lang === "hi" ? "चरण 1 — ऑनलाइन प्रारंभिक परीक्षा (MCQ)" : "Stage 1 — Online preliminary exam (MCQ)"}
                </caption>
                <thead className="text-left text-xs text-ink-500">
                  <tr>
                    <th scope="col" className="px-5 py-2 font-semibold">{lang === "hi" ? "विषय" : "Subject"}</th>
                    <th scope="col" className="px-3 py-2 font-semibold">{lang === "hi" ? "प्रश्न/अंक" : "Qs/Marks"}</th>
                    <th scope="col" className="px-5 py-2 font-semibold">{lang === "hi" ? "माध्यम" : "Medium"}</th>
                  </tr>
                </thead>
                <tbody>
                  {syllabus.map((sub) => (
                    <tr key={sub.name.en} className="border-t border-ink-100">
                      <td className="px-5 py-2.5 font-medium text-ink-900">{t(sub.short, lang)}</td>
                      <td className="px-3 py-2.5">20</td>
                      <td className="px-5 py-2.5 text-ink-700">{t(sub.medium, lang)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-ink-200 bg-canvas font-bold">
                    <td className="px-5 py-2.5">{lang === "hi" ? "कुल" : "Total"}</td>
                    <td className="px-3 py-2.5">100</td>
                    <td className="px-5 py-2.5 font-normal text-ink-700">{lang === "hi" ? "120 मिनट" : "120 minutes"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-500">
            {lang === "hi"
              ? "पैटर्न: आधिकारिक विज्ञापन क्रमांक 614/परीक्षा/2026 (पृष्ठ 13)। उप-विषय आम तौर पर पूछे जाने वाले टॉपिक हैं।"
              : "Pattern: official advertisement No. 614/Exam/2026 (page 13). Sub-topics are commonly asked areas."}
          </p>
        </div>
      </section>

      {/* How to buy */}
      <section className="section bg-surface" aria-labelledby="how-h">
        <div className="container-page">
          <h2 id="how-h" className="text-2xl font-bold text-brand-900 sm:text-3xl">
            {t(copy.howTitle, lang)}
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {copy.how.map(({ icon: Icon, title, body }, i) => (
              <li key={title.en} className="card flex gap-4 p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-500 font-bold text-white">{i + 1}</span>
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-ink-900">
                    <Icon className="h-4 w-4 text-brand-600" aria-hidden="true" />
                    {t(title, lang)}
                  </h3>
                  <p className="mt-1 text-sm text-ink-500">{t(body, lang)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Dates */}
      <section className="section" aria-labelledby="dates-h">
        <div className="container-page max-w-3xl">
          <h2 id="dates-h" className="text-2xl font-bold text-brand-900 sm:text-3xl">
            {t(copy.datesTitle, lang)}
          </h2>
          <ol className="card mt-6 divide-y divide-ink-100">
            {[
              { label: copy.appStart, value: fmt(d.applicationStart), done: true },
              { label: copy.appEnd, value: fmt(d.applicationEnd), done: true },
              { label: copy.correction, value: t(copy.correctionValue, lang), done: false },
              { label: copy.prelim, value: d.exam?.date ? fmt(d.exam) : t(copy.tba, lang), done: false },
            ].map((r) => (
              <li key={r.label.en} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
                <span className="flex items-center gap-2 text-ink-700">
                  <span className={`h-2.5 w-2.5 rounded-full ${r.done ? "bg-ink-300" : "bg-accent-500"}`} aria-hidden="true" />
                  {t(r.label, lang)}
                </span>
                <span className="font-semibold text-ink-900">{r.value}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-ink-500">{t(copy.source, lang)}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {exam.rulebookUrl && (
              <a href={exam.rulebookUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
                {t(copy.officialAdvt, lang)} <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
            <Link href={`/exams/${exam.slug}`} className="btn-outline">
              {t(copy.examPage, lang)}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-surface" aria-labelledby="faq-h">
        <div className="container-page max-w-3xl">
          <h2 id="faq-h" className="text-2xl font-bold text-brand-900 sm:text-3xl">
            {t(copy.faqTitle, lang)}
          </h2>
          <div className="mt-6 space-y-3">
            {copy.faqs.map((f) => (
              <details key={f.q.en} className="group card">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
                  {t(f.q, lang)}
                  <ChevronDown className="h-5 w-5 shrink-0 text-ink-500 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="px-5 pb-5 text-ink-700">{t(f.a, lang)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Share */}
      <section id="share" className="section scroll-mt-48" aria-labelledby="share-h">
        <div className="container-page">
          <div className="rounded-[var(--radius-card)] bg-gradient-to-r from-brand-800 to-brand-600 p-6 text-white sm:p-10">
            <h2 id="share-h" className="text-2xl font-bold sm:text-3xl">
              {t(copy.shareTitle, lang)}
            </h2>
            <p className="mt-2 text-brand-100">{t(copy.shareText, lang)}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-[#25D366] text-white hover:bg-[#1ebe5a]"
              >
                WhatsApp
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(t(copy.shareText, lang))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-[#229ED9] text-white hover:bg-[#1b8cc2]"
              >
                Telegram
              </a>
              <button type="button" onClick={doCopy} className="btn-ghost-light">
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? t(copy.copied, lang) : t(copy.copy, lang)}
              </button>
              <button type="button" onClick={nativeShare} className="btn-ghost-light">
                <Share2 className="h-4 w-4" aria-hidden="true" />
                {t(copy.more, lang)}
              </button>
            </div>
          </div>
          <p className="mt-6 flex items-start gap-2 text-xs text-ink-500">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {t(copy.disclaimer, lang)}
          </p>
        </div>
      </section>

      {/* Sticky mobile buy bar */}
      <div className="h-16 lg:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-14 z-30 border-t border-ink-200 bg-surface/95 p-3 backdrop-blur xl:bottom-0 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="leading-tight">
            <span className="block text-xl font-extrabold text-brand-900">₹299</span>
            <span className="text-xs text-ink-500">{lang === "hi" ? "हिंदी PDF" : "English PDF"}</span>
          </p>
          <a href="#buy" className="btn-primary">
            {lang === "hi" ? "नोट्स लें" : "Get notes"}
          </a>
        </div>
      </div>
    </div>
  );
}
