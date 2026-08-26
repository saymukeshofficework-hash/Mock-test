import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import SectionHeading from '../components/SectionHeading'
import CourseCard from '../components/CourseCard'
import CTA from '../components/CTA'
import { useLanguage } from '../i18n/LanguageContext'
import { allCourses, learningLevels } from '../data/courses'

export default function Courses() {
  const { t } = useLanguage()

  return (
    <>
      <PageHero eyebrow={t('nav.courses')} title={t('sections.coursesTitle')} description={t('sections.coursesSubtitle')} />

      <section className="bg-white py-16">
        <div className="container-page flex flex-col gap-8">
          <SectionHeading title={t('sections.learningLevelsTitle')} />
          <ol className="flex flex-wrap items-center justify-center gap-3">
            {learningLevels.map((level, idx) => (
              <li key={level} id={level.toLowerCase()} className="flex scroll-mt-24 items-center gap-3">
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

      <section className="bg-soft-gradient py-20">
        <div className="container-page flex flex-col gap-10">
          <SectionHeading title={t('nav.courses')} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
