import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import SectionHeading from '../components/SectionHeading'
import ServiceCard from '../components/ServiceCard'
import CourseCard from '../components/CourseCard'
import ZodiacCard from '../components/ZodiacCard'
import TestimonialCard from '../components/TestimonialCard'
import FAQAccordion from '../components/FAQAccordion'
import CTA from '../components/CTA'
import { useLanguage } from '../i18n/LanguageContext'
import { asset } from '../lib/publicBase'
import { astrologyServices } from '../data/services.astrology'
import { tarotServices } from '../data/services.tarot'
import { tarotCourses, astrologyCourses, learningLevels } from '../data/courses'
import { zodiacSigns } from '../data/zodiac'
import { testimonials } from '../data/testimonials'
import { faqs } from '../data/faqs'

export default function Home() {
  const { locale, t } = useLanguage()
  const featuredAstrology = astrologyServices.filter((s) => s.featured).slice(0, 8)
  const featuredTarot = tarotServices.filter((s) => s.featured).slice(0, 8)
  const featuredCourses = [...tarotCourses, ...astrologyCourses].filter((c) => c.featured)

  const findReadingCards = [
    { key: 'love', to: '/tarot-services#love-tarot-reading', img: '/images/tarot/tarot-cards-in-hand-forest-light.webp' },
    { key: 'career', to: '/astrology-services#career-astrology', img: '/images/astrology/vedic-zodiac-wheel-mandala.webp' },
    { key: 'kundli', to: '/astrology-services#janam-kundli-reading', img: '/images/astrology/vedic-zodiac-wheel-mandala.webp' },
    { key: 'tarotGuidance', to: '/tarot-services', img: '/images/tarot/moon-card-tarot-spread-crystals.webp' },
  ] as const

  return (
    <>
      <Hero />

      {/* Trust / Introduction */}
      <section className="bg-white py-20">
        <div className="container-page flex flex-col gap-12">
          <SectionHeading eyebrow={t('trust.eyebrow')} title={t('trust.title')} description={t('trust.description')} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(['guidance', 'tarotAstrology', 'online', 'learning'] as const).map((key) => (
              <div key={key} className="card p-6">
                <h3 className="mb-2 text-base font-semibold text-navy-900">{t(`trust.pillars.${key}.title`)}</h3>
                <p className="text-sm leading-relaxed text-navy-800/70">{t(`trust.pillars.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Astrology Services */}
      <section className="bg-soft-gradient py-20">
        <div className="container-page flex flex-col gap-10">
          <SectionHeading eyebrow={t('nav.astrology')} title={t('sections.featuredAstrology')} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredAstrology.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
          <div className="text-center">
            <Link to="/astrology-services" className="btn-primary">
              {t('common.viewAllAstrology')}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Tarot Services */}
      <section className="bg-white py-20">
        <div className="container-page flex flex-col gap-10">
          <SectionHeading eyebrow={t('nav.tarot')} title={t('sections.featuredTarot')} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTarot.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
          <div className="text-center">
            <Link to="/tarot-services" className="btn-primary">
              {t('common.viewAllTarot')}
            </Link>
          </div>
        </div>
      </section>

      {/* Find Your Reading */}
      <section className="bg-navy-950 py-20">
        <div className="container-page flex flex-col gap-10">
          <SectionHeading title={t('sections.findRightReading')} light />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {findReadingCards.map(({ key, to, img }) => (
              <Link key={key} to={to} className="group glass-card relative flex h-56 flex-col justify-end overflow-hidden p-5">
                <img src={asset(img)} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-50 transition group-hover:opacity-70" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" aria-hidden="true" />
                <div className="relative text-white">
                  <h3 className="font-serif text-lg font-semibold">{t(`findReading.${key}.title`)}</h3>
                  <p className="mt-1 text-xs text-white/70">{t(`findReading.${key}.desc`)}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link to="/book" className="btn-primary">
              {t('common.findYourReading')}
            </Link>
          </div>
        </div>
      </section>

      {/* About Bulbul Mam preview */}
      <section className="bg-white py-20">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div className="relative mx-auto w-full max-w-sm">
            <div className="glass-card overflow-hidden border-navy-900/10 bg-soft-gradient p-3 shadow-card">
              <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 rounded-xl bg-cosmic-gradient text-center text-white">
                <span className="text-5xl" aria-hidden="true">✦</span>
                <span className="font-serif text-2xl font-semibold">Bulbul Mam</span>
                <span className="px-8 text-xs text-white/70">
                  {locale === 'hi' ? 'टैरो रीडर एवं ज्योतिषी' : 'Tarot Reader & Astrologer'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <SectionHeading eyebrow={t('nav.about')} title={t('sections.aboutPreviewTitle')} align="left" description={t('trust.description')} />
            <div>
              <Link to="/about" className="btn-secondary">
                {t('common.learnMore')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Free Astrology Tools preview */}
      <section className="bg-soft-gradient py-20">
        <div className="container-page flex flex-col gap-10">
          <SectionHeading eyebrow={t('nav.tools')} title={t('sections.toolsTitle')} description={t('sections.toolsSubtitle')} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { slug: 'numerology-calculator', name: locale === 'hi' ? 'अंक ज्योतिष कैलकुलेटर' : 'Numerology Calculator' },
              { slug: 'sun-sign-calculator', name: locale === 'hi' ? 'सूर्य राशि कैलकुलेटर' : 'Sun Sign Calculator' },
              { slug: 'kundli-calculator', name: locale === 'hi' ? 'कुंडली कैलकुलेटर' : 'Kundli Calculator' },
              { slug: 'sade-sati-calculator', name: locale === 'hi' ? 'साढ़े साती कैलकुलेटर' : 'Sade Sati Calculator' },
              { slug: 'kundli-milan', name: locale === 'hi' ? 'कुंडली मिलान' : 'Kundli Milan' },
              { slug: 'panchang', name: locale === 'hi' ? 'पंचांग' : 'Panchang' },
            ].map((tool) => (
              <Link key={tool.slug} to={`/tools/${tool.slug}`} className="card flex items-center justify-between gap-3 p-5">
                <span className="text-sm font-semibold text-navy-900">{tool.name}</span>
                <span aria-hidden="true" className="text-royal-600">→</span>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link to="/tools" className="btn-primary">
              {t('common.exploreTools')}
            </Link>
          </div>
        </div>
      </section>

      {/* Horoscope preview */}
      <section className="bg-twilight-gradient py-20">
        <div className="container-page flex flex-col gap-10">
          <SectionHeading title={t('sections.horoscopePreviewTitle')} light />
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {zodiacSigns.map((sign) => (
              <ZodiacCard key={sign.slug} sign={sign} />
            ))}
          </div>
          <div className="text-center">
            <Link to="/horoscope" className="btn-primary">
              {t('nav.horoscope')}
            </Link>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="bg-white py-20">
        <div className="container-page flex flex-col gap-10">
          <SectionHeading eyebrow={t('nav.courses')} title={t('sections.coursesTitle')} description={t('sections.coursesSubtitle')} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/tarot-courses" className="btn-secondary">
              {t('footer.tarotCourses')}
            </Link>
            <Link to="/astrology-courses" className="btn-secondary">
              {t('footer.astrologyCourses')}
            </Link>
          </div>
        </div>
      </section>

      {/* Learning Levels */}
      <section className="bg-soft-gradient py-20">
        <div className="container-page flex flex-col gap-10">
          <SectionHeading title={t('sections.learningLevelsTitle')} />
          <ol className="flex flex-wrap items-center justify-center gap-3">
            {learningLevels.map((level, idx) => (
              <li key={level} className="flex items-center gap-3">
                <span className="flex flex-col items-center gap-2">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cosmic-gradient text-sm font-semibold text-white">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-navy-900">{level}</span>
                </span>
                {idx < learningLevels.length - 1 && (
                  <span aria-hidden="true" className="hidden h-px w-8 bg-navy-900/20 sm:block" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why Learn With Bulbul Mam */}
      <section className="bg-white py-20">
        <div className="container-page flex flex-col gap-10">
          <SectionHeading title={t('sections.whyLearnTitle')} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(['guidance', 'tarotAstrology', 'online', 'learning'] as const).map((key) => (
              <div key={key} className="card p-6 text-center">
                <h3 className="mb-2 text-base font-semibold text-navy-900">{t(`trust.pillars.${key}.title`)}</h3>
                <p className="text-sm leading-relaxed text-navy-800/70">{t(`trust.pillars.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-soft-gradient py-20">
        <div className="container-page flex flex-col gap-10">
          <SectionHeading title={t('sections.testimonialsTitle')} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <TestimonialCard key={idx} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr,2fr]">
          <SectionHeading title={t('sections.faqTitle')} align="left" />
          <FAQAccordion categories={faqs} />
        </div>
      </section>

      <CTA />
    </>
  )
}
