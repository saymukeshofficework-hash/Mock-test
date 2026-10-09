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
      <Link href="/mp-high-court-assistant-grade-3-mock-tests" className="card flex flex-col gap-3 border-2 border-brand-700 p-5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-accent-700">{lang === "hi" ? "अभी उपलब्ध" : "Available now"}</p>
          <p className="mt-1 text-lg font-extrabold text-brand-900">{lang === "hi" ? "MP हाई कोर्ट सहायक ग्रेड-3 — 25 फुल मॉक टेस्ट" : "MP High Court Assistant Grade-3 — 25 full mock tests"}</p>
          <p className="mt-1 text-sm text-ink-600">{lang === "hi" ? "हिंदी/English · हर प्रश्न की व्याख्या · टेस्ट 1 फ्री" : "Hindi/English · explanation for every question · Test 1 free"}</p>
        </div>
        <span className="btn-primary shrink-0">{lang === "hi" ? "देखें — ₹199" : "View — ₹199"}</span>
      </Link>
      <Link href="/mp-police-constable-gd-mock-tests" className="card mt-4 flex flex-col gap-3 border-2 border-brand-700 p-5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-accent-700">{lang === "hi" ? "नया" : "New"}</p>
          <p className="mt-1 text-lg font-extrabold text-brand-900">{lang === "hi" ? "MP पुलिस आरक्षक (जी.डी.) 2026 — 25 फुल मॉक टेस्ट" : "MP Police Constable (GD) 2026 — 25 full mock tests"}</p>
          <p className="mt-1 text-sm text-ink-600">{lang === "hi" ? "MPESB पैटर्न · हिंदी/English · टेस्ट 1 फ्री" : "MPESB pattern · Hindi/English · Test 1 free"}</p>
        </div>
        <span className="btn-primary shrink-0">{lang === "hi" ? "देखें — ₹199" : "View — ₹199"}</span>
      </Link>
      <Link href="/mp-police-subedar-asi-mock-tests" className="card mt-4 flex flex-col gap-3 border-2 border-brand-700 p-5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-accent-700">{lang === "hi" ? "नया" : "New"}</p>
          <p className="mt-1 text-lg font-extrabold text-brand-900">{lang === "hi" ? "MP पुलिस सूबेदार / ASI 2026 — 25 फुल मॉक टेस्ट" : "MP Police Subedar / ASI 2026 — 25 full mock tests"}</p>
          <p className="mt-1 text-sm text-ink-600">{lang === "hi" ? "MPESB पैटर्न · हिंदी/English · टेस्ट 1 फ्री" : "MPESB pattern · Hindi/English · Test 1 free"}</p>
        </div>
        <span className="btn-primary shrink-0">{lang === "hi" ? "देखें — ₹199" : "View — ₹199"}</span>
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
