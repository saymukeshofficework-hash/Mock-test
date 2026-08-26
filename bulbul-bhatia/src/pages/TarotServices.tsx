import PageHero from '../components/PageHero'
import ServiceCard from '../components/ServiceCard'
import CTA from '../components/CTA'
import { useLanguage } from '../i18n/LanguageContext'
import { tarotServices } from '../data/services.tarot'

export default function TarotServices() {
  const { t } = useLanguage()

  return (
    <>
      <PageHero eyebrow={t('nav.tarot')} title={t('common.allTarotServicesTitle')} description={t('trust.description')} />
      <section className="bg-white py-20">
        <div className="container-page">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tarotServices.map((service) => (
              <div id={service.slug} key={service.slug} className="scroll-mt-24">
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </>
  )
}
