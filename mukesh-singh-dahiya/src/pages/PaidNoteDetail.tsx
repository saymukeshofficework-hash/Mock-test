import { useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Badge from '../components/Badge'
import PriceTag from '../components/PriceTag'
import EnrollmentCTA from '../components/EnrollmentCTA'
import Icon from '../components/Icon'
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
      <div className="container-page py-14 pb-24 sm:pb-16">
        <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2">
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <Badge tone="gold">Premium Notes</Badge>
              {cls && <Badge tone="brand">{cls.label}</Badge>}
              <Badge>{note.board}</Badge>
              {note.chapter && <Badge>{note.chapter}</Badge>}
              {note.format && <Badge tone="slate">{note.format}</Badge>}
            </div>
            <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">{note.title}</h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300">{note.description}</p>

            {note.whatsIncluded && note.whatsIncluded.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-lg font-bold text-navy-900 dark:text-white">What's Included</h2>
                <ul className="space-y-2">
                  {note.whatsIncluded.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-navy-700 dark:text-slate-200">
                      <Icon name="check" className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="card border-gold-400/20 p-6">
            <PriceTag pricing={note} size="lg" />
            <div className="mt-4">
              <EnrollmentCTA kind="note" data={note} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-navy-700 dark:bg-navy-900/95 sm:hidden">
        <PriceTag pricing={note} size="sm" />
        <EnrollmentCTA kind="note" data={note} compact />
      </div>
    </>
  )
}
