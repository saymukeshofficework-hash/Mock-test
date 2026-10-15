import { InfoPage } from "@/components/ui/InfoPage";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Delete account",
  description: "How to delete your TETTESTHUB account and data.",
  path: "/delete-account",
});

export default async function DeleteAccountPage() {
  const lang = await getLang();
  const msg = encodeURIComponent("Please delete my TETTESTHUB account. Registered email/mobile: ");
  const wa = site.contact.whatsapp ? `${site.contact.whatsapp}?text=${msg}` : "";
  const mail = site.contact.email ? `mailto:${site.contact.email}?subject=Delete%20my%20TETTESTHUB%20account&body=${msg}` : "";
  return (
    <InfoPage lang={lang} title={tr(dict.nav.deleteAccount, lang)} path="/delete-account">
      {lang === "hi" ? (
        <>
          <p>अपना TETTESTHUB अकाउंट और उससे जुड़ा डेटा हटाने के लिए नीचे दिए बटन से हमें अनुरोध भेजें। अनुरोध अपने रजिस्टर्ड ईमेल या मोबाइल नंबर से भेजें।</p>
          <h2>क्या हटाया जाएगा</h2>
          <ul>
            <li>नाम, ईमेल, मोबाइल नंबर और लॉगिन जानकारी</li>
            <li>टेस्ट के परिणाम और प्रगति</li>
            <li>खरीद के आधार पर मिली एक्सेस (खरीदे हुए टेस्ट/नोट्स तक पहुँच समाप्त हो जाएगी)</li>
          </ul>
          <p>कर और भुगतान संबंधी रिकॉर्ड (ऑर्डर ID, राशि, तारीख) कानून के अनुसार अधिकतम 7 वर्ष तक रखे जा सकते हैं। अनुरोध के 30 दिनों के भीतर डेटा हटा दिया जाएगा।</p>
        </>
      ) : (
        <>
          <p>To delete your TETTESTHUB account and its data, send us a request using the button below. Send it from your registered email or mobile number.</p>
          <h2>What is deleted</h2>
          <ul>
            <li>Name, email, mobile number and login details</li>
            <li>Test results and progress</li>
            <li>Access granted by purchases (access to purchased tests and notes ends)</li>
          </ul>
          <p>Tax and payment records (order ID, amount, date) may be kept for up to 7 years as required by law. Your data is deleted within 30 days of the request.</p>
        </>
      )}
      <p className="not-prose flex flex-wrap gap-3">
        {wa && <a className="btn-primary" href={wa}>WhatsApp</a>}
        {mail && <a className="btn-outline" href={mail}>Email</a>}
        <a className="btn-outline" href="/examhelp/contact/">{lang === "hi" ? "संपर्क पेज" : "Contact page"}</a>
      </p>
    </InfoPage>
  );
}
