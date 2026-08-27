import { useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Badge, { AccessBadge } from '../components/Badge'
import ResourceCard from '../components/ResourceCard'
import EmptyState from '../components/EmptyState'
import Icon from '../components/Icon'
import NotFound from './NotFound'
import { getResource, relatedResources } from '../data/resources'
import { getClass } from '../data/classes'
import { getSubject } from '../data/subjects'

export default function ResourceDetail() {
  const { slug = '' } = useParams()
  const resource = getResource(slug)
  if (!resource) return <NotFound />

  const cls = getClass(resource.classSlug)
  const subject = getSubject(resource.subject)
  const related = relatedResources(resource)

  return (
    <>
      <SEO title={resource.title} description={resource.description} />
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Resources', to: '/resources' },
          ...(cls ? [{ label: cls.label, to: `/classes/${cls.slug}` }] : []),
          { label: resource.title },
        ]}
      />
      <div className="container-page py-14 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            <Badge tone="brand">{resource.resourceType}</Badge>
            {cls && <Badge>{cls.label}</Badge>}
            <Badge>{resource.board}</Badge>
            {subject && <Badge>{subject.name}</Badge>}
            <AccessBadge access={resource.access} />
          </div>
          <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">{resource.title}</h1>
          {resource.chapter && <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">Chapter: {resource.chapter}</p>}
          <p className="mt-4 text-slate-600 dark:text-slate-300">{resource.description}</p>

          <div className="card mt-8 flex flex-col items-center gap-3 p-10 text-center">
            <Icon name="book" className="h-8 w-8 text-brand-600 dark:text-cyan-300" />
            {resource.access === 'free' ? (
              <>
                <p className="font-semibold text-navy-900 dark:text-white">Preview / download will appear here once the file is uploaded.</p>
                <button className="btn-primary" disabled>
                  Open Resource
                </button>
              </>
            ) : (
              <>
                <p className="font-semibold text-navy-900 dark:text-white">This is a premium resource.</p>
                <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  Full content is available after enrollment. Online payment is not yet enabled — use the Contact page for now.
                </p>
              </>
            )}
          </div>

          <section className="mt-14">
            <h2 className="mb-5 text-xl font-bold text-navy-900 dark:text-white">Related Resources</h2>
            {related.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((r) => (
                  <ResourceCard key={r.id} resource={r} />
                ))}
              </div>
            ) : (
              <EmptyState title="No related resources yet" message="Related resources will appear here as more content is added." />
            )}
          </section>
        </div>
      </div>
    </>
  )
}
