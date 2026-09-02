import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Icon from '../components/Icon'
import NotFound from './NotFound'
import { getLabExperiment, labExperiments } from '../data/virtualLab'
import MicroscopeView from '../components/3d/MicroscopeView'
import CellModel3D from '../components/3d/CellModel3D'
import DnaHelix3D from '../components/3d/DnaHelix3D'
import StomataModel3D from '../components/3d/StomataModel3D'
import FlowerModel3D from '../components/3d/FlowerModel3D'

export default function VirtualLabExperiment() {
  const { experimentId = '' } = useParams<{ experimentId: string }>()
  const exp = getLabExperiment(experimentId)

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)

  if (!exp) {
    return <NotFound />
  }

  const handleSelectAnswer = (qIndex: number, optIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optIndex }))
  }

  const otherExperiments = labExperiments.filter((e) => e.id !== exp.id)

  return (
    <>
      <SEO
        title={`${exp.title} — 3D Virtual Biology Lab`}
        description={exp.description}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Virtual Biology Lab', to: '/virtual-lab' },
          { label: exp.title },
        ]}
      />

      <div className="container-custom py-6 lg:py-10">
        {/* Top Header Bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 dark:border-navy-800">
          <div>
            <div className="flex items-center gap-2">
              <Link
                to="/virtual-lab"
                className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-cyan-400"
              >
                <Icon name="arrowLeft" className="h-3.5 w-3.5" />
                <span>All Lab Stations</span>
              </Link>
              <span className="text-slate-300">/</span>
              <span className="rounded bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700 dark:bg-navy-800 dark:text-cyan-300">
                {exp.category}
              </span>
            </div>
            <h1 className="mt-1 font-serif text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">
              {exp.title}
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              {exp.subtitle}
            </p>
          </div>

          {/* Applicable Classes */}
          <div className="flex flex-wrap gap-1">
            {exp.classes.map((c) => (
              <span
                key={c}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm dark:border-navy-700 dark:bg-navy-900 dark:text-slate-300"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* 3D Workbench Active Apparatus */}
        <section aria-label="3D Workbench Simulation" className="mb-10">
          {exp.id === 'microscope' && <MicroscopeView />}
          {exp.id === 'cell' && <CellModel3D />}
          {exp.id === 'dna' && <DnaHelix3D />}
          {exp.id === 'stomata' && <StomataModel3D />}
          {exp.id === 'flower' && <FlowerModel3D />}
        </section>

        {/* Comprehensive Lab Manual & Theory */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left 2 Columns: Aim, Principle, Procedure, Observations */}
          <div className="space-y-6 lg:col-span-2">
            {/* Aim & Principle */}
            <div className="card p-6">
              <h2 className="font-serif text-lg font-bold text-navy-900 dark:text-white border-b border-slate-100 pb-3 dark:border-navy-800">
                Experiment Aim & Scientific Principle
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                <div>
                  <strong className="text-navy-900 dark:text-white block font-semibold text-xs uppercase tracking-wider text-brand-600 dark:text-cyan-400 mb-1">
                    Aim:
                  </strong>
                  <p>{exp.aim}</p>
                </div>
                <div>
                  <strong className="text-navy-900 dark:text-white block font-semibold text-xs uppercase tracking-wider text-brand-600 dark:text-cyan-400 mb-1">
                    Underlying Principle:
                  </strong>
                  <p>{exp.principle}</p>
                </div>
              </div>
            </div>

            {/* Materials & Procedure */}
            <div className="card p-6">
              <h2 className="font-serif text-lg font-bold text-navy-900 dark:text-white border-b border-slate-100 pb-3 dark:border-navy-800">
                Materials & Step-by-Step Procedure
              </h2>

              <div className="mt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Materials Required:
                </h3>
                <ul className="grid gap-1.5 sm:grid-cols-2 text-xs text-slate-700 dark:text-slate-200">
                  {exp.materials.map((m, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Standard Operating Protocol:
                </h3>
                <ol className="space-y-2.5 text-xs text-slate-700 dark:text-slate-200">
                  {exp.procedure.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 font-bold text-brand-700 dark:bg-navy-800 dark:text-cyan-400">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed mt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Observations & Precautions */}
            <div className="card p-6">
              <h2 className="font-serif text-lg font-bold text-navy-900 dark:text-white border-b border-slate-100 pb-3 dark:border-navy-800">
                Key Observations & Practical Precautions
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-500/20 dark:bg-emerald-950/10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    What to Look For (Observations):
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                    {exp.observations.map((obs, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Icon name="check" className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 dark:border-amber-500/20 dark:bg-amber-950/10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    Critical Precautions:
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                    {exp.precautions.map((prec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">!</span>
                        <span>{prec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Teacher Note & Self-Check Quiz */}
          <div className="space-y-6">
            {/* Teacher Notes */}
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-amber-100/40 p-6 shadow-sm dark:border-amber-500/30 dark:from-amber-950/20 dark:to-navy-900">
              <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-white">
                  <Icon name="sparkles" className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold">Mukesh Sir’s Practical Advice</h3>
                  <p className="text-[10px] text-amber-700/80 dark:text-amber-400">Board & NEET Examiner Insight</p>
                </div>
              </div>
              <p className="mt-3.5 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                {exp.teacherNotes}
              </p>
            </div>

            {/* Interactive Viva / Quiz */}
            <div className="card p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-navy-800">
                <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white">
                  Self-Check Viva Questions
                </h3>
                <span className="rounded bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700 dark:bg-navy-800 dark:text-cyan-300">
                  {exp.quiz.length} MCQs
                </span>
              </div>

              <div className="mt-4 space-y-5">
                {exp.quiz.map((q, qIdx) => {
                  const userAns = selectedAnswers[qIdx]
                  const isCorrect = userAns === q.answer
                  return (
                    <div key={qIdx} className="rounded-xl border border-slate-100 p-3.5 dark:border-navy-800">
                      <p className="text-xs font-bold text-navy-900 dark:text-white">
                        {qIdx + 1}. {q.question}
                      </p>
                      <div className="mt-2 space-y-1.5">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAns === optIdx
                          let optStyle =
                            'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-navy-700 dark:bg-navy-900 dark:text-slate-200'
                          if (showResults) {
                            if (optIdx === q.answer) {
                              optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 font-bold'
                            } else if (isSelected && !isCorrect) {
                              optStyle = 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                            }
                          } else if (isSelected) {
                            optStyle = 'border-brand-600 bg-brand-50 text-brand-800 dark:border-cyan-400 dark:bg-cyan-950 dark:text-cyan-300 font-bold'
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectAnswer(qIdx, optIdx)}
                              className={`flex w-full items-center justify-between rounded-lg border px-3 py-1.5 text-left text-xs transition-all ${optStyle}`}
                            >
                              <span>{opt}</span>
                              {showResults && optIdx === q.answer && (
                                <Icon name="check" className="h-3.5 w-3.5 text-emerald-600" />
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {showResults && (
                        <p className="mt-2.5 rounded bg-slate-50 p-2 text-[11px] text-slate-600 dark:bg-navy-800/60 dark:text-slate-300 border-l-2 border-brand-500">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setShowResults(!showResults)}
                  className="btn-secondary w-full justify-center text-xs py-2"
                >
                  {showResults ? 'Hide Answers' : 'Check Answers & Explanations'}
                </button>
              </div>
            </div>

            {/* Other Lab Stations Quick Links */}
            <div className="card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Other Lab Stations:
              </h3>
              <div className="space-y-2">
                {otherExperiments.map((other) => (
                  <Link
                    key={other.id}
                    to={`/virtual-lab/${other.slug}`}
                    className="flex items-center justify-between rounded-lg p-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-navy-800"
                  >
                    <span className="flex items-center gap-2">
                      <Icon name={other.icon} className="h-4 w-4 text-brand-600 dark:text-cyan-400" />
                      <span>{other.title}</span>
                    </span>
                    <Icon name="chevronRight" className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
