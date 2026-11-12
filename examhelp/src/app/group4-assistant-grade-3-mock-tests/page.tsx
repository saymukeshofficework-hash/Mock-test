import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MPESB Group-4 Assistant Grade-3 Mock Tests | TET TestHub",
  description: "MPESB Group-4 Assistant Grade-3 bilingual mock test series.",
};

export default function Group4AssistantGrade3Page() {
  return (
    <main className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-3xl rounded-3xl border border-ink-200 bg-surface p-6 shadow-sm sm:p-10">
        <p className="text-sm font-bold uppercase tracking-wide text-brand-700">TET TESTHUB · MPESB GROUP-4</p>
        <h1 className="mt-3 text-2xl font-extrabold text-brand-900 sm:text-4xl">MPESB ग्रुप-4 सहायक ग्रेड-3</h1>
        <p className="mt-4 text-ink-600">अभ्यास टेस्ट सीरीज़: सामान्य ज्ञान, सामान्य हिंदी, सामान्य अंग्रेज़ी, सामान्य गणित, सामान्य कंप्यूटर ज्ञान और सामान्य अभिक्षमता।</p>
        <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-5">
          <h2 className="font-bold text-brand-900">टेस्ट 1 — उपलब्ध</h2>
          <p className="mt-2 text-sm leading-6 text-ink-700">100 द्विभाषी प्रश्न · 100 अंक · 120 मिनट · चार विकल्प। यह अभ्यास पेपर है, आधिकारिक प्रश्नपत्र नहीं।</p>
          <a href="/examhelp/mock-tests/group4/test.html" className="mt-4 inline-flex rounded-xl bg-brand-800 px-5 py-3 font-bold text-white">टेस्ट 1 शुरू करें</a>
        </div>
        <div className="mt-5 rounded-2xl border border-ink-200 p-5">
          <h2 className="font-bold">टेस्ट 2–25</h2>
          <p className="mt-2 text-sm text-ink-600">अगले प्रश्नपत्र तैयार और जाँच के बाद यहाँ जोड़े जाएँगे। अभी उपलब्ध नहीं हैं।</p>
        </div>
        <a href="/course-folders.html" className="mt-7 inline-flex rounded-xl bg-brand-800 px-5 py-3 font-bold text-white">Courses पर वापस जाएँ</a>
      </div>
    </main>
  );
}
