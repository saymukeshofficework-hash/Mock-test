import { InfoPage } from "@/components/ui/InfoPage";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Disclaimer",
  description: "TETTESTHUB is an independent educational and informational platform, not affiliated with MPPSC, MPESB or the Government of Madhya Pradesh.",
  path: "/disclaimer",
});

export default async function DisclaimerPage() {
  const lang = await getLang();
  return (
    <InfoPage lang={lang} title={tr(dict.nav.disclaimer, lang)} path="/disclaimer">
      {lang === "hi" ? (
        <>
          <p className="rounded-xl border border-warning-700/20 bg-warning-50 p-4 font-medium text-warning-700">
            TETTESTHUB एक स्वतंत्र शैक्षिक एवं सूचनात्मक प्लेटफ़ॉर्म है। यह MPPSC, MPESB, म.प्र. उच्च न्यायालय या मध्यप्रदेश शासन से संबद्ध, समर्थित या संचालित नहीं है।
          </p>
          <h2>जानकारी की सटीकता</h2>
          <p>
            हम परीक्षा जानकारी आधिकारिक स्रोतों से जाँचकर प्रकाशित करते हैं, फिर भी तिथियाँ और भर्ती विवरण बदल सकते हैं। किसी भी निर्णय से पहले अभ्यर्थी
            संबंधित आधिकारिक वेबसाइट और अधिसूचना से पुष्टि अवश्य करें।
          </p>
          <h2>तिथियों की स्थिति</h2>
          <ul>
            <li><strong>आधिकारिक</strong> — आधिकारिक अधिसूचना/नियमपुस्तिका में दी गई सटीक तिथि।</li>
            <li><strong>संभावित</strong> — आधिकारिक दस्तावेज़ में “संभावित” के रूप में, या परिवर्तन के बाद पुनः पुष्टि शेष।</li>
            <li><strong>अपेक्षित</strong> — केवल माह ज्ञात (आधिकारिक कैलेंडर के अनुसार)।</li>
            <li><strong>घोषित होना शेष</strong> — अभी कोई आधिकारिक तिथि नहीं।</li>
          </ul>
          <h2>बाहरी लिंक</h2>
          <p>आधिकारिक वेबसाइटों के लिंक सुविधा के लिए दिए गए हैं। उन वेबसाइटों की सामग्री के लिए TETTESTHUB उत्तरदायी नहीं है।</p>
        </>
      ) : (
        <>
          <p className="rounded-xl border border-warning-700/20 bg-warning-50 p-4 font-medium text-warning-700">
            TETTESTHUB is an independent educational and informational platform. It is not affiliated with, endorsed by, or operated by MPPSC, MPESB, the High Court of Madhya Pradesh or the Government of
            Madhya Pradesh.
          </p>
          <h2>Accuracy of information</h2>
          <p>
            We check exam information against official sources before publishing, but dates and recruitment details can change. Candidates must confirm everything on the
            relevant official website and notification before acting on it.
          </p>
          <h2>Date status</h2>
          <ul>
            <li><strong>Official</strong> — the exact date stated in an official notification or rulebook.</li>
            <li><strong>Tentative</strong> — marked as probable (“संभावित”) in an official document, or not re-confirmed after a change.</li>
            <li><strong>Expected</strong> — only the month is known, per an official calendar.</li>
            <li><strong>To be announced</strong> — no official date yet.</li>
          </ul>
          <h2>External links</h2>
          <p>Links to official websites are provided for convenience. TETTESTHUB is not responsible for the content of those websites.</p>
        </>
      )}
    </InfoPage>
  );
}
