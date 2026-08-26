import PageHero from '../components/PageHero'
import FAQAccordion from '../components/FAQAccordion'
import CTA from '../components/CTA'
import { useLanguage } from '../i18n/LanguageContext'
import { faqs } from '../data/faqs'

export default function FAQ() {
  const { t } = useLanguage()

  return (
    <>
      <PageHero eyebrow={t('nav.faq')} title={t('sections.faqTitle')} />
      <section className="bg-white py-16">
        <div className="container-page mx-auto max-w-3xl">
          <FAQAccordion categories={faqs} />
        </div>
      </section>
      <CTA />
    </>
  )
}
