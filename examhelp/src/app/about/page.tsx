import Link from "next/link";
import { InfoPage } from "@/components/ui/InfoPage";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "About TETTESTHUB",
  description: "TETTESTHUB is an independent preparation platform for Madhya Pradesh competitive exams — exam updates, calendar, notes, test series and practice tests.",
  path: "/about",
});

export default async function AboutPage() {
  const lang = await getLang();
  return (
    <InfoPage lang={lang} title={tr(dict.nav.about, lang)} path="/about">
      {lang === "hi" ? (
        <>
          <p>
            <strong>TETTESTHUB</strong> का उद्देश्य मध्यप्रदेश की प्रतियोगी परीक्षाओं की तैयारी को सरल बनाना है — परीक्षा अपडेट, कैलेंडर, नोट्स, टेस्ट सीरीज़ और
            प्रैक्टिस टेस्ट, सब एक ही जगह।
          </p>
          <h2>हम क्या करते हैं</h2>
          <ul>
            <li>MPESB और MPPSC की परीक्षाओं की तिथियाँ आधिकारिक स्रोत के लिंक के साथ।</li>
            <li>हर तिथि की स्थिति स्पष्ट — आधिकारिक, संभावित, अपेक्षित या घोषित होना शेष।</li>
            <li>परीक्षा-केंद्रित ₹299 PDF नोट्स (शीघ्र)।</li>
            <li>टेस्ट सीरीज़, प्रैक्टिस टेस्ट, करेंट अफेयर्स और पिछले प्रश्नपत्र (शीघ्र)।</li>
          </ul>
          <h2>हमारा सिद्धांत</h2>
          <p>हम कोई तिथि, रिक्ति, पात्रता या शुल्क अनुमान से नहीं लिखते। जहाँ आधिकारिक जानकारी उपलब्ध नहीं है, वहाँ हम स्पष्ट रूप से यही बताते हैं।</p>
        </>
      ) : (
        <>
          <p>
            <strong>TETTESTHUB</strong> exists to make preparing for Madhya Pradesh competitive exams simpler — exam updates, calendar, notes, test series and practice
            tests, all in one place.
          </p>
          <h2>What we do</h2>
          <ul>
            <li>MPESB and MPPSC exam dates, linked to the official source.</li>
            <li>A clear status on every date — Official, Tentative, Expected or To be announced.</li>
            <li>Exam-focused ₹299 PDF notes (coming soon).</li>
            <li>Test series, practice tests, current affairs and previous papers (coming soon).</li>
          </ul>
          <h2>Our principle</h2>
          <p>We never guess dates, vacancies, eligibility or fees. Where official information is not available, we say so plainly.</p>
        </>
      )}
      <p className="rounded-xl bg-brand-50 p-4 text-sm">{tr(dict.disclaimer.affiliation, lang)}</p>
      <p>
        <Link href="/contact">{tr(dict.nav.contact, lang)}</Link>
      </p>
    </InfoPage>
  );
}
