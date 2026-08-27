import { useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import ResourceCard from '../components/ResourceCard'
import EmptyState from '../components/EmptyState'
import Badge from '../components/Badge'
import NotFound from './NotFound'
import { getClass } from '../data/classes'
import { getSubject, subjectsForClass } from '../data/subjects'
import { resources } from '../data/resources'

export default function SubjectPage() {
  const { classSlug, subjectSlug = '' } = useParams()
  const subject = getSubject(subjectSlug)
  const cls = classSlug ? getClass(classSlug) : undefined

  if (!subject || (classSlug && !cls)) return <NotFound />
  if (cls && !subjectsForClass(cls.slug).some((s) => s.slug === subject.slug)) return <NotFound />

  const filtered = resources.filter((r) => r.subject === subject.slug && (!cls || r.classSlug === cls.slug))
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, r) => {
    acc[r.resourceType] = acc[r.resourceType] ? [...acc[r.resourceType], r] : [r]
    return acc
  }, {})

  return (
    <>
      <SEO
        title={cls ? `${cls.label} ${subject.name}` : subject.name}
        description={`${subject.name}${cls ? ` for ${cls.label}` : ''} — notes, solutions, questions and previous papers.`}
      />
      <Breadcrumbs
        items={
          cls
            ? [{ label: 'Home', to: '/' }, { label: 'Classes', to: '/classes' }, { label: cls.label, to: `/classes/${cls.slug}` }, { label: subject.name }]
            : [{ label: 'Home', to: '/' }, { label: 'Subjects', to: '/subjects' }, { label: subject.name }]
        }
      />
      <div className="container-page py-14 sm:py-16">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">
            {cls ? `${cls.label} — ${subject.name}` : subject.name}
          </h1>
          {cls && <Badge tone="brand">{cls.label}</Badge>}
        </div>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{subject.description}</p>

        <div className="mt-10">
          {Object.keys(grouped).length ? (
            Object.entries(grouped).map(([type, items]) => (
              <section key={type} className="mb-12">
                <h2 className="mb-5 text-xl font-bold text-navy-900 dark:text-white">{type}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((r) => (
                    <ResourceCard key={r.id} resource={r} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <EmptyState title="No resources yet" message="Study material for this subject will be added here soon." />
          )}
        </div>
      </div>
    </>
  )
}
