import { InfoPage } from "@/components/ui/InfoPage";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Terms & Conditions", description: "Terms for using TETTESTHUB and its paid study material.", path: "/terms" });

export default async function TermsPage() {
  const lang = await getLang();
  return (
    <InfoPage lang={lang} title={tr(dict.nav.terms, lang)} path="/terms">
      {lang === "hi" ? (
        <>
          <h2>सेवा का उपयोग</h2>
          <p>TETTESTHUB की सामग्री केवल व्यक्तिगत, गैर-व्यावसायिक अध्ययन के लिए है।</p>
          <h2>पेड सामग्री</h2>
          <ul>
            <li>खरीदे गए नोट्स खरीदार के व्यक्तिगत उपयोग के लिए लाइसेंस हैं।</li>
            <li>नोट्स को साझा करना, दोबारा बेचना या सार्वजनिक रूप से अपलोड करना वर्जित है।</li>
          </ul>
          <h2>जानकारी</h2>
          <p>परीक्षा जानकारी केवल संदर्भ के लिए है; अंतिम पुष्टि आधिकारिक अधिसूचना से करें। देखें: अस्वीकरण।</p>
          <h2>परिवर्तन</h2>
          <p>इन शर्तों में समय-समय पर बदलाव हो सकता है। अद्यतन शर्तें इसी पृष्ठ पर प्रकाशित होंगी।</p>
        </>
      ) : (
        <>
          <h2>Using the service</h2>
          <p>TETTESTHUB content is for personal, non-commercial study only.</p>
          <h2>Paid content</h2>
          <ul>
            <li>Purchased notes are licensed for the buyer&apos;s personal use.</li>
            <li>Sharing, reselling or publicly uploading notes is not allowed.</li>
          </ul>
          <h2>Information</h2>
          <p>Exam information is for reference only; confirm it with the official notification. See the Disclaimer.</p>
          <h2>Changes</h2>
          <p>These terms may change from time to time. Updated terms will be published on this page.</p>
        </>
      )}
    </InfoPage>
  );
}
