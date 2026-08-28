import { Link } from 'react-router-dom'
import type { Resource } from '../data/types'
import Badge, { AccessBadge } from './Badge'
import { getClass } from '../data/classes'

export default function ResourceCard({ resource }: { resource: Resource }) {
  const cls = getClass(resource.classSlug)
  return (
    <Link
      to={`/resources/${resource.slug}`}
      className="card flex flex-col gap-3 p-5"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone="brand">{resource.resourceType}</Badge>
        {cls && <Badge>{cls.label}</Badge>}
        <Badge>{resource.board}</Badge>
        <AccessBadge access={resource.access} />
      </div>
      <h3 className="font-bold leading-snug text-navy-900 dark:text-white">{resource.title}</h3>
      <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{resource.description}</p>
      {resource.chapter && <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Chapter: {resource.chapter}</p>}
    </Link>
  )
}
