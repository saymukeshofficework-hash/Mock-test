import PageHero from '../components/PageHero'
import { useLanguage } from '../i18n/LanguageContext'
import { contactConfig } from '../data/contact'

export default function Terms() {
  const { locale, t } = useLanguage()

  const sections =
    locale === 'hi'
      ? [
          { title: 'सेवाओं का उपयोग', body: 'इस वेबसाइट का उपयोग करके, आप सहमत हैं कि परामर्श, टैरो रीडिंग एवं कोर्स व्यक्तिगत मार्गदर्शन एवं शिक्षा के लिए हैं।' },
          { title: 'बुकिंग एवं भुगतान', body: 'बुकिंग अनुरोध की पुष्टि बुलबुल मैम की टीम द्वारा की जाती है। भुगतान की शर्तें बुकिंग की पुष्टि के समय साझा की जाएंगी।' },
          { title: 'कोर्स दाखिला', body: 'कोर्स दाखिला अनुरोध के माध्यम से किया जाता है और उपलब्धता के अधीन है। कोर्स सामग्री एवं संरचना समय के साथ अद्यतन हो सकती है।' },
          { title: 'बौद्धिक संपदा', body: 'इस वेबसाइट की सामग्री, कोर्स सामग्री सहित, बुलबुल मैम की संपत्ति है और इसे अनुमति के बिना पुनः वितरित नहीं किया जा सकता।' },
          { title: 'दायित्व की सीमा', body: 'ज्योतिष एवं टैरो परामर्श व्यक्तिगत मार्गदर्शन के लिए हैं और इन्हें पेशेवर सलाह का विकल्प नहीं माना जाना चाहिए (अधिक जानकारी के लिए अस्वीकरण देखें)।' },
          { title: 'शर्तों में बदलाव', body: 'इन शर्तों को समय-समय पर अद्यतन किया जा सकता है। किसी भी बदलाव को इस पृष्ठ पर दर्शाया जाएगा।' },
          { title: 'संपर्क करें', body: `प्रश्नों के लिए, कृपया ${contactConfig.email} पर संपर्क करें।` },
        ]
      : [
          { title: 'Use of Services', body: 'By using this website, you agree that consultations, Tarot readings and courses are intended for personal guidance and education.' },
          { title: 'Booking & Payment', body: 'Booking requests are confirmed by Bulbul Mam’s team. Payment terms will be shared at the time of booking confirmation.' },
          { title: 'Course Enrollment', body: 'Course enrollment is requested through this site and is subject to availability. Course content and structure may be updated over time.' },
          { title: 'Intellectual Property', body: 'Content on this website, including course materials, is the property of Bulbul Mam and may not be redistributed without permission.' },
          { title: 'Limitation of Liability', body: 'Astrology and Tarot consultations are intended for personal guidance and should not be considered a substitute for professional advice (see Disclaimer for more).' },
          { title: 'Changes to These Terms', body: 'These terms may be updated from time to time. Any changes will be reflected on this page.' },
          { title: 'Contact Us', body: `For questions, please contact ${contactConfig.email}.` },
        ]

  return (
    <>
      <PageHero eyebrow={t('footer.terms')} title={t('footer.terms')} />
      <section className="bg-white py-16">
        <div className="container-page mx-auto flex max-w-3xl flex-col gap-8">
          <p className="text-xs text-navy-800/50">
            {locale === 'hi' ? 'यह एक सामान्य टेम्पलेट है — प्रकाशित करने से पहले कानूनी समीक्षा की सिफारिश की जाती है।' : 'This is a general template — legal review is recommended before publishing.'}
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
