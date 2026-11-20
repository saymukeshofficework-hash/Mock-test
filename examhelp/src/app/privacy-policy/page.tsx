import { InfoPage } from "@/components/ui/InfoPage";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({ title: "Privacy Policy", description: "How TETTESTHUB collects, uses and protects your information.", path: "/privacy-policy" });

const UPDATED = "20 Nov 2026";
const DELETE_URL = "https://tettesthub.in/examhelp/delete-account/";

// Both languages are always shown (Play reviewers read English). Keep in sync with the Play Data safety form.
function Hindi() {
  return (
    <>
      <p>अंतिम अपडेट: {UPDATED}। यह नीति tettesthub.in वेबसाइट और TETTESTHUB Android ऐप (in.tettesthub.app) दोनों पर लागू है।</p>
      <h2>हम कौन-सी जानकारी लेते हैं</h2>
      <ul>
        <li>खाता: नाम, ईमेल या मोबाइल नंबर और लॉगिन जानकारी (Supabase के ज़रिए)।</li>
        <li>टेस्ट के परिणाम, प्रगति और खरीदी गई सामग्री की एक्सेस।</li>
        <li>खरीद: ऑर्डर ID, राशि और तारीख। भुगतान Razorpay संभालता है; कार्ड/UPI विवरण हम संग्रहीत नहीं करते।</li>
        <li>सूचनाएँ (push): अगर आप अनुमति देते हैं, तो डिवाइस का push सब्सक्रिप्शन टोकन, ताकि रोज़ के करेंट अफेयर्स और ज़रूरी अपडेट भेजे जा सकें। आप फ़ोन की सेटिंग में इसे कभी भी बंद कर सकते हैं।</li>
        <li>ऐप रेटिंग: ऐप में दी गई स्टार रेटिंग और आपका लिखा नाम (वैकल्पिक)।</li>
        <li>संपर्क फ़ॉर्म/WhatsApp पर आप जो जानकारी भेजते हैं, और भाषा की पसंद (कुकी)।</li>
      </ul>
      <h2>उपयोग</h2>
      <p>लॉगिन, खरीदी गई सामग्री तक पहुँच, टेस्ट परिणाम दिखाने, सूचनाएँ भेजने, सहायता देने और सेवा सुधारने के लिए। हम कोई विज्ञापन नहीं दिखाते और आपकी जानकारी बेचते या विज्ञापन के लिए साझा नहीं करते।</p>
      <h2>सेवा प्रदाता</h2>
      <p>Supabase (खाता और डेटाबेस), Razorpay (भुगतान, केवल वेबसाइट पर) और GitHub Pages (होस्टिंग) हमारी ओर से डेटा प्रोसेस करते हैं। सारा डेटा HTTPS से एन्क्रिप्ट होकर भेजा जाता है।</p>
      <h2>डेटा रखना और हटाना</h2>
      <p>खाता डिलीट करने के लिए <a href={DELETE_URL}>{DELETE_URL}</a> पर अनुरोध भेजें। 30 दिनों के भीतर डेटा हटा दिया जाता है; कर और भुगतान रिकॉर्ड कानून के अनुसार अधिकतम 7 वर्ष तक रखे जा सकते हैं।</p>
      <h2>बच्चे</h2>
      <p>यह सेवा 18 वर्ष और उससे अधिक उम्र के परीक्षार्थियों के लिए है।</p>
      <h2>संपर्क</h2>
      <p>गोपनीयता संबंधी प्रश्नों के लिए <a href="/examhelp/contact/">संपर्क पेज</a>{site.contact.email ? <> या <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a></> : null} का उपयोग करें।</p>
    </>
  );
}

function English() {
  return (
    <>
      <p>Last updated: {UPDATED}. This policy covers the tettesthub.in website and the TETTESTHUB Android app (in.tettesthub.app).</p>
      <h2>What we collect</h2>
      <ul>
        <li>Account: name, email or mobile number and login details (via Supabase).</li>
        <li>Test results, progress and access to purchased content.</li>
        <li>Purchases: order ID, amount and date. Payments are handled by Razorpay; we do not store card/UPI details.</li>
        <li>Notifications (push): if you allow them, your device&apos;s push subscription token, used to send daily current affairs and important updates. You can turn this off in your phone settings at any time.</li>
        <li>App rating: the star rating you give in the app and the name you type (optional).</li>
        <li>What you send through the contact form or WhatsApp, and your language choice (cookie).</li>
      </ul>
      <h2>How we use it</h2>
      <p>To log you in, give access to purchased content, show test results, send notifications, provide support and improve the service. We show no ads and do not sell your information or share it for advertising.</p>
      <h2>Service providers</h2>
      <p>Supabase (accounts and database), Razorpay (payments, website only) and GitHub Pages (hosting) process data on our behalf. All data is encrypted in transit over HTTPS.</p>
      <h2>Data retention and deletion</h2>
      <p>To delete your account, send a request at <a href={DELETE_URL}>{DELETE_URL}</a>. Data is deleted within 30 days; tax and payment records may be kept for up to 7 years as required by law.</p>
      <h2>Children</h2>
      <p>This service is meant for exam candidates aged 18 and over.</p>
      <h2>Contact</h2>
      <p>For privacy questions, use the <a href="/examhelp/contact/">contact page</a>{site.contact.email ? <> or <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a></> : null}.</p>
    </>
  );
}

export default async function PrivacyPage() {
  const lang = await getLang();
  return (
    <InfoPage lang={lang} title={tr(dict.nav.privacy, lang)} path="/privacy-policy">
      {lang === "hi" ? (<><Hindi /><hr /><English /></>) : (<><English /><hr /><Hindi /></>)}
    </InfoPage>
  );
}
