import { Link } from 'react-router-dom'
import type { Subject } from '../data/types'

export default function SubjectCard({ subject, classSlug }: { subject: Subject; classSlug?: string }) {
  const to = classSlug ? `/classes/${classSlug}/${subject.slug}` : `/subjects/${subject.slug}`
  return (
    <Link to={to} className="card flex flex-col gap-2 p-5">
      <h3 className="font-bold text-navy-900 dark:text-white">{subject.name}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{subject.description}</p>
    </Link>
  )
}
