import { useState } from 'react'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import ResourceCard from '../components/ResourceCard'
import EmptyState from '../components/EmptyState'
import FilterBar from '../components/FilterBar'
import Quiz from '../components/Quiz'
import { resources } from '../data/resources'
import { questions } from '../data/questions'
import { classes } from '../data/classes'
import { subjects } from '../data/subjects'

export default function Questions() {
  const questionResources = resources.filter((r) => ['Questions', 'Important Questions', 'MCQ'].includes(r.resourceType))
  const [values, setValues] = useState({ class: '', board: '', subject: '' })

  const quizQuestions = questions.filter((q) => {
    if (values.class && q.classSlug !== values.class) return false
    if (values.board && q.board !== values.board) return false
    if (values.subject && q.subject !== values.subject) return false
    return true
  })

  return (
    <>
      <SEO title="Questions" description="Practice questions, important questions and interactive MCQs across classes and subjects." />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Questions' }]} />
      <div className="container-page py-14 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">Questions</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          Practice questions, important questions, chapter-wise MCQs and an interactive quiz to test your understanding.
        </p>

        <section className="mt-10">
          <h2 className="mb-5 text-xl font-bold text-navy-900 dark:text-white">Question Banks</h2>
          {questionResources.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {questionResources.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          ) : (
            <EmptyState title="No question sets yet" message="Question banks will be added here soon." />
          )}
        </section>

        <section className="mt-14">
          <h2 className="mb-5 text-xl font-bold text-navy-900 dark:text-white">Interactive Quiz</h2>
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
          <Quiz questions={quizQuestions} key={JSON.stringify(values)} />
        </section>
      </div>
    </>
  )
}
