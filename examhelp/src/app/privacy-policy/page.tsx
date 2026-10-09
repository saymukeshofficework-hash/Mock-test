import { InfoPage } from "@/components/ui/InfoPage";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Privacy Policy", description: "How TETTESTHUB collects, uses and protects your information.", path: "/privacy-policy" });

export default async function PrivacyPage() {
  const lang = await getLang();
  return (
    <InfoPage lang={lang} title={tr(dict.nav.privacy, lang)} path="/privacy-policy">
      {lang === "hi" ? (
        <>
          <h2>हम कौन-सी जानकारी लेते हैं</h2>
          <ul>
            <li>संपर्क फ़ॉर्म में आप जो जानकारी देते हैं — नाम, ईमेल, फ़ोन और संदेश।</li>
            <li>भाषा की पसंद, जिसे एक कुकी में सहेजा जाता है।</li>
            <li>खाता और खरीद सुविधा शुरू होने पर: खाता विवरण और ऑर्डर इतिहास। कार्ड/UPI विवरण हम स्वयं संग्रहीत नहीं करते — भुगतान प्रदाता उन्हें संभालता है।</li>
          </ul>
          <h2>उपयोग</h2>
          <p>आपके प्रश्नों का उत्तर देने, खरीदी गई सामग्री तक पहुँच देने और सेवा सुधारने के लिए। हम आपकी व्यक्तिगत जानकारी बेचते नहीं हैं।</p>
          <h2>एनालिटिक्स</h2>
          <p>यदि सक्षम किया गया, तो हम साइट उपयोग समझने के लिए Google Analytics जैसे टूल का उपयोग कर सकते हैं।</p>
          <h2>संपर्क</h2>
          <p>गोपनीयता संबंधी प्रश्नों के लिए संपर्क पृष्ठ का उपयोग करें।</p>
        </>
      ) : (
        <>
          <h2>What we collect</h2>
          <ul>
            <li>What you enter in the contact form — name, email, phone and message.</li>
            <li>Your language choice, stored in a cookie.</li>
            <li>Once accounts and purchases launch: account details and order history. We do not store card/UPI details ourselves — the payment provider handles them.</li>
          </ul>
          <h2>How we use it</h2>
          <p>To answer your questions, give access to purchased content and improve the service. We do not sell your personal information.</p>
          <h2>Analytics</h2>
          <p>If enabled, we may use tools such as Google Analytics to understand how the site is used.</p>
          <h2>Contact</h2>
          <p>For privacy questions, use the contact page.</p>
        </>
      )}
    </InfoPage>
  );
}
