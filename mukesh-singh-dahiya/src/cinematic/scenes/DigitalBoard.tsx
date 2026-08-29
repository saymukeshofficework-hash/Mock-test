import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const WORDS = ['LEARN', 'UNDERSTAND', 'APPLY']

// Three tiny hand-drawn-style doodles that appear alongside each word,
// stroke-drawn via stroke-dashoffset — a leaf, an arrow, a check mark.
const DOODLES = [
  { d: 'M40 70c0-24 16-40 40-40 0 24-16 40-40 40Zm0 0V85', viewBox: '0 0 90 90' },
  { d: 'M8 45h64m0 0L48 21m24 24L48 69', viewBox: '0 0 90 90' },
  { d: 'M12 46l20 20L78 20', viewBox: '0 0 90 90' },
]

function splitChars(word: string) {
  return word.split('').map((ch, i) => (
    <span key={i} className="c-board-char">
      {ch}
    </span>
  ))
}

export default function DigitalBoard({ reduced }: { reduced: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const doodleRefs = useRef<(SVGPathElement | null)[]>([])

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.c-board',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      )
      gsap.to('.c-board-glow', {
        opacity: 1,
        duration: 1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      })

      if (reduced) {
        doodleRefs.current.forEach((p) => p && gsap.set(p, { strokeDashoffset: 0 }))
        return
      }

      doodleRefs.current.forEach((path) => {
        if (!path) return
        const len = path.getTotalLength()
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=180%',
          scrub: 0.6,
          pin: true,
        },
      })

      WORDS.forEach((_, i) => {
        const word = wordRefs.current[i]
        const doodle = doodleRefs.current[i]
        if (!word) return
        const chars = word.querySelectorAll('.c-board-char')
        tl.to(word, { opacity: 1, duration: 0.05 })
          .fromTo(chars, { opacity: 0, y: '0.4em' }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.045, ease: 'power2.out' })
        if (doodle) tl.to(doodle, { strokeDashoffset: 0, duration: 0.6, ease: 'none' }, '<0.1')
        tl.to({}, { duration: 0.35 })
        if (i < WORDS.length - 1) {
          tl.to(chars, { opacity: 0, y: '-0.3em', duration: 0.35, stagger: 0.02 }).set(word, { opacity: 0 })
        }
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <div ref={sectionRef} id="classroom" className="scene-classroom relative flex min-h-[100svh] items-center justify-center px-6 py-24">
      <div className="mx-auto w-full max-w-3xl text-center">
        <p className="c-eyebrow mb-6">Scene One — The Digital Classroom</p>
        <div className="c-board relative mx-auto flex aspect-[16/10] w-full max-w-2xl flex-col items-center justify-center gap-6 p-8">
          <div className="c-board-glow" aria-hidden="true" />
          <div className="flex items-center gap-6" aria-hidden="true">
            {DOODLES.map((doodle, i) => (
              <svg key={i} viewBox={doodle.viewBox} className="h-10 w-10 opacity-90">
                <path
                  ref={(el) => {
                    doodleRefs.current[i] = el
                  }}
                  d={doodle.d}
                  fill="none"
                  stroke="var(--c-accent)"
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ))}
          </div>
          {reduced ? (
            <h2 className="c-serif flex flex-col gap-2 text-4xl font-bold text-[color:var(--c-ink)] sm:text-6xl">
              {WORDS.map((word) => (
                <span key={word}>{word}</span>
              ))}
            </h2>
          ) : (
            <h2 className="c-serif relative text-[12vw] font-bold leading-none text-[color:var(--c-ink)] sm:text-6xl">
              {WORDS.map((word, i) => (
                <span
                  key={word}
                  ref={(el) => {
                    wordRefs.current[i] = el
                  }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"
                  style={{ opacity: i === 0 ? undefined : 0 }}
                >
                  {splitChars(word)}
                  <span className="c-board-cursor" aria-hidden="true" />
                </span>
              ))}
            </h2>
          )}
        </div>
        <p className="mt-8 text-xs uppercase tracking-[0.25em] text-[color:var(--c-ink-faint)]">Scroll to keep writing</p>
      </div>
    </div>
  )
}
