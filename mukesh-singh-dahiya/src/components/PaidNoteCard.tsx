import { Link } from 'react-router-dom'
import type { PaidNote } from '../data/types'
import Badge from './Badge'
import { getClass } from '../data/classes'

export default function PaidNoteCard({ note }: { note: PaidNote }) {
  const cls = getClass(note.classSlug)
  return (
    <Link to={`/paid-notes/${note.slug}`} className="card flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-card-lg">
      <div className="flex flex-wrap items-center gap-1.5">
        {cls && <Badge>{cls.label}</Badge>}
        <Badge>{note.board}</Badge>
        <Badge tone="gold">Premium</Badge>
      </div>
      <h3 className="font-bold leading-snug text-navy-900 dark:text-white">{note.title}</h3>
      <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{note.description}</p>
      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-navy-900 dark:text-white">₹{note.discountPrice ?? note.price}</span>
          {note.discountPrice && <span className="text-sm text-slate-400 line-through">₹{note.price}</span>}
        </span>
        <span className="text-sm font-semibold text-brand-600 dark:text-cyan-400">View →</span>
      </div>
    </Link>
  )
}
