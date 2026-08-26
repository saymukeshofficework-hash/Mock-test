import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import SectionHeading from '../components/SectionHeading'
import ServiceCard from '../components/ServiceCard'
import CourseCard from '../components/CourseCard'
import CTA from '../components/CTA'
import { useLanguage } from '../i18n/LanguageContext'
import { astrologyServices } from '../data/services.astrology'
import { astrologyCourses } from '../data/courses'
import { toolCategories } from '../data/tools'

export default function Astrology() {
  const { locale, t } = useLanguage()
  const featured = astrologyServices.filter((s) => s.featured).slice(0, 6)
  const featuredCourses = astrologyCourses.filter((c) => c.featured)

  return (
    <>
      <PageHero
        eyebrow={t('nav.astrology')}
        title={t('nav.astrology')}
        description={
          locale === 'hi'
            ? 'परामर्श, निःशुल्क टूल्स, राशिफल और सीखने के लिए — बुलबुल मैम का संपूर्ण ज्योतिष केंद्र।'
            : 'Consultations, free tools, horoscope and learning — Bulbul Mam’s complete astrology hub.'
        }
      />

      <section className="bg-white py-20">
        <div className="container-page flex flex-col gap-10">
          <SectionHeading eyebrow={t('nav.services')} title={t('sections.featuredAstrology')} align="left" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
          <Link to="/astrology-services" className="w-fit text-sm font-semibold text-royal-600 hover:underline">
            {t('common.viewAllAstrology')} →
          </Link>
        </div>
      </section>

      <section className="bg-soft-gradient py-20">
        <div className="container-page flex flex-col gap-10">
          <SectionHeading eyebrow={t('nav.tools')} title={t('sections.toolsTitle')} align="left" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {toolCategories.map((cat) => (
              <Link key={cat.slug} to="/tools" className="card p-5 text-sm font-semibold text-navy-900">
                {cat.name[locale]}
              </Link>
            ))}
          </div>
          <Link to="/tools" className="w-fit text-sm font-semibold text-royal-600 hover:underline">
            {t('common.exploreTools')} →
          </Link>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container-page flex flex-col gap-10">
          <SectionHeading eyebrow={t('nav.courses')} title={t('footer.astrologyCourses')} align="left" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
          <Link to="/astrology-courses" className="w-fit text-sm font-semibold text-royal-600 hover:underline">
            {t('common.exploreCourses')} →
          </Link>
        </div>
      </section>

      <CTA />
    </>
  )
}
