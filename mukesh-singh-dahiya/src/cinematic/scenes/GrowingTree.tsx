import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const TRUNK = 'M200 480 C196 420 204 360 198 300 C194 260 202 240 200 210'
const BRANCHES = [
  'M200 300 C160 280 120 260 80 235',
  'M200 300 C240 280 280 260 320 235',
  'M200 240 C170 210 140 185 110 150',
  'M200 240 C230 210 260 185 290 150',
  'M200 210 C195 170 205 130 200 90',
]
const LEAF_CENTERS: [number, number][] = [
  [80, 235],
  [320, 235],
  [110, 150],
  [290, 150],
  [200, 90],
  [160, 268],
  [240, 268],
]

function makeLeaves(cx: number, cy: number, seed: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (seed * 47 + i * 63) % 360
    const dist = 14 + ((seed * 13 + i * 9) % 26)
    const rad = (angle * Math.PI) / 180
    return {
      x: cx + Math.cos(rad) * dist,
      y: cy + Math.sin(rad) * dist,
      r: 6 + ((seed + i) % 5),
      delay: ((seed * 5 + i * 3) % 10) / 10,
    }
  })
}

const LEAVES = LEAF_CENTERS.flatMap(([cx, cy], ci) => makeLeaves(cx, cy, ci + 1))

const FALLING = Array.from({ length: 6 }, (_, i) => ({
  left: `${20 + i * 12}%`,
  delay: `${i * 1.4}s`,
  duration: `${8 + (i % 3)}s`,
  size: 9 + (i % 3) * 2,
}))

export default function GrowingTree({ reduced }: { reduced: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trunkRef = useRef<SVGPathElement>(null)
  const branchRefs = useRef<(SVGPathElement | null)[]>([])

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([trunkRef.current, ...branchRefs.current], { strokeDashoffset: 0 })
        gsap.set('.tree-leaf', { opacity: 1, scale: 1 })
        gsap.set(['.tree-copy-1', '.tree-copy-2', '.tree-years'], { opacity: 1, y: 0 })
        return
      }

      const paths = [trunkRef.current, ...branchRefs.current].filter(Boolean) as SVGPathElement[]
      paths.forEach((p) => {
        const len = p.getTotalLength()
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
      })
      gsap.set('.tree-leaf', { opacity: 0, scale: 0.3, transformOrigin: 'center' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=220%',
          scrub: 0.6,
          pin: true,
        },
      })

      tl.to(trunkRef.current, { strokeDashoffset: 0, duration: 1, ease: 'none' })
        .to(branchRefs.current, { strokeDashoffset: 0, duration: 1.2, stagger: 0.12, ease: 'none' }, '-=0.2')
        .to('.tree-leaf', { opacity: 1, scale: 1, duration: 0.8, stagger: 0.02, ease: 'back.out(1.7)' }, '-=0.6')
        .fromTo('.tree-copy-1', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
        .to('.tree-copy-1', { opacity: 0, y: -20, duration: 0.4 }, '+=0.5')
        .fromTo('.tree-copy-2', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.1')
        .to('.tree-copy-2', { opacity: 0, y: -20, duration: 0.4 }, '+=0.5')
        .fromTo('.tree-years', { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.6 }, '-=0.1')
    }, sectionRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <div ref={sectionRef} className="scene-botany relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 py-24">
      <p className="c-eyebrow absolute left-6 top-8 sm:left-12 sm:top-12">Scene Two — Growth</p>

      <div className="relative grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="relative order-2 mx-auto aspect-[4/5] w-full max-w-sm lg:order-1">
          <svg viewBox="0 0 400 500" className="h-full w-full" aria-hidden="true">
            <path ref={trunkRef} d={TRUNK} fill="none" stroke="var(--c-accent)" strokeWidth={5} strokeLinecap="round" opacity={0.9} />
            {BRANCHES.map((d, i) => (
              <path
                key={i}
                ref={(el) => {
                  branchRefs.current[i] = el
                }}
                d={d}
                fill="none"
                stroke="var(--c-accent)"
                strokeWidth={3.5}
                strokeLinecap="round"
                opacity={0.75}
              />
            ))}
            {LEAVES.map((leaf, i) => (
              <circle
                key={i}
                className="tree-leaf c-leaf-sway"
                cx={leaf.x}
                cy={leaf.y}
                r={leaf.r}
                fill="var(--c-accent)"
                opacity={0.55 + (i % 4) * 0.1}
                style={{ animationDelay: `${leaf.delay}s` }}
              />
            ))}
          </svg>
          {!reduced &&
            FALLING.map((f, i) => (
              <span
                key={i}
                className="c-leaf-fall absolute top-1/3"
                style={{ left: f.left, animationDelay: f.delay, animationDuration: f.duration }}
                aria-hidden="true"
              >
                <svg width={f.size} height={f.size} viewBox="0 0 24 24">
                  <path d="M11 20A7 7 0 0 1 4 13V7a7 7 0 0 1 7-7h6a1 1 0 0 1 1 1v6a7 7 0 0 1-7 7Z" fill="var(--c-accent)" opacity={0.7} />
                </svg>
              </span>
            ))}
        </div>

        <div className={`order-1 flex flex-col justify-center gap-8 text-center lg:order-2 lg:text-left ${reduced ? 'relative' : 'relative min-h-[10rem]'}`}>
          <h2
            className={`tree-copy-1 c-huge c-serif flex flex-col justify-center text-3xl sm:text-5xl ${reduced ? '' : 'absolute inset-0'}`}
          >
            Every lesson
            <span className="c-accent-text">is a seed.</span>
          </h2>
          <h2
            className={`tree-copy-2 c-huge c-serif flex flex-col justify-center text-3xl sm:text-5xl ${reduced ? '' : 'absolute inset-0 opacity-0'}`}
          >
            Every learner
            <span className="c-accent-text">can grow.</span>
          </h2>
          <div className={`tree-years ${reduced ? '' : 'opacity-0'}`}>
            <span className="c-huge c-serif c-accent-text block text-[5rem] sm:text-[7rem]">12+</span>
            <span className="c-eyebrow">Years of Teaching</span>
          </div>
        </div>
      </div>
    </div>
  )
}
