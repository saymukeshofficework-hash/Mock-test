import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import SectionHeading from '../components/SectionHeading'
import ServiceCard from '../components/ServiceCard'
import CourseCard from '../components/CourseCard'
import CTA from '../components/CTA'
import { useLanguage } from '../i18n/LanguageContext'
import { tarotServices } from '../data/services.tarot'
import { tarotCourses } from '../data/courses'

export default function Tarot() {
  const { locale, t } = useLanguage()
  const featured = tarotServices.filter((s) => s.featured).slice(0, 6)
  const featuredCourses = tarotCourses.filter((c) => c.featured)

  return (
    <>
      <PageHero
        eyebrow={t('nav.tarot')}
        title={t('nav.tarot')}
        description={
          locale === 'hi'
            ? 'रीडिंग, निःशुल्क मार्गदर्शन और सीखने के लिए — बुलबुल भाटिया का संपूर्ण टैरो केंद्र।'
            : 'Readings, guidance and learning — Bulbul Bhatia’s complete Tarot hub.'
        }
      />

      <section className="bg-white py-20">
        <div className="container-page flex flex-col gap-10">
          <SectionHeading eyebrow={t('nav.services')} title={t('sections.featuredTarot')} align="left" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
          <Link to="/tarot-services" className="w-fit text-sm font-semibold text-royal-600 hover:underline">
            {t('common.viewAllTarot')} →
          </Link>
        </div>
      </section>

      <section className="bg-soft-gradient py-20">
        <div className="container-page flex flex-col gap-10">
          <SectionHeading eyebrow={t('nav.courses')} title={t('footer.tarotCourses')} align="left" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
          <Link to="/tarot-courses" className="w-fit text-sm font-semibold text-royal-600 hover:underline">
            {t('common.exploreCourses')} →
          </Link>
        </div>
      </section>

      <CTA />
    </>
  )
}
