import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { classes } from '../../data/classes'
import { calculators } from '../../data/calculators'

gsap.registerPlugin(ScrollTrigger)

const RESOURCES = [
  { to: '/notes', title: 'Notes', desc: 'Chapter-wise study notes.' },
  { to: '/previous-papers', title: 'Previous Papers', desc: 'Board exam previous year papers.' },
  { to: '/questions', title: 'Practice Questions', desc: 'Important questions by chapter.' },
  { to: '/neet', title: 'NEET Biology', desc: 'Dedicated Botany and Zoology resources.' },
  { to: '/calculators', title: 'Calculators', desc: `${calculators.length} educational calculators.` },
  { to: '/classes', title: 'Classes', desc: `${classes.length} classes, 5 through 12.` },
]

export default function ResourcesFinale({ reduced }: { reduced: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rootRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.resource-card',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, scrollTrigger: { trigger: '.resource-grid', start: 'top 78%' } }
      )
      gsap.fromTo(
        '.contact-copy > *',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, scrollTrigger: { trigger: '.contact-copy', start: 'top 75%' } }
      )
      gsap.fromTo(
        '.signature-mark',
        { opacity: 0, scale: reduced ? 1 : 0.9 },
        { opacity: 1, scale: 1, duration: 0.9, scrollTrigger: { trigger: '.signature-mark', start: 'top 85%' } }
      )
      gsap.fromTo(
        '.signature-name',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.7, delay: reduced ? 0 : 0.25, scrollTrigger: { trigger: '.signature-mark', start: 'top 85%' } }
      )
    }, rootRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <div ref={rootRef}>
      <div id="resources" className="scene-teacher relative px-6 py-28">
        <div className="mx-auto max-w-5xl">
          <p className="c-eyebrow mb-4 text-center">Learning Resources</p>
          <h2 className="c-huge c-serif mb-14 text-center text-4xl sm:text-5xl">Everything to keep learning.</h2>
          <div className="resource-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RESOURCES.map((r) => (
              <Link
                key={r.to}
                to={r.to}
                data-cursor="hover"
                className="resource-card group relative overflow-hidden rounded-xl border border-white/10 p-6 transition-colors duration-300 hover:border-[color:var(--c-accent)]"
              >
                <h3 className="c-serif block text-xl font-bold">{r.title}</h3>
                <span className="mt-2 block text-sm text-[color:var(--c-ink-dim)]">{r.desc}</span>
                <span className="mt-6 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--c-ink-faint)] transition-all duration-300 group-hover:gap-2 group-hover:text-[color:var(--c-accent)]">
                  Explore <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div id="contact" className="scene-teacher relative flex min-h-[80vh] flex-col items-center justify-center px-6 py-24 text-center">
        <div className="contact-copy">
          <h2 className="c-huge c-serif text-[13vw] sm:text-6xl">
            Let's keep
            <span className="c-accent-text block">learning.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[color:var(--c-ink-dim)]">
            Teaching is a journey of continuous learning.
          </p>
          <Link
            to="/contact"
            data-cursor="cta"
            data-cursor-label="Contact"
            className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:border-[color:var(--c-accent)] hover:text-[color:var(--c-accent)]"
          >
            Get in Touch <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <div className="signature-mark relative flex flex-col items-center gap-3 px-6 pb-20 pt-4 text-center opacity-0">
        <span className="c-huge c-serif c-accent-text text-3xl sm:text-4xl">MSD</span>
        <span className="signature-name c-serif text-sm uppercase tracking-[0.3em] text-[color:var(--c-ink-dim)] opacity-0">
          Mukesh Dahiya
        </span>
      </div>
    </div>
  )
}
