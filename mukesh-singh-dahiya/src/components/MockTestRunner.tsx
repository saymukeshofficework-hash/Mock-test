import { useEffect, useState } from 'react'
import type { MockTest } from '../data/types'
import Icon from './Icon'

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0')
  const s = Math.max(0, totalSeconds % 60)
    .toString()
    .padStart(2, '0')
  return `${m}:${s}`
}

export default function MockTestRunner({ test }: { test: MockTest }) {
  const total = test.questions.length
  const duration = test.durationMinutes * 60

  const [studentName, setStudentName] = useState('')
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(total).fill(null))
  const [marked, setMarked] = useState<boolean[]>(() => Array(total).fill(false))
  const [visited, setVisited] = useState<boolean[]>(() => Array(total).fill(false))
  const [timeLeft, setTimeLeft] = useState(duration)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!started || submitted) return
    if (timeLeft <= 0) {
      setSubmitted(true)
      return
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [started, submitted, timeLeft])

  function start() {
    setVisited((v) => v.map((val, i) => (i === 0 ? true : val)))
    setStarted(true)
  }

  function goTo(i: number) {
    setCurrent(i)
    setVisited((v) => v.map((val, idx) => (idx === i ? true : val)))
  }

  function select(i: number) {
    setAnswers((a) => a.map((val, idx) => (idx === current ? i : val)))
  }

  function clear() {
    setAnswers((a) => a.map((val, idx) => (idx === current ? null : val)))
  }

  function toggleMark() {
    setMarked((m) => m.map((val, idx) => (idx === current ? !val : val)))
    goNext()
  }

  function goNext() {
    if (current < total - 1) goTo(current + 1)
  }

  function goPrev() {
    if (current > 0) goTo(current - 1)
  }

  function submit() {
    if (confirm('Are you sure you want to submit the test?')) {
      setSubmitted(true)
    }
  }

  function retake() {
    setStarted(false)
    setCurrent(0)
    setAnswers(Array(total).fill(null))
    setMarked(Array(total).fill(false))
    setVisited(Array(total).fill(false))
    setTimeLeft(duration)
    setSubmitted(false)
  }

  if (submitted) {
    let correct = 0
    let wrong = 0
    let skipped = 0
    test.questions.forEach((q, i) => {
      if (answers[i] === null) skipped++
      else if (answers[i] === q.answer) correct++
      else wrong++
    })
    const pct = Math.round((correct / total) * 100)

    return (
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-navy-900 to-navy-700 px-6 py-8 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{test.title}</p>
          {studentName && <p className="mt-2 text-sm font-medium opacity-90">{studentName}</p>}
          <p className="mt-2 text-5xl font-extrabold">{correct}</p>
          <p className="mt-1 text-sm opacity-80">out of {total}</p>
          <span className="mt-4 inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold">{pct}% Score</span>
        </div>
        <div className="p-5 sm:p-8">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-emerald-50 py-3 dark:bg-emerald-500/10">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{correct}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Correct</p>
            </div>
            <div className="rounded-xl bg-rose-50 py-3 dark:bg-rose-500/10">
              <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{wrong}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Wrong</p>
            </div>
            <div className="rounded-xl bg-slate-100 py-3 dark:bg-navy-800">
              <p className="text-lg font-bold text-slate-600 dark:text-slate-300">{skipped}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Skipped</p>
            </div>
          </div>

          <p className="mt-6 mb-3 text-sm text-slate-500 dark:text-slate-400">Tap a question below to see the correct answer and explanation.</p>
          <div className="flex flex-col gap-2">
            {test.questions.map((q, i) => {
              const chosen = answers[i]
              const isCorrect = chosen === q.answer
              const tagStyle =
                chosen === null
                  ? 'bg-slate-400'
                  : isCorrect
                    ? 'bg-emerald-500'
                    : 'bg-rose-500'
              const tagLabel = chosen === null ? 'Skipped' : isCorrect ? 'Correct' : 'Wrong'
              return (
                <details key={q.id} className="rounded-xl border border-slate-200 px-4 py-3 dark:border-navy-700">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-navy-800 dark:text-slate-100">
                    <span>Q{i + 1}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${tagStyle}`}>{tagLabel}</span>
                  </summary>
                  <p className="mt-3 text-sm font-medium text-navy-900 dark:text-white">{q.question}</p>
                  <div className="mt-3 flex flex-col gap-1.5">
                    {q.options.map((opt, idx) => {
                      let style = 'border-slate-200 dark:border-navy-700'
                      if (idx === q.answer) style = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                      else if (idx === chosen) style = 'border-rose-400 bg-rose-50 dark:bg-rose-500/10'
                      return (
                        <div key={idx} className={`rounded-lg border px-3 py-1.5 text-sm text-navy-800 dark:text-slate-100 ${style}`}>
                          {String.fromCharCode(65 + idx)}) {opt}
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-navy-800 dark:text-slate-400">{q.explanation}</p>
                </details>
              )
            })}
          </div>

          <button onClick={retake} className="btn-primary mt-6 w-full">
            Retake Test
          </button>
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-cyan-300">
          <Icon name="clock" className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-navy-900 dark:text-white">{test.title}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {total} Questions &middot; {test.durationMinutes} Minutes
        </p>
        <div className="mt-6 text-left">
          <label htmlFor="studentName" className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
            Your Name (optional)
          </label>
          <input
            id="studentName"
            type="text"
            className="input"
            placeholder="e.g. Riya Sharma"
            maxLength={60}
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />
        </div>
        <button onClick={start} className="btn-primary mt-6 w-full">
          Start Test
        </button>
      </div>
    )
  }

  const q = test.questions[current]
  const warn = timeLeft <= 60

  return (
    <div className="card overflow-hidden">
      {studentName && (
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-2 text-sm dark:border-navy-700 dark:bg-navy-950/40">
          <span className="text-slate-500 dark:text-slate-400">Candidate</span>
          <span className="font-semibold text-navy-900 dark:text-white">{studentName}</span>
        </div>
      )}
      <div className={`flex items-center justify-between px-5 py-3 text-white ${warn ? 'bg-rose-600' : 'bg-brand-600'}`}>
        <span className="flex items-center gap-2 text-sm font-medium">
          <Icon name="clock" className="h-4 w-4" />
          Time Left
        </span>
        <span className="rounded-md bg-black/25 px-3 py-1 font-mono text-sm font-bold tabular-nums">{formatTime(timeLeft)}</span>
      </div>

      <div className="grid grid-cols-8 gap-1.5 border-b border-slate-200 bg-slate-50 p-3 sm:grid-cols-10 dark:border-navy-700 dark:bg-navy-950/40">
        {test.questions.map((_, i) => {
          let style = 'border-slate-200 bg-white text-navy-800 dark:border-navy-700 dark:bg-navy-900 dark:text-slate-100'
          if (answers[i] !== null) style = 'border-emerald-500 bg-emerald-500 text-white'
          else if (visited[i]) style = 'border-rose-500 bg-rose-500 text-white'
          if (marked[i]) style = 'border-violet-500 bg-violet-500 text-white'
          const ring = i === current ? 'ring-2 ring-navy-900 ring-offset-1 dark:ring-cyan-400' : ''
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`flex aspect-square items-center justify-center rounded-md border text-xs font-bold ${style} ${ring}`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3 border-b border-slate-200 px-4 py-2 text-xs text-slate-500 dark:border-navy-700 dark:text-slate-400">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />Answered</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-rose-500" />Not Answered</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-violet-500" />Marked</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border border-slate-300 dark:border-navy-600" />Not Visited</span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-bold text-navy-900 dark:text-white">
            Q {current + 1} of {total}
          </span>
        </div>
        <p className="mb-5 text-base font-semibold leading-relaxed text-navy-900 dark:text-white">{q.question}</p>
        <div className="flex flex-col gap-3">
          {q.options.map((opt, i) => (
            <label
              key={i}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                answers[current] === i
                  ? 'border-brand-500 bg-brand-50 dark:border-cyan-400 dark:bg-brand-500/10'
                  : 'border-slate-200 dark:border-navy-700'
              }`}
            >
              <input type="radio" className="mt-0.5" checked={answers[current] === i} onChange={() => select(i)} />
              <span className="text-navy-800 dark:text-slate-100">
                {String.fromCharCode(65 + i)}) {opt}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3 px-5 pb-3 sm:px-6">
        <button onClick={clear} className="btn-secondary flex-1 text-sm">
          Clear Response
        </button>
        <button onClick={toggleMark} className="btn-secondary flex-1 text-sm">
          Mark &amp; Next
        </button>
      </div>
      <div className="flex gap-3 px-5 pb-3 sm:px-6">
        <button onClick={goPrev} disabled={current === 0} className="btn-secondary flex-1 text-sm disabled:cursor-not-allowed disabled:opacity-40">
          &lsaquo; Previous
        </button>
        <button onClick={goNext} disabled={current === total - 1} className="btn-primary flex-1 text-sm disabled:cursor-not-allowed disabled:opacity-40">
          Save &amp; Next &rsaquo;
        </button>
      </div>
      <div className="px-5 pb-5 sm:px-6">
        <button onClick={submit} className="w-full rounded-lg bg-navy-900 py-3 text-sm font-bold text-white transition hover:bg-navy-800 dark:bg-cyan-500 dark:text-navy-950 dark:hover:bg-cyan-400">
          Submit Test
        </button>
      </div>
    </div>
  )
}
