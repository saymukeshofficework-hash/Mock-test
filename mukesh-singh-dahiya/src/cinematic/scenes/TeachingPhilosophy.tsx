import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PRINCIPLES = [
  { n: '01', title: 'Curious', desc: 'Encourage questions.' },
  { n: '02', title: 'Clear', desc: 'Make complex ideas easier to understand.' },
  { n: '03', title: 'Connected', desc: 'Connect concepts with meaningful understanding.' },
  { n: '04', title: 'Consistent', desc: 'Build learning through regular practice.' },
  { n: '05', title: 'Confident', desc: 'Help learners approach challenges with confidence.' },
]

export default function TeachingPhilosophy({ reduced }: { reduced: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rootRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.philosophy-row',
        { opacity: 0, x: reduced ? 0 : -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          stagger: 0.12,
          scrollTrigger: { trigger: rootRef.current, start: 'top 65%' },
        }
      )
    }, rootRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <div ref={rootRef} id="teaching" className="scene-teacher relative px-6 py-28">
      <div className="mx-auto max-w-3xl">
        <p className="c-eyebrow mb-4 text-center">Teaching Philosophy</p>
        <h2 className="c-huge c-serif text-center text-4xl sm:text-5xl">How I Teach</h2>
        <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {PRINCIPLES.map((p) => (
            <div key={p.n} className="philosophy-row flex flex-col gap-2 py-6 sm:flex-row sm:items-baseline sm:gap-8">
              <span className="c-serif text-sm text-[color:var(--c-ink-faint)] sm:w-12">{p.n}</span>
              <h3 className="c-serif c-huge text-3xl sm:w-56 sm:text-4xl">{p.title}</h3>
              <span className="text-[color:var(--c-ink-dim)]">{p.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
