import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { site } from '../../data/site'

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 37) % 96}%`,
  top: `${(i * 53) % 92}%`,
  size: i % 4 === 0 ? 3 : 2,
  delay: `${(i * 0.6) % 6}s`,
  duration: `${10 + (i % 5) * 2}s`,
}))

export default function Hero({ play, reduced }: { play: boolean; reduced: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!play || !rootRef.current) return
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(['.hero-label', '.hero-line', '.hero-sub', '.hero-cta'], { opacity: 1, y: 0, clipPath: 'inset(0 0% 0 0)' })
        return
      }
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo('.hero-bg-glow', { opacity: 0 }, { opacity: 1, duration: 1.4 })
        .fromTo('.hero-label', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.9')
        .fromTo(
          '.hero-line',
          { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
          { clipPath: 'inset(0 0% 0 0)', duration: 1, stagger: 0.18 },
          '-=0.2'
        )
        .fromTo('.hero-sub', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.3')
        .fromTo('.hero-cta', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.35')
        .fromTo('.hero-scroll', { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.2')
    }, rootRef)
    return () => ctx.revert()
  }, [play, reduced])

  return (
    <section id="home" ref={rootRef} className="scene-teacher relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="hero-bg-glow pointer-events-none absolute inset-0 opacity-0" aria-hidden="true">
        <div
          className="absolute left-1/2 top-1/3 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]"
          style={{ background: 'radial-gradient(circle, var(--c-accent-soft), transparent 70%)' }}
        />
        <div className="c-particle-field">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="c-particle"
              style={{ left: p.left, top: p.top, width: p.size, height: p.size, animationDelay: p.delay, animationDuration: p.duration }}
            />
          ))}
        </div>
      </div>

      <p className="hero-label c-eyebrow relative mb-6">Teacher • Mentor • Lifelong Learner</p>

      <h1 className="relative">
        <span className="hero-line c-huge c-serif block text-[15vw] sm:text-[9vw] lg:text-[7.5vw]">MUKESH</span>
        <span className="hero-line c-huge c-serif block text-[15vw] sm:text-[9vw] lg:text-[7.5vw] c-accent-text">SINGH DAHIYA</span>
      </h1>

      <p className="hero-sub relative mt-8 max-w-xl text-sm text-[color:var(--c-ink-dim)] sm:text-base">
        {site.qualifications}
      </p>

      <a
        href="#classroom"
        data-cursor="cta"
        data-cursor-label="Explore"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('classroom')?.scrollIntoView({ behavior: 'smooth' })
        }}
        className="hero-cta relative mt-10 inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--c-ink)] transition-colors hover:border-[color:var(--c-accent)] hover:text-[color:var(--c-accent)]"
      >
        Explore the Journey
        <span aria-hidden="true">↓</span>
      </a>

      <div className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0" aria-hidden="true">
        <span className="block h-10 w-px animate-pulse bg-gradient-to-b from-[color:var(--c-ink-faint)] to-transparent" />
      </div>
    </section>
  )
}
