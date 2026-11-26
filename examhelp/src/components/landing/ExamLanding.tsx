import type { ReactNode } from "react";
import Link from "next/link";
import { MetaLeadOnRegister } from "@/components/layout/MetaLeadOnRegister";
import { GdBuyCard, GdCountdown, GdDaysChip, GdSticky } from "@/components/landing/GdLanding";
import { MockTestList } from "@/components/mock/MockTestList";
import { JsonLd } from "@/components/ui/Primitives";
import { EXAM_LANDINGS } from "@/data/examLandings";
import { MOCK_SERIES } from "@/data/mockTests";

// GD-style landing page for any series listed in src/data/examLandings.ts (same blocks as the GD page).
export function ExamLanding({ id, tabs }: { id: string; tabs?: ReactNode }) {
  const c = EXAM_LANDINGS[id];
  const S = MOCK_SERIES[id];
  const n = S.total;
  const login = `/login.html?next=/examhelp${c.path}`;
  const when = c.proposed ? "प्रस्तावित तिथि" : c.tentative ? "संभावित तिथि" : "तिथि";

  const faqs = [
    {
      q: `${c.examHi} कब है? (When is the exam?)`,
      a: `${c.sourceHi} के अनुसार परीक्षा ${when}: ${c.dateLongHi}। ${c.tentative ? "Per news reports quoting the official notice" : "Per the official source"}, the exam is on ${c.dateLongEn}.${c.tentative ? " अंतिम तिथि आधिकारिक वेबसाइट पर देखें। Check the official website for the final date." : ""}${c.proposed ? " यह प्रस्तावित तिथि है, अंतिम सूचना आयोग की वेबसाइट पर देखें। This is a proposed date; check the commission's website for the final notice." : ""}`,
    },
    {
      q: "इन मॉक टेस्ट का पैटर्न क्या है? (What is the test pattern?)",
      a: `${S.totalLine.hi}। ${S.neg.hi} ${S.totalLine.en}. ${S.neg.en}`,
    },
    {
      q: "क्या ये पिछले वर्षों के प्रश्नपत्र हैं? (Are these previous-year papers?)",
      a: "नहीं। ये हमारी टीम के बनाए अभ्यास पेपर हैं, आधिकारिक प्रश्नपत्र नहीं। हर प्रश्न व्याख्या सहित है। No, these are original practice papers with an explanation for every question.",
    },
    {
      q: "परीक्षा से पहले कितने मॉक टेस्ट देने चाहिए? (How many tests before the exam?)",
      a: "रोज़ कम से कम 1 फुल टेस्ट पूरे समय में देकर गलत प्रश्नों की व्याख्या पढ़ें। Take at least one full timed test a day and review every wrong answer.",
    },
  ];

  const inside = [
    ["📝", `${n} फुल पेपर (${n} full papers)`, "असली परीक्षा जैसा पैटर्न और टाइमर"],
    ["💡", "हर उत्तर की व्याख्या (Explanations)", "हर प्रश्न के साथ"],
    ["📊", "तुरंत रिज़ल्ट (Instant result)", "स्कोर, सही और गलत उत्तर"],
    ["📱", "मोबाइल पर (On mobile)", "कभी भी, कितनी बार भी"],
  ];

  const topCta = (
    <section aria-labelledby="ex-top-h" className="card border-2 border-brand-600 p-5 sm:p-6">
      <GdDaysChip cfg={c} />
      <h2 id="ex-top-h" className="mt-3 text-lg font-bold text-brand-900 sm:text-xl">
        {c.dateLongHi} की परीक्षा से पहले टेस्ट 1 अभी दें (Take Test 1 now)
      </h2>
      <ol className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-brand-800">
        {["रजिस्टर (Register)", "Test 1 दें (Take Test 1)", "रिज़ल्ट देखें (See result)"].map((x, i) => (
          <li key={x} className="rounded-lg bg-brand-50 px-1 py-2">
            <b className="block text-base">{i + 1}</b>
            {x}
          </li>
        ))}
      </ol>
      <a href={login} className="btn-primary mt-4 w-full sm:w-auto">
        रजिस्टर करें, Test 1 शुरू करें (Register & start)
      </a>
      <p className="mt-2 text-xs text-ink-500">सिर्फ़ ईमेल से 1 मिनट में रजिस्ट्रेशन। Register with your email in 1 minute.</p>
    </section>
  );

  return (
    <div className={`theme-${c.theme}`}>
      <MetaLeadOnRegister />
      {tabs}
      <div id="tests">
        <MockTestList series={id} topCta={topCta} topCtaIn={<GdBuyCard cfg={c} />} noFreeBadge />
      </div>
      <div className="container-page space-y-8 pb-28 sm:pb-12">
        <GdCountdown cfg={c} />

        <section aria-labelledby="ex-in-h" className="card p-5 sm:p-6">
          <h2 id="ex-in-h" className="text-lg font-bold text-brand-900">📦 पैक में क्या मिलेगा? (What&apos;s inside)</h2>
          <ul className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {inside.map(([ic, h, d]) => (
              <li key={h} className="rounded-xl bg-brand-50 p-3">
                <span className="text-xl" aria-hidden="true">{ic}</span>
                <b className="mt-1 block text-sm text-brand-900">{h}</b>
                <span className="text-xs text-ink-700">{d}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="ex-about-h" className="card p-5 sm:p-6">
          <h2 id="ex-about-h" className="text-xl font-bold text-brand-900">
            📅 {c.examHi} — परीक्षा {when} (Exam date)
          </h2>
          <div className="mt-3 space-y-3 text-ink-700">
            <p className="text-2xl font-extrabold text-brand-800">{c.dateLongHi}</p>
            <p>
              {c.examEn}: {c.dateLongEn}. These {n} mock tests are practice papers in the format shown above.
            </p>
            <p className="text-sm text-ink-500">
              स्रोत / Source:{" "}
              <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 underline underline-offset-2">
                {c.sourceHi}
              </a>
            </p>
          </div>
        </section>

        <section aria-labelledby="ex-faq-h" className="space-y-3">
          <h2 id="ex-faq-h" className="text-xl font-bold text-brand-900">
            अक्सर पूछे जाने वाले प्रश्न (FAQ)
          </h2>
          {faqs.map((f) => (
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

        <nav aria-labelledby="ex-links-h" className="card p-5 sm:p-6">
          <h2 id="ex-links-h" className="text-lg font-bold text-brand-900">
            ज़रूरी लिंक (Useful links)
          </h2>
          <ul className="mt-3 space-y-2">
            {[
              { href: "/exam-calendar/", label: "परीक्षा कैलेंडर (Exam Calendar)" },
              { href: "/current-affairs/", label: "करंट अफेयर्स (Current Affairs)" },
              { href: "/test-series/", label: "सभी टेस्ट सीरीज़ (All test series)" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="font-medium text-brand-600 underline underline-offset-2">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <GdSticky cfg={c} label={c.label} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </div>
  );
}
