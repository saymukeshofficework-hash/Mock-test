import PageHero from '../components/PageHero'
import { useLanguage } from '../i18n/LanguageContext'

export default function Disclaimer() {
  const { locale, t } = useLanguage()

  return (
    <>
      <PageHero eyebrow={t('footer.disclaimer')} title={t('footer.disclaimer')} />
      <section className="bg-white py-16">
        <div className="container-page mx-auto flex max-w-3xl flex-col gap-8">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-navy-900">
              {locale === 'hi' ? 'परामर्श एवं रीडिंग' : 'Consultations & Readings'}
            </h2>
            <p className="text-sm leading-relaxed text-navy-800/70">{t('disclaimer.general')}</p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-navy-900">
              {locale === 'hi' ? 'निःशुल्क टूल्स एवं राशिफल' : 'Free Tools & Horoscope'}
            </h2>
            <p className="text-sm leading-relaxed text-navy-800/70">{t('disclaimer.tools')}</p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-navy-900">
              {locale === 'hi' ? 'कोर्स' : 'Courses'}
            </h2>
            <p className="text-sm leading-relaxed text-navy-800/70">
              {locale === 'hi'
                ? 'कोर्स शैक्षणिक उद्देश्यों के लिए हैं। परिणाम व्यक्तिगत अभ्यास, प्रयास एवं परिस्थितियों के अनुसार भिन्न हो सकते हैं।'
                : 'Courses are provided for educational purposes. Outcomes may vary based on individual practice, effort and circumstances.'}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
