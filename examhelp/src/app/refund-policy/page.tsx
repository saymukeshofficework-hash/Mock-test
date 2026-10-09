import { InfoPage } from "@/components/ui/InfoPage";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Refund Policy", description: "Refund policy for TETTESTHUB digital notes and test series.", path: "/refund-policy" });

export default async function RefundPage() {
  const lang = await getLang();
  return (
    <InfoPage lang={lang} title={tr(dict.nav.refund, lang)} path="/refund-policy">
      {lang === "hi" ? (
        <>
          <p>TETTESTHUB के नोट्स और टेस्ट सीरीज़ डिजिटल उत्पाद हैं।</p>
          <h2>रिफंड कब मिलेगा</h2>
          <ul>
            <li>एक ही उत्पाद के लिए दोहरा भुगतान हो जाने पर।</li>
            <li>भुगतान सफल होने के बाद भी सामग्री उपलब्ध न होने और हमारी सहायता से समस्या हल न होने पर।</li>
          </ul>
          <h2>कब नहीं मिलेगा</h2>
          <p>सामग्री डाउनलोड/एक्सेस कर लेने के बाद, सामान्यतः रिफंड नहीं दिया जाता।</p>
          <h2>प्रक्रिया</h2>
          <p>ऑर्डर विवरण के साथ संपर्क पृष्ठ से अनुरोध भेजें। स्वीकृत रिफंड मूल भुगतान माध्यम पर भेजे जाते हैं।</p>
        </>
      ) : (
        <>
          <p>TETTESTHUB notes and test series are digital products.</p>
          <h2>When you get a refund</h2>
          <ul>
            <li>If you were charged twice for the same product.</li>
            <li>If the content is not delivered after a successful payment and our support cannot fix it.</li>
          </ul>
          <h2>When you don&apos;t</h2>
          <p>Once content has been downloaded or accessed, refunds are generally not given.</p>
          <h2>How to ask</h2>
          <p>Send a request with your order details through the contact page. Approved refunds go back to the original payment method.</p>
        </>
      )}
    </InfoPage>
  );
}
