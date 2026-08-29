import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const BOTANY_MARKS = ['🌿', 'Botany', 'M.Sc.', 'Leaf', 'Stem', 'Growth']
const ENGLISH_MARKS = ['English', 'M.A.', 'Word', 'Voice', 'Story', 'Aa']

export default function SubjectFusion({ reduced }: { reduced: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(['.fusion-left', '.fusion-right'], { x: 0 })
        gsap.set('.fusion-center', { opacity: 1, scale: 1 })
        return
      }
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=120%',
          scrub: 0.6,
          pin: true,
        },
      })
      tl.fromTo('.fusion-left', { xPercent: -60, opacity: 0.4 }, { xPercent: 0, opacity: 1, ease: 'none' })
        .fromTo('.fusion-right', { xPercent: 60, opacity: 0.4 }, { xPercent: 0, opacity: 1, ease: 'none' }, '<')
        .fromTo('.fusion-center', { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.4 }, '-=0.15')
    }, sectionRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <div ref={sectionRef} className="scene-botany relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 py-24">
      <div className="relative grid w-full max-w-5xl grid-cols-2 items-center gap-4">
        <div className="fusion-left flex flex-col items-end gap-4 pr-4 text-right sm:pr-10">
          <p className="c-eyebrow">M.Sc. Botany</p>
          {BOTANY_MARKS.map((m, i) => (
            <span
              key={i}
              className="c-serif text-[color:var(--c-ink-dim)]"
              style={{ fontSize: `${1.6 - i * 0.12}rem`, opacity: 1 - i * 0.1 }}
            >
              {m}
            </span>
          ))}
        </div>
        <div className="fusion-right flex flex-col items-start gap-4 pl-4 sm:pl-10">
          <p className="c-eyebrow">M.A. English</p>
          {ENGLISH_MARKS.map((m, i) => (
            <span
              key={i}
              className="c-serif text-[color:var(--c-ink-dim)]"
              style={{ fontSize: `${1.6 - i * 0.12}rem`, opacity: 1 - i * 0.1 }}
            >
              {m}
            </span>
          ))}
        </div>

        <div className="fusion-center pointer-events-none absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center opacity-0">
          <h2 className="c-huge c-serif block text-[10vw] sm:text-6xl">
            SCIENCE <span className="c-accent-text">×</span> LANGUAGE
          </h2>
        </div>
      </div>
    </div>
  )
}
