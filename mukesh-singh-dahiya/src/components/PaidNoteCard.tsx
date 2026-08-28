import { Link } from 'react-router-dom'
import type { PaidNote } from '../data/types'
import Badge from './Badge'
import PriceTag from './PriceTag'
import { getClass } from '../data/classes'

export default function PaidNoteCard({ note }: { note: PaidNote }) {
  const cls = getClass(note.classSlug)
  return (
    <Link to={`/paid-notes/${note.slug}`} className="card flex flex-col gap-3 p-5">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone="gold">Premium Notes</Badge>
        {cls && <Badge>{cls.label}</Badge>}
        <Badge>{note.board}</Badge>
      </div>
      <h3 className="font-bold leading-snug text-navy-900 dark:text-white">{note.title}</h3>
      <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{note.description}</p>
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 dark:border-navy-700">
        <PriceTag pricing={note} />
        <span className="text-sm font-semibold text-brand-600 dark:text-cyan-400">View →</span>
      </div>
    </Link>
  )
}
