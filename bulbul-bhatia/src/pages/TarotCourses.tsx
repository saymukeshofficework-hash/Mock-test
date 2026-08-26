import PageHero from '../components/PageHero'
import CourseCard from '../components/CourseCard'
import CTA from '../components/CTA'
import { useLanguage } from '../i18n/LanguageContext'
import { tarotCourses } from '../data/courses'

export default function TarotCourses() {
  const { t } = useLanguage()

  return (
    <>
      <PageHero eyebrow={t('nav.courses')} title={t('footer.tarotCourses')} description={t('sections.coursesSubtitle')} />
      <section className="bg-white py-20">
        <div className="container-page">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tarotCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </>
  )
}
