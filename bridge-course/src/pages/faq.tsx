import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { product, site, totals } from '../config'
import type { Lang } from '../i18n'
import { hasWhatsApp } from '../lib/whatsapp'

type Faq = { q: string; a: ReactNode }
const u = 'font-semibold underline'

// No refund promise is made here: the refund answer points to the configurable policy page.
const en: Faq[] = [
  {
    q: 'What is this product?',
    a: `${product.name} is a digital PDF of chapter-wise notes for the Bridge Course 2.0 — ${totals.papers} papers, ${totals.chapters} chapter notes, with answers to in-text and end-of-unit questions and quick revision lists.`,
  },
  { q: 'Is this a physical book?', a: 'No. It is a digital PDF only. Nothing is shipped.' },
  {
    q: 'How will I receive the notes?',
    a: 'Right after your payment is verified you land on a page with a DOWNLOAD NOTES button. It gives you a secure, temporary link to the PDF.',
  },
  {
    q: 'Is Razorpay secure?',
    a: 'Yes. Payment happens inside Razorpay’s own checkout (UPI, cards, net banking, wallets). We never see or store your card details or UPI PIN, and our server confirms every payment directly with Razorpay.',
  },
  {
    q: 'When will I receive the download?',
    a: 'Immediately after payment — usually within a few seconds. If your bank takes longer to confirm, use “Check Payment Status” a few minutes later.',
  },
  { q: 'Can I read the PDF on mobile?', a: 'Yes. It opens in any PDF viewer on Android or iPhone, and on computers.' },
  {
    q: 'What happens if payment succeeds but download fails?',
    a: (
      <>
        Your purchase is saved on our side. Open <Link to="/check-status" className={u}>Check Payment Status</Link>,
        enter your order reference (BCN-…) or the Razorpay payment ID from your payment receipt (pay_…), plus the mobile
        number or email you used — you’ll get your download again. You can download up to {product.maxDownloads} times.
        Refund questions: see the <Link to="/refund" className={u}>refund policy</Link>.
      </>
    ),
  },
  {
    q: 'How can I contact support?',
    a: hasWhatsApp
      ? 'Tap “Contact on WhatsApp” on this page and include your order reference if you have one.'
      : site.supportEmail
        ? `Email ${site.supportEmail} with your order reference if you have one.`
        : <>See the <Link to="/contact" className={u}>contact page</Link>.</>,
  },
]

const hi: Faq[] = [
  {
    q: 'यह प्रोडक्ट क्या है?',
    a: `${product.name} ब्रिज कोर्स 2.0 के अध्याय-वार नोट्स की एक डिजिटल PDF है — ${totals.papers} पेपर, ${totals.chapters} अध्यायों के नोट्स, जिनमें पाठगत और पाठांत प्रश्नों के उत्तर और त्वरित रिवीज़न सूचियाँ हैं।`,
  },
  { q: 'क्या यह छपी हुई किताब है?', a: 'नहीं। यह केवल डिजिटल PDF है। कुछ भी डाक से नहीं भेजा जाता।' },
  {
    q: 'नोट्स मुझे कैसे मिलेंगे?',
    a: 'भुगतान सत्यापित होते ही आप एक पेज पर पहुँचेंगे जिस पर “नोट्स डाउनलोड करें” बटन होगा। उससे आपको PDF का सुरक्षित, अस्थायी लिंक मिलता है।',
  },
  {
    q: 'क्या Razorpay सुरक्षित है?',
    a: 'हाँ। भुगतान Razorpay के अपने चेकआउट में होता है (UPI, कार्ड, नेट बैंकिंग, वॉलेट)। हम आपके कार्ड की जानकारी या UPI PIN न कभी देखते हैं, न सेव करते हैं, और हमारा सर्वर हर भुगतान की पुष्टि सीधे Razorpay से करता है।',
  },
  {
    q: 'डाउनलोड कब मिलेगा?',
    a: 'भुगतान के तुरंत बाद — आमतौर पर कुछ ही सेकंड में। अगर आपका बैंक पुष्टि में ज़्यादा समय ले, तो कुछ मिनट बाद “भुगतान की स्थिति देखें” का इस्तेमाल करें।',
  },
  { q: 'क्या मैं PDF मोबाइल पर पढ़ सकता/सकती हूँ?', a: 'हाँ। यह Android या iPhone के किसी भी PDF व्यूअर में, और कंप्यूटर पर भी खुलती है।' },
  {
    q: 'भुगतान हो गया पर डाउनलोड नहीं हुआ तो?',
    a: (
      <>
        आपकी खरीद हमारे पास सुरक्षित है। <Link to="/check-status" className={u}>भुगतान की स्थिति देखें</Link> खोलें,
        अपना ऑर्डर रेफ़रेंस (BCN-…) या भुगतान रसीद में दी गई Razorpay पेमेंट ID (pay_…) और भुगतान के समय दिया गया
        मोबाइल नंबर या ईमेल लिखें — आपको डाउनलोड दोबारा मिल जाएगा। आप अधिकतम {product.maxDownloads} बार डाउनलोड कर सकते हैं।
        रिफ़ंड से जुड़े सवालों के लिए <Link to="/refund" className={u}>रिफ़ंड नीति</Link> देखें।
      </>
    ),
  },
  {
    q: 'सहायता से कैसे संपर्क करें?',
    a: hasWhatsApp
      ? 'इस पेज पर “WhatsApp पर संपर्क करें” पर टैप करें, और अगर आपके पास ऑर्डर रेफ़रेंस है तो उसे भी लिखें।'
      : site.supportEmail
        ? `${site.supportEmail} पर ईमेल करें, और अगर आपके पास ऑर्डर रेफ़रेंस है तो उसे भी लिखें।`
        : <><Link to="/contact" className={u}>संपर्क पेज</Link> देखें।</>,
  },
]

export const faqs: Record<Lang, Faq[]> = { hi, en }
