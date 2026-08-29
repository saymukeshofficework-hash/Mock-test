import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { site } from '../../data/site'
import { asset } from '../../lib/publicBase'

gsap.registerPlugin(ScrollTrigger)

const STAGES = ['Learn', 'Teach', 'Mentor', 'Inspire']

export default function AboutExperience({ reduced }: { reduced: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rootRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.about-photo',
        { opacity: 0, scale: reduced ? 1 : 1.08, clipPath: 'inset(6% 6% 6% 6%)' },
        {
          opacity: 1,
          scale: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.about-photo', start: 'top 80%' },
        }
      )
      gsap.fromTo(
        '.about-copy > *',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, scrollTrigger: { trigger: '.about-copy', start: 'top 78%' } }
      )

      if (!reduced) {
        gsap.to('.about-photo img', {
          scale: 1.08,
          ease: 'none',
          scrollTrigger: { trigger: '.about-photo', start: 'top bottom', end: 'bottom top', scrub: true },
        })
      }

      gsap.to('.timeline-line-fill', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: '.timeline-track', start: 'top 75%', end: 'bottom 60%', scrub: 0.6 },
      })
      gsap.fromTo(
        '.timeline-stage',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, scrollTrigger: { trigger: '.timeline-track', start: 'top 70%' } }
      )
    }, rootRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <div ref={rootRef} id="about" className="scene-teacher relative px-6 py-28">
      <div className="mx-auto grid max-w-5xl items-center gap-14 lg:grid-cols-2">
        <div>
          <p className="c-eyebrow mb-4">The Person</p>
          <h2 className="c-huge c-serif text-4xl sm:text-5xl">
            Behind the <span className="c-accent-text">Teacher</span>
          </h2>
          <div className="about-copy mt-8 space-y-5 text-[color:var(--c-ink-dim)]">
            <p>{site.bio}</p>
            <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--c-ink-faint)]">{site.scope}</p>
          </div>
        </div>
        <div className="about-photo relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-white/10">
          <img
            src={asset(site.teacherImage)}
            alt={`${site.name} — ${site.title}`}
            className="h-full w-full object-cover object-top grayscale contrast-[1.05]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      </div>

      <div className="mx-auto mt-28 max-w-3xl text-center">
        <span className="c-huge c-serif c-accent-text block text-[5rem] sm:text-[7rem]">12+</span>
        <p className="c-eyebrow mb-10">Years of Teaching</p>

        <div className="timeline-track relative mx-auto flex max-w-2xl items-start justify-between">
          <div className="absolute left-0 right-0 top-3 h-px bg-white/10" aria-hidden="true">
            <div className="timeline-line-fill h-full origin-left scale-x-0" style={{ background: 'var(--c-accent)' }} />
          </div>
          {STAGES.map((stage) => (
            <div key={stage} className="timeline-stage relative flex flex-col items-center gap-2 px-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--c-accent)' }} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--c-ink-dim)] sm:text-sm">{stage}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
