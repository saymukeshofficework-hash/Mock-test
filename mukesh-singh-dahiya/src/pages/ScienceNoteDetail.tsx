import { Link, useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Icon from '../components/Icon'
import NotFound from './NotFound'
import {
  getScienceClass,
  getScienceNote,
  getAdjacentScienceNotes,
  getRelatedScienceNotes,
} from '../data/scienceNotes'
import { contact } from '../config/contact'

export default function ScienceNoteDetail() {
  const { classSlug = '', chapterSlug = '' } = useParams<{
    classSlug: string
    chapterSlug?: string
    subjectSlug?: string
  }>()

  const cls = getScienceClass(classSlug)
  const note = getScienceNote(classSlug, chapterSlug)

  if (!cls || !note) {
    return <NotFound />
  }

  const { prev, next } = getAdjacentScienceNotes(classSlug, note.slug)
  const related = getRelatedScienceNotes(note)
  const isSenior = cls.classSlug === 'class-11' || cls.classSlug === 'class-12'

  // WhatsApp inquiry for study assistance or PDF requests
  const waMessage = encodeURIComponent(
    `Hello Mukesh Sir! I am studying Class ${cls.numeral} ${note.subjectName} - "${note.chapterName}". I would like more information/study guidance regarding these notes.`
  )
  const waLink = `https://wa.me/${contact.whatsapp}?text=${waMessage}`

  return (
    <>
      <SEO
        title={`${note.chapterName} — Class ${cls.numeral} Science Notes`}
        description={note.shortDescription}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Science Notes', to: '/learn/science' },
          { label: `Class ${cls.numeral}`, to: `/learn/science/${cls.classSlug}` },
          ...(isSenior ? [{ label: note.subjectName }] : []),
          { label: note.chapterName },
        ]}
      />

      {/* Note Header */}
      <article className="border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 py-10 dark:border-navy-800 dark:from-navy-950 dark:via-navy-900/60 dark:to-navy-900 sm:py-14">
        <div className="container-page max-w-4xl">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-navy-900 px-2.5 py-1 text-xs font-bold text-cyan-400 dark:bg-cyan-400 dark:text-navy-950">
              Class {cls.numeral}
            </span>
            <span className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 dark:bg-cyan-950/60 dark:text-cyan-300">
              {note.subjectName}
            </span>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-navy-800 dark:text-slate-300">
              Chapter {note.chapterNumber}
            </span>
            <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-navy-700 dark:bg-navy-800 dark:text-slate-300">
              CBSE & MP Board
            </span>
          </div>

          {/* Heading */}
          <h1 className="mt-4 font-serif text-3xl font-extrabold text-navy-900 dark:text-white sm:text-4xl lg:text-5xl">
            {note.chapterName}
          </h1>

          <p className="mt-3 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            {note.shortDescription}
          </p>

          {/* Quick Page Anchors if available */}
          {note.status === 'available' && (
            <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200/80 dark:border-navy-800/80 text-xs font-semibold">
              <span className="text-slate-400">Quick Jump:</span>
              <a href="#overview" className="rounded-lg bg-white px-3 py-1.5 text-slate-700 shadow-sm hover:text-brand-600 border border-slate-200 dark:bg-navy-800 dark:text-slate-200 dark:border-navy-700 dark:hover:text-cyan-400">
                Overview
              </a>
              <a href="#topics" className="rounded-lg bg-white px-3 py-1.5 text-slate-700 shadow-sm hover:text-brand-600 border border-slate-200 dark:bg-navy-800 dark:text-slate-200 dark:border-navy-700 dark:hover:text-cyan-400">
                Topics Covered
              </a>
              <a href="#key-points" className="rounded-lg bg-white px-3 py-1.5 text-slate-700 shadow-sm hover:text-brand-600 border border-slate-200 dark:bg-navy-800 dark:text-slate-200 dark:border-navy-700 dark:hover:text-cyan-400">
                Key Points
              </a>
              {note.definitions && note.definitions.length > 0 && (
                <a href="#definitions" className="rounded-lg bg-white px-3 py-1.5 text-slate-700 shadow-sm hover:text-brand-600 border border-slate-200 dark:bg-navy-800 dark:text-slate-200 dark:border-navy-700 dark:hover:text-cyan-400">
                  Definitions
                </a>
              )}
              {note.formulas && note.formulas.length > 0 && (
                <a href="#formulas" className="rounded-lg bg-white px-3 py-1.5 text-slate-700 shadow-sm hover:text-brand-600 border border-slate-200 dark:bg-navy-800 dark:text-slate-200 dark:border-navy-700 dark:hover:text-cyan-400">
                  Formulas & Reactions
                </a>
              )}
              <a href="#exam-points" className="rounded-lg bg-white px-3 py-1.5 text-slate-700 shadow-sm hover:text-brand-600 border border-slate-200 dark:bg-navy-800 dark:text-slate-200 dark:border-navy-700 dark:hover:text-cyan-400">
                Exam Tips
              </a>
            </div>
          )}
        </div>
      </article>

      {/* Main Content Body */}
      <main className="container-page max-w-4xl py-12 sm:py-16">
        {/* If note is coming soon / placeholder */}
        {note.status === 'coming-soon' ? (
          <div className="space-y-8">
            <div className="card p-8 text-center border-dashed border-2 border-brand-200 bg-brand-50/30 dark:border-cyan-500/30 dark:bg-cyan-950/20">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-cyan-900/50 dark:text-cyan-300">
                <Icon name="clock" className="h-7 w-7" />
              </div>
              <h2 className="mt-4 font-serif text-2xl font-bold text-navy-900 dark:text-white">
                Detailed Notes In Preparation
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-300">
                The comprehensive revision notes, solved examples, and exam pointers for{' '}
                <strong className="text-navy-900 dark:text-white">Chapter {note.chapterNumber}: {note.chapterName}</strong> are
                being curated and verified by Mukesh Dahiya according to the latest NCERT syllabus.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary !bg-emerald-600 hover:!bg-emerald-700"
                >
                  <Icon name="whatsapp" className="h-4 w-4" />
                  <span>Ask Mukesh Sir on WhatsApp</span>
                </a>
                <Link to={`/learn/science/${cls.classSlug}`} className="btn-secondary">
                  <span>Browse Other Chapters</span>
                </Link>
              </div>
            </div>

            {/* Syllabus & Core Topics for this chapter */}
            <section className="card p-6 sm:p-8">
              <span className="section-label">Curriculum Scope</span>
              <h3 className="mt-1 font-serif text-xl font-bold text-navy-900 dark:text-white">
                Core Topics in this Chapter
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                These topics are essential for your school tests, terminal exams, and board preparations:
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {note.topics.map((t, idx) => (
                  <div
                    key={t.id}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-navy-800 dark:bg-navy-900/50"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-cyan-950 dark:text-cyan-400">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-navy-900 dark:text-white">{t.title}</h4>
                      {t.description && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          /* Available Full Note Content */
          <div className="space-y-12">
            {/* 1. Chapter Overview */}
            {note.overview && (
              <section id="overview" className="card p-6 sm:p-8 scroll-mt-24">
                <span className="section-label">Chapter Overview</span>
                <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900 dark:text-white">
                  Introduction & Conceptual Foundation
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-700 dark:text-slate-200">
                  {note.overview}
                </p>
              </section>
            )}

            {/* 2. Important Topics */}
            <section id="topics" className="card p-6 sm:p-8 scroll-mt-24">
              <div className="flex items-center gap-2 text-brand-600 dark:text-cyan-400">
                <Icon name="book" className="h-5 w-5" />
                <span className="section-label">Syllabus Breakdown</span>
              </div>
              <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900 dark:text-white">
                Key Topics Covered
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {note.topics.map((t, idx) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:bg-slate-50 dark:border-navy-700/80 dark:bg-navy-800/40 dark:hover:bg-navy-800/70"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-500 text-[11px] font-bold text-white dark:bg-cyan-400 dark:text-navy-950">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-navy-900 dark:text-white">{t.title}</h3>
                    </div>
                    {t.description && (
                      <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                        {t.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Key Points */}
            <section id="key-points" className="card p-6 sm:p-8 scroll-mt-24 border-l-4 border-l-brand-600 dark:border-l-cyan-400">
              <div className="flex items-center gap-2">
                <Icon name="sparkles" className="h-5 w-5 text-brand-600 dark:text-cyan-400" />
                <span className="section-label">Revision Essentials</span>
              </div>
              <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900 dark:text-white">
                Important Key Points
              </h2>
              <ul className="mt-6 space-y-3.5">
                {note.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                      <Icon name="check" className="h-3 w-3" />
                    </span>
                    <span className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 4. Important Definitions */}
            {note.definitions && note.definitions.length > 0 && (
              <section id="definitions" className="card p-6 sm:p-8 scroll-mt-24">
                <div className="flex items-center gap-2">
                  <Icon name="graduation" className="h-5 w-5 text-brand-600 dark:text-cyan-400" />
                  <span className="section-label">Scientific Terminology</span>
                </div>
                <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900 dark:text-white">
                  Important Definitions
                </h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {note.definitions.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-900"
                    >
                      <span className="inline-block rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700 dark:bg-cyan-950/80 dark:text-cyan-300">
                        {item.term}
                      </span>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 5. Formulas & Chemical Reactions */}
            {note.formulas && note.formulas.length > 0 && (
              <section id="formulas" className="card p-6 sm:p-8 scroll-mt-24 bg-gradient-to-br from-slate-900 to-navy-950 text-white dark:border-navy-700">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Icon name="atom" className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Formulas & Equations
                  </span>
                </div>
                <h2 className="mt-1 font-serif text-2xl font-bold text-white">
                  Important Formulas & Chemical Equations
                </h2>
                <div className="mt-6 space-y-4">
                  {note.formulas.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-colors hover:border-cyan-400/40"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <span className="text-xs font-semibold text-cyan-300">{item.label}</span>
                        {item.explanation && (
                          <span className="text-[11px] text-slate-400">{item.explanation}</span>
                        )}
                      </div>
                      <div className="mt-2 rounded-lg bg-black/40 px-3.5 py-2.5 font-mono text-sm font-medium tracking-wide text-amber-300 overflow-x-auto">
                        {item.formula}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 6. Exam / Revision Points */}
            <section id="exam-points" className="card p-6 sm:p-8 scroll-mt-24 border-l-4 border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/10">
              <div className="flex items-center gap-2">
                <Icon name="shield" className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  High-Yield Scoring Tips
                </span>
              </div>
              <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900 dark:text-white">
                Exam & Board Revision Points
              </h2>
              <ul className="mt-6 space-y-3">
                {note.examPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                      <Icon name="check" className="h-3 w-3" />
                    </span>
                    <span className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {/* Previous & Next Chapter Navigation */}
        <div className="mt-12 border-t border-slate-200 pt-8 dark:border-navy-800">
          <div className="grid gap-4 sm:grid-cols-2">
            {prev ? (
              <Link
                to={`/learn/science/${cls.classSlug}/${prev.slug}`}
                className="card group flex items-center gap-3 p-4 transition-all hover:border-brand-400"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600 dark:bg-navy-800 dark:text-slate-300">
                  <Icon name="arrowLeft" className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Previous Chapter
                  </span>
                  <span className="font-serif text-sm font-bold text-navy-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-cyan-300 truncate block">
                    Ch {prev.chapterNumber}: {prev.chapterName}
                  </span>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {next ? (
              <Link
                to={`/learn/science/${cls.classSlug}/${next.slug}`}
                className="card group flex items-center justify-end gap-3 p-4 text-right transition-all hover:border-brand-400"
              >
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Next Chapter
                  </span>
                  <span className="font-serif text-sm font-bold text-navy-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-cyan-300 truncate block">
                    Ch {next.chapterNumber}: {next.chapterName}
                  </span>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600 dark:bg-navy-800 dark:text-slate-300">
                  <Icon name="arrowRight" className="h-4 w-4" />
                </div>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* Related Notes Grid */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-slate-200 pt-10 dark:border-navy-800">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="section-label">Continue Learning</span>
                <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
                  Related Science Notes
                </h3>
              </div>
              <Link
                to={`/learn/science/${cls.classSlug}`}
                className="text-xs font-semibold text-brand-600 hover:underline dark:text-cyan-400"
              >
                View all Class {cls.numeral} notes →
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/learn/science/${rel.classSlug}/${rel.slug}`}
                  className="card group p-4 transition-all hover:shadow-card-lg"
                >
                  <span className="text-xs font-bold text-brand-600 dark:text-cyan-400">
                    Chapter {rel.chapterNumber}
                  </span>
                  <h4 className="mt-1 font-serif text-sm font-bold text-navy-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-cyan-300 line-clamp-1">
                    {rel.chapterName}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {rel.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  )
}
