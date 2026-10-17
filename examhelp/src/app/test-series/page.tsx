import Link from "next/link";
import { SectionLanding } from "@/components/ui/SectionLanding";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MP Exam Test Series 2026 \u2014 MPESB, MPPSC, Police, TET Mock Tests",
  description: "Online test series for Madhya Pradesh exams \u2014 MPPSC, MPESB, MP TET, Police, Group 1\u20134, Teacher, Nursing and Technical. Launching soon.",
  path: "/test-series",
});

export default async function Page() {
  const lang = await getLang();
  return (
    <>
    <div className="container-page pt-6">
      <Link href="/rrb-ntpc/#grad" className="card mb-4 flex flex-col gap-3 border-2 border-emerald-700 p-5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">RRB NTPC · Graduate</p>
          <p className="mt-1 text-lg font-extrabold text-brand-900">{lang === "hi" ? "RRB NTPC ग्रेजुएट लेवल — 25 टेस्ट" : "RRB NTPC Graduate Level — 25 tests"}</p>
          <p className="mt-1 text-sm text-ink-600">{lang === "hi" ? "हर टेस्ट में 100 प्रश्न · हिंदी/English · 90 मिनट" : "100 questions per test · Hindi/English · 90 minutes"}</p>
        </div>
        <span className="btn-primary shrink-0">{lang === "hi" ? "टेस्ट चुनें →" : "Choose tests →"}</span>
      </Link>
      <Link href="/rrb-ntpc/#under" className="card mb-4 flex flex-col gap-3 border-2 border-violet-700 p-5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-violet-700">RRB NTPC · 10+2</p>
          <p className="mt-1 text-lg font-extrabold text-brand-900">{lang === "hi" ? "RRB NTPC 10+2 अंडरग्रेजुएट — 25 टेस्ट" : "RRB NTPC 10+2 Undergraduate — 25 tests"}</p>
          <p className="mt-1 text-sm text-ink-600">{lang === "hi" ? "हर टेस्ट में 100 प्रश्न · हिंदी/English · 90 मिनट" : "100 questions per test · Hindi/English · 90 minutes"}</p>
        </div>
        <span className="btn-primary shrink-0">{lang === "hi" ? "टेस्ट चुनें →" : "Choose tests →"}</span>
      </Link>
      <Link href="/mp-grameen-bank-mock-tests" className="card mb-4 flex flex-col gap-3 border-2 border-emerald-700 p-5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{lang === "hi" ? "नई टेस्ट सीरीज़" : "New test series"}</p>
          <p className="mt-1 text-lg font-extrabold text-brand-900">{lang === "hi" ? "मध्य प्रदेश ग्रामीण बैंक — 25 मॉक टेस्ट" : "Madhya Pradesh Gramin Bank — 25 mock tests"}</p>
          <p className="mt-1 text-sm text-ink-600">{lang === "hi" ? "80 प्रश्न · 45 मिनट · रीजनिंग + संख्यात्मक योग्यता · टेस्ट 1 फ्री" : "80 questions · 45 minutes · Reasoning + Numerical Ability · Test 1 free"}</p>
        </div>
        <span className="btn-primary shrink-0">{lang === "hi" ? "टेस्ट चुनें →" : "Choose tests →"}</span>
      </Link>
      <Link href="/mp-high-court-assistant-grade-3-mock-tests" className="card flex flex-col gap-3 border-2 border-brand-700 p-5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-accent-700">{lang === "hi" ? "अभी उपलब्ध" : "Available now"}</p>
          <p className="mt-1 text-lg font-extrabold text-brand-900">{lang === "hi" ? "MP हाई कोर्ट सहायक ग्रेड-3 — 25 फुल मॉक टेस्ट" : "MP High Court Assistant Grade-3 — 25 full mock tests"}</p>
          <p className="mt-1 text-sm text-ink-600">{lang === "hi" ? "हिंदी/English · हर प्रश्न की व्याख्या · टेस्ट 1 फ्री" : "Hindi/English · explanation for every question · Test 1 free"}</p>
        </div>
        <span className="btn-primary shrink-0">{lang === "hi" ? "टेस्ट चुनें →" : "Choose tests →"}</span>
      </Link>
      <Link href="/mp-police-constable-gd-mock-tests" className="card mt-4 flex flex-col gap-3 border-2 border-brand-700 p-5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-accent-700">{lang === "hi" ? "नया" : "New"}</p>
          <p className="mt-1 text-lg font-extrabold text-brand-900">{lang === "hi" ? "MP पुलिस आरक्षक (जी.डी.) 2026 — 25 फुल मॉक टेस्ट" : "MP Police Constable (GD) 2026 — 25 full mock tests"}</p>
          <p className="mt-1 text-sm text-ink-600">{lang === "hi" ? "MPESB पैटर्न · हिंदी/English · टेस्ट 1 फ्री" : "MPESB pattern · Hindi/English · Test 1 free"}</p>
        </div>
        <span className="btn-primary shrink-0">{lang === "hi" ? "टेस्ट चुनें →" : "Choose tests →"}</span>
      </Link>
      <Link href="/mp-police-subedar-asi-mock-tests" className="card mt-4 flex flex-col gap-3 border-2 border-brand-700 p-5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-accent-700">{lang === "hi" ? "नया" : "New"}</p>
          <p className="mt-1 text-lg font-extrabold text-brand-900">{lang === "hi" ? "MP पुलिस सूबेदार / ASI 2026 — 25 फुल मॉक टेस्ट" : "MP Police Subedar / ASI 2026 — 25 full mock tests"}</p>
          <p className="mt-1 text-sm text-ink-600">{lang === "hi" ? "MPESB पैटर्न · हिंदी/English · टेस्ट 1 फ्री" : "MPESB pattern · Hindi/English · Test 1 free"}</p>
        </div>
        <span className="btn-primary shrink-0">{lang === "hi" ? "टेस्ट चुनें →" : "Choose tests →"}</span>
      </Link>
      <Link href="/mp-police-driver-mock-tests" className="card mt-4 flex flex-col gap-3 border-2 border-brand-700 p-5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-accent-700">{lang === "hi" ? "नया" : "New"}</p>
          <p className="mt-1 text-lg font-extrabold text-brand-900">{lang === "hi" ? "MP पुलिस आरक्षक (चालक) 2026 — 25 फुल मॉक टेस्ट" : "MP Police Constable (Driver) 2026 — 25 full mock tests"}</p>
          <p className="mt-1 text-sm text-ink-600">{lang === "hi" ? "MPESB पैटर्न · हिंदी · टेस्ट 1 फ्री" : "MPESB pattern · Hindi · Test 1 free"}</p>
        </div>
        <span className="btn-primary shrink-0">{lang === "hi" ? "टेस्ट चुनें →" : "Choose tests →"}</span>
      </Link>
    </div>
    <SectionLanding
      lang={lang}
      path="/test-series"
      title={tr(dict.nav.testSeries, lang)}
      subtitle={tr({ hi: "परीक्षा पैटर्न पर आधारित ऑनलाइन टेस्ट सीरीज़", en: "Online test series built on the real exam pattern" }, lang)}
      message={tr(dict.comingSoon.testSeries, lang)}
      notifySubject="test-series launch"
      categories={[
        { hi: "MPPSC", en: "MPPSC" },
        { hi: "MPESB", en: "MPESB" },
        { hi: "TET", en: "TET" },
        { hi: "पुलिस", en: "Police" },
        { hi: "समूह 1", en: "Group 1" },
        { hi: "समूह 2", en: "Group 2" },
        { hi: "समूह 3", en: "Group 3" },
        { hi: "समूह 4", en: "Group 4" },
        { hi: "शिक्षक", en: "Teacher" },
        { hi: "नर्सिंग", en: "Nursing" },
        { hi: "तकनीकी", en: "Technical" }
      ]}
      officialLinks={[
        
      ]}
    />
    </>
  );
}
