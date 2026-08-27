import { useState } from 'react'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import FilterBar from '../components/FilterBar'
import EmptyState from '../components/EmptyState'
import { classes } from '../data/classes'
import { subjects } from '../data/subjects'
import { previousPapers } from '../data/previousPapers'

export default function PreviousPapers() {
  const [values, setValues] = useState({ class: '', board: '', subject: '' })

  const filtered = previousPapers.filter((p) => {
    if (values.class && p.classSlug !== values.class) return false
    if (values.board && p.board !== values.board) return false
    if (values.subject && p.subject !== values.subject) return false
    return true
  })

  return (
    <>
      <SEO title="Previous Papers" description="Previous examination papers organized by class, board, subject and year." />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Previous Papers' }]} />
      <div className="container-page py-14 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">Previous Papers</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          Browse previous examination papers organized by Class → Board → Subject → Year.
        </p>

        <div className="mt-8">
          <FilterBar
            filters={[
              { key: 'class', label: 'Class', options: classes.map((c) => ({ value: c.slug, label: c.label })) },
              { key: 'board', label: 'Board', options: [{ value: 'CBSE', label: 'CBSE' }, { value: 'MP Board', label: 'MP Board' }] },
              { key: 'subject', label: 'Subject', options: subjects.map((s) => ({ value: s.slug, label: s.name })) },
            ]}
            values={values}
            onChange={(key, value) => setValues((v) => ({ ...v, [key]: value }))}
            onReset={() => setValues({ class: '', board: '', subject: '' })}
          />
        </div>

        {filtered.length ? (
          <ul className="space-y-3">
            {filtered.map((p) => (
              <li key={p.id} className="card p-4">
                {p.title} — {p.year}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Previous examination papers will be added here" message="Real previous examination papers for this class, board and subject will be uploaded soon." icon="book" />
        )}
      </div>
    </>
  )
}
