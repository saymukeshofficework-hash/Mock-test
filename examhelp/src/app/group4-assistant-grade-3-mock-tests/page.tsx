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
        <h1 className="mt-3 text-2xl font-extrabold text-brand-900 sm:text-4xl">
          MPESB ग्रुप-4 सहायक ग्रेड-3
        </h1>
        <p className="mt-4 text-ink-600">
          इस कोर्स को Courses सूची में जोड़ दिया गया है। 2024 नियमपुस्तिका के अनुसार इसमें सामान्य ज्ञान,
          सामान्य हिंदी, सामान्य अंग्रेज़ी, सामान्य गणित, सामान्य कंप्यूटर ज्ञान और सामान्य अभिक्षमता शामिल होंगे।
        </p>
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
          <h2 className="font-bold">टेस्ट सीरीज़ तैयार की जा रही है</h2>
          <p className="mt-2 text-sm leading-6">
            25 टेस्ट × 100 प्रश्न (कुल 2,500 प्रश्न), हिंदी और English माध्यम। प्रश्नों की जाँच,
            उत्तर-कुंजी और दोहराव की जाँच पूरी होने तक टेस्ट शुरू करने का विकल्प उपलब्ध नहीं होगा।
          </p>
        </div>
        <p className="mt-6 text-sm text-ink-500">पेपर पैटर्न: 100 प्रश्न · 100 अंक · 120 मिनट · चार विकल्प प्रति प्रश्न।</p>
        <a href="/examhelp/courses/" className="mt-7 inline-flex rounded-xl bg-brand-800 px-5 py-3 font-bold text-white">
          Courses पर वापस जाएँ
        </a>
      </div>
    </main>
  );
}
