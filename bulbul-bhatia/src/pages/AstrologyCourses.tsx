import PageHero from '../components/PageHero'
import CourseCard from '../components/CourseCard'
import CTA from '../components/CTA'
import { useLanguage } from '../i18n/LanguageContext'
import { astrologyCourses } from '../data/courses'

export default function AstrologyCourses() {
  const { t } = useLanguage()

  return (
    <>
      <PageHero eyebrow={t('nav.courses')} title={t('footer.astrologyCourses')} description={t('sections.coursesSubtitle')} />
      <section className="bg-white py-20">
        <div className="container-page">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {astrologyCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </>
  )
}
