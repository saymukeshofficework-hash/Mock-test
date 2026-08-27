import { useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Badge from '../components/Badge'
import EnrollmentCTA from '../components/EnrollmentCTA'
import NotFound from './NotFound'
import { getPaidNote } from '../data/paidNotes'
import { getClass } from '../data/classes'

export default function PaidNoteDetail() {
  const { slug = '' } = useParams()
  const note = getPaidNote(slug)
  if (!note) return <NotFound />
  const cls = getClass(note.classSlug)

  return (
    <>
      <SEO title={note.title} description={note.description} />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Paid Notes', to: '/paid-notes' }, { label: note.title }]} />
      <div className="container-page py-14 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {cls && <Badge tone="brand">{cls.label}</Badge>}
              <Badge>{note.board}</Badge>
              {note.chapter && <Badge>{note.chapter}</Badge>}
            </div>
            <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">{note.title}</h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300">{note.description}</p>
          </div>
          <div className="card p-6">
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-navy-900 dark:text-white">₹{note.discountPrice ?? note.price}</span>
              {note.discountPrice && <span className="text-slate-400 line-through">₹{note.price}</span>}
            </div>
            <EnrollmentCTA status="Enrollment Open" price={note.price} discountPrice={note.discountPrice} />
          </div>
        </div>
      </div>
    </>
  )
}
