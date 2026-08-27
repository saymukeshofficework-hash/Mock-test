import { useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Badge from '../components/Badge'
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

      <div className="border-b border-slate-200 bg-slate-50 dark:border-navy-800 dark:bg-navy-900/40">
        <div className="container-page grid gap-8 py-12 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {cls && <Badge tone="brand">{cls.label}</Badge>}
              {course.board && <Badge>{course.board}</Badge>}
              {course.level && <Badge>{course.level}</Badge>}
            </div>
            <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">{course.title}</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">{course.description}</p>
            {course.duration && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Duration: {course.duration}</p>}
          </div>
          <div className="card p-6">
            <div className="mb-4 flex items-baseline gap-2">
              {course.discountPrice ? (
                <>
                  <span className="text-3xl font-bold text-navy-900 dark:text-white">₹{course.discountPrice}</span>
                  <span className="text-slate-400 line-through">₹{course.price}</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-navy-900 dark:text-white">₹{course.price}</span>
              )}
            </div>
            <EnrollmentCTA status={course.status} price={course.price} discountPrice={course.discountPrice} />
          </div>
        </div>
      </div>

      <div className="container-page py-14">
        <h2 className="mb-6 text-2xl font-bold text-navy-900 dark:text-white">Curriculum</h2>
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
    </>
  )
}
