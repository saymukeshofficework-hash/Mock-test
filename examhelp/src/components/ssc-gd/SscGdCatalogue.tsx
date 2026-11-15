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

const subjectColors = [
  { card: "border-sky-300 bg-sky-50", number: "text-sky-700", detail: "bg-sky-100 text-sky-800" },
  { card: "border-emerald-300 bg-emerald-50", number: "text-emerald-700", detail: "bg-emerald-100 text-emerald-800" },
  { card: "border-amber-300 bg-amber-50", number: "text-amber-700", detail: "bg-amber-100 text-amber-800" },
  { card: "border-violet-300 bg-violet-50", number: "text-violet-700", detail: "bg-violet-100 text-violet-800" },
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

      <section className="exam-pattern-panel mt-6" aria-labelledby="subjects-heading">
        <div className="exam-pattern-intro">
          <h2 className="exam-pattern-exam-name">{hi ? "SSC GD परीक्षा पैटर्न" : "SSC GD Exam Pattern"}</h2>
          <p className="exam-pattern-description">
            {hi
              ? "कंप्यूटर आधारित परीक्षा · 80 प्रश्न · 60 मिनट · कुल 160 अंक"
              : "Computer Based Examination · 80 Questions · 60 Minutes · 160 Marks"}
          </p>
        </div>
        <h3 id="subjects-heading" className="exam-pattern-ribbon">
          {hi ? "विषयवार प्रश्न एवं अंक" : "Subject-wise Questions & Marks"}
        </h3>
        <div className="overflow-x-auto">
          <table className="exam-pattern-table w-full text-sm">
            <thead>
              <tr>
                <th scope="col">{hi ? "विषय" : "Subject"}</th>
                <th scope="col">{hi ? "प्रश्न / अंक" : "Questions / Marks"}</th>
                <th scope="col">{hi ? "भाषा" : "Language"}</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => (
                <tr key={subject.key} className={index % 2 === 0 ? "exam-pattern-row-even" : "exam-pattern-row-odd"}>
                  <td className="exam-pattern-subject">{hi ? subject.hi : subject.en}</td>
                  <td className="exam-pattern-count">20 / 40</td>
                  <td className="exam-pattern-language">
                    {subject.key === "language"
                      ? (hi ? "हिंदी या English" : "Hindi or English")
                      : (hi ? "हिंदी / English" : "Hindi / English")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="exam-pattern-total">
          {hi ? "कुल: 80 प्रश्न · 160 अंक · समय: 60 मिनट" : "Total: 80 Questions · 160 Marks · Time: 60 Minutes"}
        </p>
        <p className="exam-pattern-negative">
          {hi ? "सही उत्तर: +2 अंक · गलत उत्तर: −0.25 अंक · अनुत्तरित: 0 अंक" : "Correct: +2 marks · Incorrect: −0.25 marks · Unattempted: 0 marks"}
        </p>
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
