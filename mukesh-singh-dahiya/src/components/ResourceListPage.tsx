import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SEO from './SEO'
import Breadcrumbs from './Breadcrumbs'
import ResourceCard from './ResourceCard'
import FilterBar from './FilterBar'
import EmptyState from './EmptyState'
import type { Resource, ResourceType } from '../data/types'
import { resources } from '../data/resources'
import { classes } from '../data/classes'
import { subjects } from '../data/subjects'

export default function ResourceListPage({
  title,
  description,
  resourceTypes,
  breadcrumbLabel,
}: {
  title: string
  description: string
  resourceTypes?: ResourceType[]
  breadcrumbLabel: string
}) {
  const [searchParams] = useSearchParams()
  const [values, setValues] = useState<Record<string, string>>({
    class: '',
    board: '',
    subject: '',
    type: searchParams.get('type') ?? '',
    access: '',
  })

  const base = useMemo(() => (resourceTypes ? resources.filter((r) => resourceTypes.includes(r.resourceType)) : resources), [resourceTypes])

  const filtered = base.filter((r: Resource) => {
    if (values.class && r.classSlug !== values.class) return false
    if (values.board && r.board !== values.board) return false
    if (values.subject && r.subject !== values.subject) return false
    if (values.type && r.resourceType !== values.type) return false
    if (values.access && r.access !== values.access) return false
    return true
  })

  const typeOptions = resourceTypes ?? Array.from(new Set(base.map((r) => r.resourceType)))

  return (
    <>
      <SEO title={title} description={description} />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: breadcrumbLabel }]} />
      <div className="container-page py-14 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{description}</p>

        <div className="mt-8">
          <FilterBar
            filters={[
              { key: 'class', label: 'Class', options: classes.map((c) => ({ value: c.slug, label: c.label })) },
              { key: 'board', label: 'Board', options: [{ value: 'CBSE', label: 'CBSE' }, { value: 'MP Board', label: 'MP Board' }] },
              { key: 'subject', label: 'Subject', options: subjects.map((s) => ({ value: s.slug, label: s.name })) },
              ...(resourceTypes ? [] : [{ key: 'type', label: 'Type', options: typeOptions.map((t) => ({ value: t, label: t })) }]),
              { key: 'access', label: 'Access', options: [{ value: 'free', label: 'Free' }, { value: 'paid', label: 'Premium' }] },
            ]}
            values={values}
            onChange={(key, value) => setValues((v) => ({ ...v, [key]: value }))}
            onReset={() => setValues({ class: '', board: '', subject: '', type: '', access: '' })}
          />
        </div>

        {filtered.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        ) : (
          <EmptyState title="No resources found" message="No resources found for the selected filters. Try adjusting or resetting your filters." />
        )}
      </div>
    </>
  )
}
