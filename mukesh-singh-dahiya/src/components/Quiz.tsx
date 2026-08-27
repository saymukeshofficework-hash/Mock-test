import { useState } from 'react'
import type { Question } from '../data/types'
import Icon from './Icon'
import EmptyState from './EmptyState'

export default function Quiz({ questions }: { questions: Question[] }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  if (questions.length === 0) {
    return <EmptyState title="No questions available" message="Questions for the selected filters will be added here soon." icon="check" />
  }

  const q = questions[index]

  function select(i: number) {
    if (selected !== null) return
    setSelected(i)
    if (i === q.answer) setScore((s) => s + 1)
  }

  function next() {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1)
      setSelected(null)
    } else {
      setFinished(true)
    }
  }

  function restart() {
    setIndex(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <div className="card flex flex-col items-center gap-4 p-10 text-center">
        <h3 className="text-2xl font-bold text-navy-900 dark:text-white">Quiz Complete</h3>
        <p className="text-slate-600 dark:text-slate-300">
          You scored <span className="font-bold text-brand-600 dark:text-cyan-400">{score}</span> out of {questions.length}
        </p>
        <button onClick={restart} className="btn-primary">
          Restart Quiz
        </button>
      </div>
    )
  }

  return (
    <div className="card p-5 sm:p-8">
      <div className="mb-5 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <span>Score: {score}</span>
      </div>
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-navy-800">
        <div
          className="h-full rounded-full bg-brand-600 transition-all dark:bg-cyan-400"
          style={{ width: `${((index + (selected !== null ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>
      <h3 className="mb-5 text-lg font-semibold text-navy-900 dark:text-white">{q.question}</h3>
      <div className="flex flex-col gap-3">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.answer
          const isSelected = i === selected
          let style = 'border-slate-200 dark:border-navy-700 hover:border-brand-400'
          if (selected !== null) {
            if (isCorrect) style = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
            else if (isSelected) style = 'border-rose-400 bg-rose-50 dark:bg-rose-500/10'
          }
          return (
            <button
              key={i}
              onClick={() => select(i)}
              disabled={selected !== null}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium text-navy-800 transition dark:text-slate-100 ${style}`}
            >
              {opt}
              {selected !== null && isCorrect && <Icon name="check" className="h-4 w-4 text-emerald-600" />}
            </button>
          )
        })}
      </div>
      {selected !== null && (
        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-navy-800 dark:text-slate-300">
          <p className="mb-1 font-semibold text-navy-800 dark:text-slate-100">Explanation</p>
          {q.explanation}
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <button onClick={next} disabled={selected === null} className="btn-primary disabled:cursor-not-allowed disabled:opacity-40">
          {index + 1 === questions.length ? 'Finish' : 'Next Question'}
        </button>
      </div>
    </div>
  )
}
