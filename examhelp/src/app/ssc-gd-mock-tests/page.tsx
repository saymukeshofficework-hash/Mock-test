import Link from "next/link";
import { getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "SSC GD Mock Tests — 25 Free Bilingual Papers",
  description:
    "25 free SSC GD practice papers with subject-wise details: Reasoning, General Knowledge, Elementary Mathematics and Hindi/English. 80 questions, 60 minutes.",
  path: "/ssc-gd-mock-tests",
});

const subjects = [
  {
    key: "reasoning",
    hi: "रीजनिंग एवं सामान्य बुद्धिमत्ता",
    en: "Reasoning & General Intelligence",
    descHi: "समानता, संख्या एवं अक्षर श्रृंखला, कोडिंग-डिकोडिंग, दिशा ज्ञान, रक्त संबंध, क्रम व्यवस्था, वर्गीकरण और तार्किक प्रश्न।",
    descEn: "Analogy, number and letter series, coding-decoding, directions, blood relations, order and ranking, classification and logical questions.",
  },
  {
    key: "gk",
    hi: "सामान्य ज्ञान एवं सामान्य जागरूकता",
    en: "General Knowledge & General Awareness",
    descHi: "भारत का इतिहास, भूगोल, संविधान, अर्थव्यवस्था, संस्कृति, सामान्य विज्ञान, खेल और महत्वपूर्ण समसामयिक घटनाएँ।",
    descEn: "Indian history, geography, Constitution, economy, culture, general science, sports and important current affairs.",
  },
  {
    key: "maths",
    hi: "प्रारंभिक गणित",
    en: "Elementary Mathematics",
    descHi: "संख्या पद्धति, दशमलव और भिन्न, प्रतिशत, अनुपात-समानुपात, औसत, लाभ-हानि, ब्याज, समय-कार्य, चाल-दूरी और क्षेत्रमिति।",
    descEn: "Number system, decimals and fractions, percentage, ratio and proportion, average, profit and loss, interest, time and work, speed and distance, and mensuration.",
  },
  {
    key: "language",
    hi: "हिंदी / English",
    en: "Hindi / English",
    descHi: "शब्दावली, पर्यायवाची-विलोम, वाक्य शुद्धि, व्याकरण, रिक्त स्थान और गद्यांश आधारित प्रश्न।",
    descEn: "Vocabulary, synonyms and antonyms, sentence correction, grammar, fill-in-the-blanks and comprehension questions.",
  },
];

export default async function Page() {
  const lang = await getLang();
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
          {hi ? "विषय एवं उनका विवरण" : "Subjects & Description"}
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {subjects.map((subject, index) => (
            <article key={subject.key} className="card border-l-4 border-l-indigo-500 p-4">
              <h3 className="font-bold text-ink-900">
                <span className="mr-2 text-indigo-600">{index + 1}.</span>
                {hi ? subject.hi : subject.en}
              </h3>
              <p className="mt-2 text-sm leading-6 text-ink-600">
                {hi ? subject.descHi : subject.descEn}
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="card mt-6 p-4">
        <b>{hi ? "सभी 25 टेस्ट फ्री हैं — कोई भुगतान या लॉगिन लॉक नहीं।" : "All 25 tests are free — no payment or login lock."}</b>
        <p className="mt-1 text-sm text-ink-500">
          {hi
            ? "ये अभ्यास प्रश्नपत्र हैं, आधिकारिक SSC प्रश्नपत्र नहीं। टेस्ट खोलने पर पुलिस/हाई कोर्ट मॉक टेस्ट जैसा CBT इंटरफेस मिलेगा।"
            : "These are practice papers, not official SSC question papers. Each paper opens in the same CBT-style interface used by the Police and High Court mock tests."}
        </p>
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
