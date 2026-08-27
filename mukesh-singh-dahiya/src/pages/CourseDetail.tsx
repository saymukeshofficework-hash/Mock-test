import { useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Badge from '../components/Badge'
import PriceTag from '../components/PriceTag'
import EnrollmentCTA from '../components/EnrollmentCTA'
import Icon from '../components/Icon'
import NotFound from './NotFound'
import { getCourse } from '../data/courses'
import { getClass } from '../data/classes'

export default function CourseDetail() {
  const { slug = '' } = useParams()
  const course = getCourse(slug)
  if (!course) return <NotFound />
  const cls = course.classSlug ? getClass(course.classSlug) : undefined

  return (
    <>
      <SEO title={course.title} description={course.description} />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Courses', to: '/courses' }, { label: course.title }]} />

      <div className="border-b border-navy-800 bg-navy-900">
        <div className="container-page grid gap-8 py-12 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2">
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <Badge tone="gold">Premium</Badge>
              {cls && <Badge tone="slate">{cls.label}</Badge>}
              {course.board && <Badge tone="slate">{course.board}</Badge>}
              {course.level && course.level !== cls?.label && <Badge tone="slate">{course.level}</Badge>}
            </div>
            <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl">{course.title}</h1>
            <p className="mt-3 text-slate-300">{course.description}</p>
            {course.duration && <p className="mt-2 text-sm text-slate-400">Duration: {course.duration}</p>}
          </div>
          <div className="card border-gold-400/20 bg-white p-6 dark:bg-navy-800">
            <PriceTag pricing={course} size="lg" />
            <div className="mt-4">
              <EnrollmentCTA kind="course" data={course} status={course.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-14 pb-24 sm:pb-14">
        {course.whatsIncluded && course.whatsIncluded.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-5 text-xl font-bold text-navy-900 dark:text-white">What's Included</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {course.whatsIncluded.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-navy-700 dark:text-slate-200">
                  <Icon name="check" className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        <h2 className="mb-6 text-2xl font-bold text-navy-900 dark:text-white">Course Curriculum</h2>
        <div className="space-y-4">
          {course.modules.map((mod) => (
            <div key={mod.title} className="card p-5">
              <h3 className="mb-3 font-bold text-navy-900 dark:text-white">{mod.title}</h3>
              <ul className="space-y-2">
                {mod.lessons.map((lesson) => (
                  <li key={lesson.title} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm dark:bg-navy-800">
                    <span className="text-navy-700 dark:text-slate-200">{lesson.title}</span>
                    {lesson.access === 'free' ? (
                      <Badge tone="green">Free Preview</Badge>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                        <Icon name="lock" className="h-3.5 w-3.5" /> Available after enrollment
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile sticky bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-navy-700 dark:bg-navy-900/95 sm:hidden">
        <PriceTag pricing={course} size="sm" />
        <EnrollmentCTA kind="course" data={course} status={course.status} compact />
      </div>
    </>
  )
}
