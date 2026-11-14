"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Lang = "hi" | "en";

const subjects = [
  { key: "reasoning", hi: "रीजनिंग एवं सामान्य बुद्धिमत्ता", en: "Reasoning & General Intelligence" },
  { key: "gk", hi: "सामान्य ज्ञान एवं सामान्य जागरूकता", en: "General Knowledge & General Awareness" },
  { key: "maths", hi: "प्रारंभिक गणित", en: "Elementary Mathematics" },
  { key: "language", hi: "हिंदी / English", en: "Hindi / English" },
];

export function SscGdCatalogue() {
  const [lang, setLang] = useState<Lang>("hi");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("testhub_lang_pref");
      if (saved === "hi" || saved === "en") setLang(saved);
    } catch { /* storage may be unavailable */ }

    const onLanguageChange = (event: Event) => {
      const value = (event as CustomEvent).detail;
      if (value === "hi" || value === "en") setLang(value);
    };
    window.addEventListener("testhub-language-change", onLanguageChange);
    return () => window.removeEventListener("testhub-language-change", onLanguageChange);
  }, []);

  const hi = lang === "hi";
  return (
    <main className="container-page py-8 sm:py-10">
      <p className="text-sm font-bold text-orange-700">SSC · GENERAL DUTY</p>
      <h1 className="mt-2 text-2xl font-extrabold text-brand-900 sm:text-3xl">
        {hi ? "SSC GD — 25 मुफ्त मॉक टेस्ट" : "SSC GD — 25 Free Mock Tests"}
      </h1>
      <p className="mt-2 max-w-3xl text-ink-600">
        {hi
          ? "हर पेपर में 80 प्रश्न · 60 मिनट · हिंदी/English · सही उत्तर +2 अंक · गलत उत्तर −0.25 अंक · छोड़े गए प्रश्न 0 अंक।"
          : "80 questions per paper · 60 minutes · Hindi/English · +2 for correct answers · −0.25 for wrong answers · 0 for unattempted."}
      </p>

      <section className="mt-6" aria-labelledby="subjects-heading">
        <h2 id="subjects-heading" className="text-xl font-extrabold text-brand-900">
          {hi ? "विषयवार प्रश्न एवं अंक" : "Subject-wise Questions & Marks"}
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {subjects.map((subject, index) => (
            <article key={subject.key} className="card border-l-4 border-l-indigo-500 p-4">
              <h3 className="font-bold text-ink-900">
                <span className="mr-2 text-indigo-600">{index + 1}.</span>
                {hi ? subject.hi : subject.en}
              </h3>
              <p className="mt-2 text-sm font-semibold text-ink-600">
                {hi ? "20 प्रश्न · 40 अंक" : "20 Questions · 40 Marks"}
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="card mt-6 p-4">
        <b>{hi ? "सभी 25 टेस्ट फ्री हैं — कोई भुगतान या लॉगिन लॉक नहीं।" : "All 25 tests are free — no payment or login lock."}</b>
      </div>

      <section className="mt-7" aria-labelledby="papers-heading">
        <h2 id="papers-heading" className="text-xl font-extrabold text-brand-900">
          {hi ? "SSC GD मॉक टेस्ट पेपर" : "SSC GD Mock Test Papers"}
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              className="card p-4 text-center font-bold transition hover:border-brand-500 hover:shadow-md"
              href={`/mock-tests/sscgd/test.html?t=${String(n).padStart(2, "0")}`}
            >
              {hi ? "मॉक टेस्ट" : "Mock Test"} {n}
              <span className="mt-2 block text-xs font-semibold text-emerald-700">
                {hi ? "फ्री · 80 प्रश्न" : "FREE · 80 Qs"}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
