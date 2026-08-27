import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import ResourceCard from '../components/ResourceCard'
import EmptyState from '../components/EmptyState'
import { resources } from '../data/resources'

export default function NeetNotes() {
  const notes = resources.filter((r) => r.subject === 'biology' && r.resourceType === 'Notes')

  return (
    <>
      <SEO title="NEET Notes" description="NEET Biology notes covering Botany and Zoology chapters." />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'NEET', to: '/neet' }, { label: 'Notes' }]} />
      <div className="container-page py-14 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">NEET Notes</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">Concept notes for NEET Botany and Zoology chapters.</p>
        <div className="mt-10">
          {notes.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          ) : (
            <EmptyState title="No NEET notes yet" message="NEET notes will be added here soon." />
          )}
        </div>
      </div>
    </>
  )
}
