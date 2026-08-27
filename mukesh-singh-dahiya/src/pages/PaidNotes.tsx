import { useState } from 'react'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import PaidNoteCard from '../components/PaidNoteCard'
import FilterBar from '../components/FilterBar'
import EmptyState from '../components/EmptyState'
import { classes } from '../data/classes'
import { subjects } from '../data/subjects'
import { paidNotes } from '../data/paidNotes'

export default function PaidNotes() {
  const [values, setValues] = useState({ class: '', board: '', subject: '' })
  const filtered = paidNotes.filter((n) => {
    if (values.class && n.classSlug !== values.class) return false
    if (values.board && n.board !== values.board) return false
    if (values.subject && n.subject !== values.subject) return false
    return true
  })

  return (
    <>
      <SEO title="Paid Notes" description="Premium, exam-focused notes available for purchase, class-wise and subject-wise." />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Paid Notes' }]} />
      <div className="container-page py-14 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">Paid Notes</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">Premium, exam-focused notes available for purchase.</p>

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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((n) => (
              <PaidNoteCard key={n.id} note={n} />
            ))}
          </div>
        ) : (
          <EmptyState title="No premium notes found" message="No premium notes found for the selected filters." />
        )}
      </div>
    </>
  )
}
