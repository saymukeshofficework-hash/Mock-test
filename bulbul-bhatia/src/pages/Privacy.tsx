import PageHero from '../components/PageHero'
import { useLanguage } from '../i18n/LanguageContext'
import { contactConfig } from '../data/contact'

export default function Privacy() {
  const { locale, t } = useLanguage()

  const sections =
    locale === 'hi'
      ? [
          { title: 'हम क्या जानकारी एकत्र करते हैं', body: 'जब आप परामर्श बुक करते हैं, किसी कोर्स में दाखिला लेते हैं, निःशुल्क टूल्स का उपयोग करते हैं या हमसे संपर्क करते हैं, तो हम आपके द्वारा दी गई जानकारी (जैसे नाम, संपर्क विवरण एवं जन्म विवरण) एकत्र कर सकते हैं।' },
          { title: 'हम आपकी जानकारी का उपयोग कैसे करते हैं', body: 'आपकी जानकारी का उपयोग केवल आपके अनुरोधित परामर्श, कोर्स या सेवा प्रदान करने, और आपसे संपर्क करने के लिए किया जाता है।' },
          { title: 'डेटा साझाकरण', body: 'हम आपकी व्यक्तिगत जानकारी किसी तीसरे पक्ष को नहीं बेचते हैं। जानकारी केवल सेवा प्रदान करने के लिए आवश्यक सीमा तक साझा की जा सकती है।' },
          { title: 'कुकीज़ एवं भाषा प्राथमिकता', body: 'यह साइट आपकी भाषा प्राथमिकता (EN/हिंदी) को याद रखने के लिए आपके ब्राउज़र में स्थानीय भंडारण का उपयोग करती है। इसका उपयोग ट्रैकिंग के लिए नहीं किया जाता।' },
          { title: 'आपके अधिकार', body: 'आप अपनी व्यक्तिगत जानकारी तक पहुंच, सुधार या हटाने का अनुरोध कर सकते हैं। हमसे संपर्क करने के लिए नीचे दिए गए विवरण का उपयोग करें।' },
          { title: 'संपर्क करें', body: `गोपनीयता संबंधी प्रश्नों के लिए, कृपया ${contactConfig.email} पर संपर्क करें।` },
        ]
      : [
          { title: 'What Information We Collect', body: 'When you book a consultation, enroll in a course, use a free tool, or contact us, we may collect information you provide, such as your name, contact details and birth details.' },
          { title: 'How We Use Your Information', body: 'Your information is used only to provide the consultation, course or service you requested, and to communicate with you about it.' },
          { title: 'Data Sharing', body: 'We do not sell your personal information to third parties. Information is shared only to the extent necessary to deliver the requested service.' },
          { title: 'Cookies & Language Preference', body: 'This site uses local storage in your browser to remember your language preference (EN/Hindi). This is not used for tracking.' },
          { title: 'Your Rights', body: 'You may request access to, correction of, or deletion of your personal information. Use the contact details below to reach us.' },
          { title: 'Contact Us', body: `For privacy-related questions, please contact ${contactConfig.email}.` },
        ]

  return (
    <>
      <PageHero eyebrow={t('footer.privacy')} title={t('footer.privacy')} />
      <section className="bg-white py-16">
        <div className="container-page mx-auto flex max-w-3xl flex-col gap-8">
          <p className="text-xs text-navy-800/50">
            {locale === 'hi' ? 'अंतिम अपडेट: यह एक सामान्य टेम्पलेट है — प्रकाशित करने से पहले कानूनी समीक्षा की सिफारिश की जाती है।' : 'Last updated: this is a general template — legal review is recommended before publishing.'}
          </p>
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="mb-2 text-lg font-semibold text-navy-900">{s.title}</h2>
              <p className="text-sm leading-relaxed text-navy-800/70">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
