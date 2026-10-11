// "Assignment last date" band with a live countdown. Shown on the notes page (full) and
// the combo page (short). It disappears by itself once the deadline has passed.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deadline, product } from '../config'
import { useLang } from '../i18n'

function useRemaining(target: number): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return Math.max(0, target - now)
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function DeadlineSection({ variant, onBuy }: { variant: 'notes' | 'combo'; onBuy: () => void }) {
  const { t } = useLang()
  const d = t.deadline
  const ms = useRemaining(deadline.at)
  if (ms <= 0) return null

  const s = Math.floor(ms / 1000)
  const cells: [number, string][] = [
    [Math.floor(s / 86400), d.units.d],
    [Math.floor((s % 86400) / 3600), d.units.h],
    [Math.floor((s % 3600) / 60), d.units.m],
    [s % 60, d.units.s],
  ]
  const full = variant === 'notes'

  return (
    <section className="border-y border-saffron-400/40 bg-saffron-500/10" aria-labelledby="deadline-title">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <p className="inline-block rounded-full bg-ink-900 px-3 py-1 text-xs font-bold text-saffron-400">{d.kicker}</p>
        <h2 id="deadline-title" className="mt-4 max-w-3xl font-serif text-[1.7rem] font-semibold leading-snug text-ink-900 sm:text-4xl">
          {full ? d.title : d.comboTitle}
        </h2>

        <p className="mt-6 text-sm font-semibold text-ink-700">{d.left}</p>
        <div className="mt-2 grid max-w-md grid-cols-4 gap-2 sm:gap-3" role="timer" aria-label={d.left}>
          {cells.map(([v, label]) => (
            <div key={label} className="rounded-xl bg-ink-900 px-1 py-3 text-center">
              <div className="font-serif text-3xl font-bold tabular-nums text-saffron-400 sm:text-4xl">{pad(v)}</div>
              <div className="mt-0.5 text-[11px] text-ink-300 sm:text-xs">{label}</div>
            </div>
          ))}
        </div>

        {full ? (
          <>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-paper-200 bg-paper-50 p-5 sm:p-6">
                <h3 className="font-serif text-xl font-semibold text-ink-900">{d.featuresTitle}</h3>
                <ul className="mt-3 space-y-2.5">
                  {d.features.map((x) => (
                    <li key={x} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-800">
                      <span className="mt-0.5 flex-none text-leaf-500" aria-hidden>✓</span>{x}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-paper-200 bg-paper-50 p-5 sm:p-6">
                <h3 className="font-serif text-xl font-semibold text-ink-900">{d.factsTitle}</h3>
                <dl className="mt-3 grid grid-cols-2 gap-2.5">
                  {d.facts.map((f) => (
                    <div key={f.l} className="rounded-xl bg-paper-100 p-3">
                      <dt className="font-serif text-2xl font-bold text-ink-900">{f.n}</dt>
                      <dd className="text-[13px] text-ink-700">{f.l}</dd>
                    </div>
                  ))}
                </dl>
                <ul className="mt-4 space-y-1.5 text-[14.5px] text-ink-700">
                  {d.points.map((x) => <li key={x}>• {x}</li>)}
                </ul>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-paper-200 bg-paper-50 p-5 sm:p-6">
              <h3 className="font-serif text-xl font-semibold text-ink-900">{d.useTitle}</h3>
              <ol className="mt-3 grid gap-3 sm:grid-cols-2">
                {d.use.map((x, i) => (
                  <li key={x} className="flex gap-3 text-[15px] leading-relaxed text-ink-800">
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-saffron-500 text-sm font-bold text-ink-950">{i + 1}</span>
                    {x}
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-4 rounded-2xl bg-ink-900 p-5 text-paper-50 sm:p-6">
              <h3 className="font-serif text-xl font-semibold text-saffron-400">{d.summaryTitle}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-paper-100">{d.summary}</p>
            </div>
          </>
        ) : (
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-800">{d.comboBody}</p>
        )}

        <div className="mt-10 rounded-3xl bg-saffron-500 px-5 py-8 text-center text-ink-950 sm:px-8 sm:py-10">
          <h3 className="font-serif text-2xl font-semibold sm:text-3xl">{full ? d.urgentTitle : d.comboUrgentTitle}</h3>
          <p className="mx-auto mt-2 max-w-xl text-[15px] leading-relaxed">{full ? d.urgentBody : d.comboUrgentBody}</p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={onBuy}
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-ink-900 px-8 text-base font-bold text-paper-50 shadow-lg transition hover:bg-ink-800 sm:w-auto">
              {full ? d.cta : d.comboCta}
            </button>
            {!full && (
              <Link to="/" className="text-sm font-semibold underline">{d.comboNotes} ({product.priceDisplay})</Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
