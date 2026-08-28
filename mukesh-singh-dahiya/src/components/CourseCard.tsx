import { Link } from 'react-router-dom'
import type { Course } from '../data/types'
import Badge from './Badge'
import PriceTag from './PriceTag'
import { getClass } from '../data/classes'

const statusTone = {
  'Enrollment Open': 'green',
  'Coming Soon': 'gold',
  'Enrollment Closed': 'slate',
} as const

export default function CourseCard({ course }: { course: Course }) {
  const cls = course.classSlug ? getClass(course.classSlug) : undefined
  return (
    <Link
      to={`/courses/${course.slug}`}
      className="card group flex flex-col gap-3 border-navy-800 bg-navy-900 p-5 hover:border-gold-400/40 hover:shadow-glow-gold"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone="gold">Premium</Badge>
        {cls && <Badge tone="slate">{cls.label}</Badge>}
        {course.board && <Badge tone="slate">{course.board}</Badge>}
        <Badge tone={statusTone[course.status]}>{course.status}</Badge>
      </div>
      <h3 className="font-bold leading-snug text-white">{course.title}</h3>
      <p className="line-clamp-2 text-sm text-slate-300">{course.description}</p>
      <p className="text-xs font-medium text-slate-400">{course.modules.length} modules{course.duration ? ` · ${course.duration}` : ''}</p>
      <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3">
        <PriceTag pricing={course} onDark />
        <span className="text-sm font-semibold text-gold-400 group-hover:text-gold-300">View Course →</span>
      </div>
    </Link>
  )
}
