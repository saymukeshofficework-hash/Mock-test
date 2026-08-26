import PageHero from '../components/PageHero'
import ServiceCard from '../components/ServiceCard'
import CTA from '../components/CTA'
import { useLanguage } from '../i18n/LanguageContext'
import { astrologyServices } from '../data/services.astrology'

export default function AstrologyServices() {
  const { t } = useLanguage()

  return (
    <>
      <PageHero eyebrow={t('nav.astrology')} title={t('common.allAstrologyServicesTitle')} description={t('trust.description')} />
      <section className="bg-white py-20">
        <div className="container-page">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {astrologyServices.map((service) => (
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
