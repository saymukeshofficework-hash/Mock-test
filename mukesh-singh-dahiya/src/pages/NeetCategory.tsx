import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import ResourceCard from '../components/ResourceCard'
import EmptyState from '../components/EmptyState'
import { botanyCategories, zoologyCategories } from '../data/neet'
import { resources } from '../data/resources'

export default function NeetCategory({ kind }: { kind: 'botany' | 'zoology' }) {
  const categories = kind === 'botany' ? botanyCategories : zoologyCategories
  const label = kind === 'botany' ? 'Botany' : 'Zoology'
  const relatedResources = resources.filter((r) => r.subject === 'biology' && r.classSlug === 'class-12')

  return (
    <>
      <SEO title={`NEET ${label}`} description={`NEET ${label} topics, notes and questions — updated as content is added.`} />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'NEET', to: '/neet' }, { label }]} />
      <div className="container-page py-14 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">NEET {label}</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">Core {label.toLowerCase()} categories for NEET preparation.</p>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <div key={c} className="card p-4 text-center text-sm font-semibold text-navy-800 dark:text-slate-100">
              {c}
            </div>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="mb-5 text-xl font-bold text-navy-900 dark:text-white">Related Resources</h2>
          {relatedResources.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedResources.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          ) : (
            <EmptyState title="No resources yet" message={`NEET ${label} resources will be added here soon.`} icon="leaf" />
          )}
        </section>
      </div>
    </>
  )
}
