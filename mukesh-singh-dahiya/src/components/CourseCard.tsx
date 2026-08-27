import { Link } from 'react-router-dom'
import type { Course } from '../data/types'
import Badge from './Badge'
import { getClass } from '../data/classes'

const statusTone = {
  'Enrollment Open': 'green',
  'Coming Soon': 'gold',
  'Enrollment Closed': 'slate',
} as const

export default function CourseCard({ course }: { course: Course }) {
  const cls = course.classSlug ? getClass(course.classSlug) : undefined
  return (
    <Link to={`/courses/${course.slug}`} className="card flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-card-lg">
      <div className="flex flex-wrap items-center gap-1.5">
        {cls && <Badge>{cls.label}</Badge>}
        {course.board && <Badge>{course.board}</Badge>}
        <Badge tone={statusTone[course.status]}>{course.status}</Badge>
      </div>
      <h3 className="font-bold leading-snug text-navy-900 dark:text-white">{course.title}</h3>
      <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{course.description}</p>
      <div className="mt-auto flex items-center justify-between pt-2">
        <div>
          {course.discountPrice ? (
            <span className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-navy-900 dark:text-white">₹{course.discountPrice}</span>
              <span className="text-sm text-slate-400 line-through">₹{course.price}</span>
            </span>
          ) : (
            <span className="text-lg font-bold text-navy-900 dark:text-white">₹{course.price}</span>
          )}
        </div>
        <span className="text-sm font-semibold text-brand-600 dark:text-cyan-400">View Course →</span>
      </div>
    </Link>
  )
}
