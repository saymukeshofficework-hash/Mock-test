import PageHero from '../components/PageHero'
import SectionHeading from '../components/SectionHeading'
import CTA from '../components/CTA'
import { useLanguage } from '../i18n/LanguageContext'

const sections = [
  {
    key: 'who',
    title: { en: 'Who is Bulbul Mam?', hi: 'बुलबुल मैम कौन हैं?' },
    body: {
      en: 'Bulbul Mam is a Tarot reader, astrologer and online teacher who works with people seeking clarity through Tarot and Astrology — both as a practitioner offering consultations, and as a teacher guiding students who want to learn the craft themselves.',
      hi: 'बुलबुल मैम एक टैरो रीडर, ज्योतिषी एवं ऑनलाइन शिक्षिका हैं, जो टैरो एवं ज्योतिष के माध्यम से स्पष्टता चाहने वाले लोगों के साथ काम करती हैं — परामर्श देने वाली एक अभ्यासी के रूप में, और साथ ही स्वयं यह कला सीखने वाले छात्रों का मार्गदर्शन करने वाली एक शिक्षिका के रूप में भी।',
    },
  },
  {
    key: 'approach',
    title: { en: 'Her Approach', hi: 'उनका दृष्टिकोण' },
    body: {
      en: 'Every consultation is grounded, honest and centred on the person in front of her — not generic or one-size-fits-all. The goal is always clarity, not dependency.',
      hi: 'हर परामर्श सहज, ईमानदार और सामने बैठे व्यक्ति पर केंद्रित होता है — सामान्य या एक जैसा नहीं। लक्ष्य हमेशा स्पष्टता होता है, निर्भरता नहीं।',
    },
  },
  {
    key: 'tarotJourney',
    title: { en: 'Tarot Journey', hi: 'टैरो यात्रा' },
    body: {
      en: 'Bulbul Mam’s relationship with Tarot is built on consistent, thoughtful practice — reading the cards as a tool for reflection and insight rather than fixed fortune-telling.',
      hi: 'टैरो के साथ बुलबुल मैम का संबंध निरंतर, विचारशील अभ्यास पर आधारित है — कार्ड्स को चिंतन एवं अंतर्दृष्टि के साधन के रूप में देखना, न कि निश्चित भविष्यवाणी के रूप में।',
    },
  },
  {
    key: 'astrologyJourney',
    title: { en: 'Astrology Journey', hi: 'ज्योतिष यात्रा' },
    body: {
      en: 'Her astrology practice draws on traditional Vedic principles, applied thoughtfully to the real, present-day questions her clients and students bring to her.',
      hi: 'उनका ज्योतिष अभ्यास पारंपरिक वैदिक सिद्धांतों पर आधारित है, जिसे उनके ग्राहकों एवं छात्रों के वास्तविक, वर्तमान प्रश्नों पर विचारपूर्वक लागू किया जाता है।',
    },
  },
  {
    key: 'teaching',
    title: { en: 'Teaching Philosophy', hi: 'शिक्षण दर्शन' },
    body: {
      en: 'Courses are structured to build genuine understanding step by step — from foundational concepts to confident, independent practice — rather than shortcuts or memorized scripts.',
      hi: 'कोर्स चरण-दर-चरण वास्तविक समझ बनाने के लिए संरचित हैं — मूलभूत अवधारणाओं से लेकर आत्मविश्वासपूर्ण, स्वतंत्र अभ्यास तक — न कि शॉर्टकट या रटी हुई स्क्रिप्ट के माध्यम से।',
    },
  },
  {
    key: 'consultation',
    title: { en: 'Consultation Approach', hi: 'परामर्श दृष्टिकोण' },
    body: {
      en: 'Sessions are conducted online, in a calm and judgement-free space, with the aim of leaving you with clarity you can act on.',
      hi: 'सत्र ऑनलाइन, एक शांत एवं निर्णय-मुक्त वातावरण में आयोजित किए जाते हैं, जिसका उद्देश्य आपको ऐसी स्पष्टता देना है जिस पर आप कार्य कर सकें।',
    },
  },
]

export default function About() {
  const { locale, t } = useLanguage()

  return (
    <>
      <PageHero eyebrow={t('nav.about')} title={t('sections.aboutPreviewTitle')} description={t('trust.title')} />
      <section className="bg-white py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr,1.4fr] lg:items-start">
          <div className="mx-auto w-full max-w-sm lg:sticky lg:top-24">
            <div className="glass-card overflow-hidden border-navy-900/10 bg-soft-gradient p-3 shadow-card">
              <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-4 rounded-xl bg-cosmic-gradient text-center text-white">
                <span className="text-6xl" aria-hidden="true">✦</span>
                <span className="font-serif text-3xl font-semibold">Bulbul Mam</span>
                <span className="px-8 text-sm text-white/70">
                  {locale === 'hi' ? 'टैरो रीडर, ज्योतिषी एवं शिक्षिका' : 'Tarot Reader, Astrologer & Teacher'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-10">
            {sections.map((section) => (
              <div key={section.key}>
                <h2 className="mb-2 text-xl font-semibold text-navy-900">{section.title[locale]}</h2>
                <p className="text-sm leading-relaxed text-navy-800/70">{section.body[locale]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </>
  )
}
