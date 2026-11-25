import Link from "next/link";
import { MetaLeadOnRegister } from "@/components/layout/MetaLeadOnRegister";
import { GdBuyCard, GdCountdown, GdDaysChip, GdSticky } from "@/components/landing/GdLanding";
import { MockTestList } from "@/components/mock/MockTestList";
import { JsonLd } from "@/components/ui/Primitives";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MP Police Constable GD Mock Test 2026 — 25 Full Tests (Hindi & English)",
  description:
    "MP पुलिस आरक्षक (जी.डी.) 2026 के 25 फुल मॉक टेस्ट — MPESB पैटर्न: 100 प्रश्न, 120 मिनट, 3 खंड, ऋणात्मक अंकन नहीं। 25 full mock tests on the MPESB pattern in Hindi and English.",
  path: "/mp-police-constable-gd-mock-tests",
});

// Official facts only (MPESB rule book 2026 and MPESB notice dated 23.11.2026).
const FAQS = [
  {
    q: "MP पुलिस आरक्षक (जी.डी.) परीक्षा 2026 कब है? (When is the exam?)",
    a: "MPESB की सूचना दिनांक 23.11.2026 के अनुसार परीक्षा 09 दिसंबर 2026 से शुरू होगी। Per the MPESB notice dated 23 Nov 2026, the exam starts on 9 December 2026.",
  },
  {
    q: "लिखित परीक्षा का पैटर्न क्या है? (What is the exam pattern?)",
    a: "MPESB नियम पुस्तिका 2026 के अनुसार 100 प्रश्न, 100 अंक, 120 मिनट और 3 खंड हैं: सामान्य ज्ञान एवं तार्किक ज्ञान 40, बौद्धिक क्षमता एवं मानसिक अभिरुचि 30, विज्ञान एवं सरल अंकगणित 30। ऋणात्मक अंकन नहीं है। 100 questions, 100 marks, 120 minutes, 3 sections, no negative marking.",
  },
  {
    q: "ये मॉक टेस्ट किस पैटर्न पर हैं? (Which pattern do these mock tests follow?)",
    a: "सभी 25 टेस्ट MPESB नियम पुस्तिका 2026 के पैटर्न पर हैं। हर प्रश्न हिंदी और English में, व्याख्या सहित है, और किसी टेस्ट में प्रश्न दोहराए नहीं गए। All 25 tests follow the MPESB 2026 pattern, in Hindi and English with explanations.",
  },
  {
    q: "क्या ये प्रश्न पिछले वर्षों के पेपर से लिए गए हैं? (Are these previous-year questions?)",
    a: "नहीं। ये प्रश्न हमारी टीम ने नियम पुस्तिका के पाठ्यक्रम के आधार पर तैयार किए हैं। No, these are original practice questions written on the rule-book syllabus.",
  },
  {
    q: "परीक्षा से पहले कितने मॉक टेस्ट देने चाहिए? (How many mock tests before the exam?)",
    a: "परीक्षा से पहले रोज़ कम से कम 1 फुल टेस्ट 120 मिनट में देकर गलत प्रश्नों की व्याख्या पढ़ें। Take at least one full timed test a day and review every wrong answer.",
  },
];

const LINKS = [
  { href: "/exams/mp-police-constable-2026/", label: "MP Police Constable Vacancy 2026 — पद, तिथियाँ, नियम पुस्तिका" },
  { href: "/exam-calendar/", label: "MP परीक्षा कैलेंडर 2026 (Exam Calendar)" },
  { href: "/admit-card/", label: "प्रवेश पत्र अपडेट (Admit Card)" },
  { href: "/current-affairs/", label: "करंट अफेयर्स (Current Affairs)" },
  { href: "/mp-police-driver-mock-tests/", label: "MP पुलिस आरक्षक (चालक) मॉक टेस्ट" },
];

const LOGIN = "/login.html?next=/examhelp/mp-police-constable-gd-mock-tests/";

// Shown at the top for visitors who are not logged in (most ad visitors). Register is the only button.
const TopCta = (
  <section aria-labelledby="gd-top-h" className="card border-2 border-brand-600 p-5 sm:p-6">
    <GdDaysChip />
    <h2 id="gd-top-h" className="mt-3 text-lg font-bold text-brand-900 sm:text-xl">
      9 दिसंबर की परीक्षा से पहले टेस्ट 1 अभी दें (Take Test 1 now)
    </h2>
    <ol className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-brand-800">
      {["रजिस्टर (Register)", "Test 1 दें (Take Test 1)", "रिज़ल्ट देखें (See result)"].map((x, i) => (
        <li key={x} className="rounded-lg bg-brand-50 px-1 py-2">
          <b className="block text-base">{i + 1}</b>
          {x}
        </li>
      ))}
    </ol>
    <a href={LOGIN} className="btn-primary mt-4 w-full sm:w-auto">
      रजिस्टर करें, Test 1 शुरू करें (Register & start)
    </a>
    <p className="mt-2 text-xs text-ink-500">सिर्फ़ ईमेल से 1 मिनट में रजिस्ट्रेशन। Register with your email in 1 minute.</p>
  </section>
);

const INSIDE = [
  ["📝", "25 फुल पेपर (25 full papers)", "हर पेपर 100 प्रश्न, 120 मिनट टाइमर"],
  ["💡", "हर उत्तर की व्याख्या (Explanations)", "हिंदी + English में"],
  ["📊", "तुरंत रिज़ल्ट (Instant result)", "स्कोर, सही और गलत उत्तर"],
  ["📱", "मोबाइल पर (On mobile)", "कभी भी, कितनी बार भी"],
];

export default function Page() {
  return (
    <>
      <MetaLeadOnRegister />
      <MockTestList series="pcgd" topCta={TopCta} topCtaIn={<GdBuyCard />} noFreeBadge />
      <div className="container-page space-y-8 pb-28 sm:pb-12">
        <GdCountdown />

        <section aria-labelledby="gd-in-h" className="card p-5 sm:p-6">
          <h2 id="gd-in-h" className="text-lg font-bold text-brand-900">📦 पैक में क्या मिलेगा? (What&apos;s inside)</h2>
          <ul className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {INSIDE.map(([ic, h, d]) => (
              <li key={h} className="rounded-xl bg-brand-50 p-3">
                <span className="text-xl" aria-hidden="true">{ic}</span>
                <b className="mt-1 block text-sm text-brand-900">{h}</b>
                <span className="text-xs text-ink-700">{d}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="gd-plan-h" className="card p-5 sm:p-6">
          <h2 id="gd-plan-h" className="text-lg font-bold text-brand-900">🗓️ परीक्षा तक का प्लान (Study plan)</h2>
          <ul className="mt-3 divide-y divide-dashed divide-ink-200 text-sm text-ink-700">
            <li className="py-2"><b className="text-brand-700">रोज़ (Daily):</b> 2 फुल टेस्ट, फिर गलत प्रश्नों की व्याख्या पढ़ें। 2 tests a day, then read every wrong answer.</li>
            <li className="py-2"><b className="text-brand-700">आख़िरी 2 दिन (Last 2 days):</b> कमज़ोर खंड दोहराएँ, सिर्फ़ रिवीज़न। Revise weak sections only.</li>
          </ul>
        </section>

        <section aria-labelledby="gd-about-h" className="card p-5 sm:p-6">
          <h2 id="gd-about-h" className="text-xl font-bold text-brand-900">
            MP Police Constable GD Mock Test 2026 — तैयारी कैसे करें
          </h2>
          <div className="mt-3 space-y-3 text-ink-700">
            <p>
              MP पुलिस आरक्षक (जी.डी.) भर्ती 2026 में कुल 7,500 पद हैं और MPESB की सूचना (23.11.2026) के अनुसार परीक्षा 09 दिसंबर 2026 से
              शुरू होगी। ये 25 फुल मॉक टेस्ट उसी पैटर्न पर हैं: 100 प्रश्न, 120 मिनट, 3 खंड, ऋणात्मक अंकन नहीं।
            </p>
            <p>
              The MP Police Constable GD 2026 exam has 7,500 posts and starts on 9 December 2026 (MPESB notice, 23.11.2026). These 25 full
              mock tests follow the same pattern, in Hindi and English, with an explanation for every question.
            </p>
            <p className="text-sm text-ink-500">
              स्रोत / Source: MPESB आरक्षक (जी.डी.) नियम पुस्तिका 2026 (09.09.2026, संशोधित पृष्ठ 1 दिनांक 15.09.2026) और MPESB सूचना दिनांक 23.11.2026। आधिकारिक वेबसाइट:{" "}
              <a href="https://esb.mp.gov.in/" target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 underline underline-offset-2">
                esb.mp.gov.in
              </a>
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>हर टेस्ट पूरे 120 मिनट के टाइमर में दें, ताकि असली परीक्षा जैसी गति बने।</li>
              <li>सामान्य ज्ञान एवं तार्किक ज्ञान (40 प्रश्न) सबसे बड़ा खंड है — MP सामान्य ज्ञान और करंट अफेयर्स रोज़ दोहराएँ।</li>
              <li>ऋणात्मक अंकन नहीं है, इसलिए कोई प्रश्न खाली न छोड़ें।</li>
              <li>हर टेस्ट के बाद गलत प्रश्नों की व्याख्या पढ़ें और कमज़ोर खंड नोट करें।</li>
            </ul>
          </div>
        </section>

        <section aria-labelledby="gd-faq-h" className="space-y-3">
          <h2 id="gd-faq-h" className="text-xl font-bold text-brand-900">
            अक्सर पूछे जाने वाले प्रश्न (FAQ)
          </h2>
          {FAQS.map((f) => (
            <details key={f.q} className="group card">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-ink-500 transition-transform group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="px-5 pb-5 text-ink-700">{f.a}</p>
            </details>
          ))}
        </section>

        <nav aria-labelledby="gd-links-h" className="card p-5 sm:p-6">
          <h2 id="gd-links-h" className="text-lg font-bold text-brand-900">
            ज़रूरी लिंक (Useful links)
          </h2>
          <ul className="mt-3 space-y-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="font-medium text-brand-600 underline underline-offset-2">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <GdSticky />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </>
  );
}
