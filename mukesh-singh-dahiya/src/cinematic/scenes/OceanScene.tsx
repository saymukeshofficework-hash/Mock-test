import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const WORDS = ['CURIOSITY', 'QUESTION', 'DISCOVER', 'UNDERSTAND', 'KNOWLEDGE']

function Fish({ style, flip, size = 1 }: { style: React.CSSProperties; flip?: boolean; size?: number }) {
  return (
    <span className="c-fish" style={style} aria-hidden="true">
      <svg width={60 * size} height={32 * size} viewBox="0 0 60 32" style={{ transform: flip ? 'scaleX(-1)' : undefined }}>
        <polygon points="0,16 14,6 14,26" fill="var(--c-accent)" opacity={0.5} />
        <ellipse cx={38} cy={16} rx={22} ry={12} fill="var(--c-accent)" opacity={0.65} />
        <circle cx={52} cy={12} r={1.6} fill="#08090b" opacity={0.8} />
      </svg>
    </span>
  )
}

function Jellyfish({ style }: { style: React.CSSProperties }) {
  return (
    <span className="c-jelly" style={style} aria-hidden="true">
      <svg width={56} height={78} viewBox="0 0 56 78">
        <path d="M8 26C8 8 48 8 48 26Z" fill="var(--c-ink)" opacity={0.22} />
        {[10, 18, 26, 34, 42].map((x, i) => (
          <path
            key={i}
            d={`M${x} 24 Q${x + (i % 2 ? 6 : -6)} 50 ${x} 76`}
            stroke="var(--c-ink)"
            strokeWidth={1.4}
            fill="none"
            opacity={0.28}
          />
        ))}
      </svg>
    </span>
  )
}

function SeaPlant({ style, height = 90 }: { style: React.CSSProperties; height?: number }) {
  return (
    <span className="c-seaplant absolute bottom-0" style={style} aria-hidden="true">
      <svg width={40} height={height} viewBox={`0 0 40 ${height}`}>
        <path d={`M8 ${height} C-2 ${height * 0.6} 18 ${height * 0.55} 6 ${height * 0.2}`} stroke="var(--c-accent)" strokeWidth={3} fill="none" opacity={0.5} strokeLinecap="round" />
        <path d={`M20 ${height} C30 ${height * 0.65} 12 ${height * 0.5} 22 ${height * 0.15}`} stroke="var(--c-accent)" strokeWidth={3} fill="none" opacity={0.4} strokeLinecap="round" />
        <path d={`M32 ${height} C24 ${height * 0.7} 38 ${height * 0.5} 30 ${height * 0.25}`} stroke="var(--c-accent)" strokeWidth={2.5} fill="none" opacity={0.35} strokeLinecap="round" />
      </svg>
    </span>
  )
}

function tentaclePath(x: number, dir: 1 | -1) {
  return `M${x} 95 Q${x + 22 * dir} 130 ${x + 6 * dir} 160 Q${x - 4 * dir} 182 ${x + 10 * dir} 198`
}

function Octopus() {
  const xs = [40, 62, 84, 106, 128, 150, 172]
  return (
    <div className="c-octopus" aria-hidden="true">
      <svg width={220} height={210} viewBox="0 0 212 210">
        {xs.map((x, i) => (
          <path
            key={i}
            className="c-tentacle"
            d={tentaclePath(x, i % 2 ? 1 : -1)}
            stroke="var(--c-ink)"
            strokeWidth={7}
            strokeLinecap="round"
            fill="none"
            opacity={0.28}
            style={{ animationDuration: `${3.4 + (i % 4) * 0.5}s`, animationDelay: `${i * 0.15}s` }}
          />
        ))}
        <ellipse cx={106} cy={62} rx={62} ry={48} fill="var(--c-ink)" opacity={0.3} />
        <circle cx={86} cy={54} r={5} fill="#08090b" opacity={0.7} />
        <circle cx={126} cy={54} r={5} fill="#08090b" opacity={0.7} />
      </svg>
    </div>
  )
}

const BUBBLES = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 41) % 96}%`,
  size: 4 + (i % 4) * 3,
  duration: `${9 + (i % 6) * 1.6}s`,
  delay: `${(i * 0.9) % 9}s`,
  drift: `${(i % 3) * 10 - 10}px`,
}))

export default function OceanScene({ reduced }: { reduced: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLHeadingElement | null)[]>([])

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.ocean-title',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } }
      )
      gsap.fromTo(
        '.ocean-scene',
        { opacity: 0 },
        { opacity: 1, duration: 1.2, scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' } }
      )

      if (reduced) return

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.ocean-words',
          start: 'top top',
          end: '+=160%',
          scrub: 0.6,
          pin: true,
        },
      })
      WORDS.forEach((_, i) => {
        const word = wordRefs.current[i]
        if (!word) return
        tl.to(word, { opacity: 1, scale: 1, duration: 0.3 })
        tl.to({}, { duration: 0.3 })
        if (i < WORDS.length - 1) tl.to(word, { opacity: 0, scale: 0.9, duration: 0.3 })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <div ref={sectionRef} className="scene-ocean relative">
      <div className="relative flex min-h-[70vh] items-center justify-center px-6 py-20">
        <h2 className="ocean-title c-huge c-serif relative text-center text-[9vw] opacity-0 sm:text-6xl">
          The Ocean <span className="c-accent-text">of Knowledge</span>
        </h2>
      </div>

      <div className="ocean-scene c-ocean-bg relative min-h-[90vh] overflow-hidden opacity-0">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="c-ray" style={{ left: '15%' }} />
          <div className="c-ray" style={{ left: '55%', animationDelay: '3s' }} />
          {!reduced &&
            BUBBLES.map((b, i) => (
              <span
                key={i}
                className="c-bubble"
                style={{
                  left: b.left,
                  width: b.size,
                  height: b.size,
                  animationDuration: b.duration,
                  animationDelay: b.delay,
                  ['--drift' as string]: b.drift,
                }}
              />
            ))}
          <SeaPlant style={{ left: '6%' }} height={110} />
          <SeaPlant style={{ left: '18%' }} height={70} />
          <SeaPlant style={{ right: '10%' }} height={95} />
          <SeaPlant style={{ right: '24%' }} height={60} />

          <Jellyfish style={{ top: '12%', left: '12%', animationDuration: '7s' }} />
          <Jellyfish style={{ top: '22%', right: '16%', animationDuration: '9s', animationDelay: '1.5s' }} />

          <Fish style={{ top: '30%', animationDuration: '16s' }} size={0.8} />
          <Fish style={{ top: '48%', animationDuration: '22s', animationDelay: '4s' }} flip />
          <Fish style={{ top: '65%', animationDuration: '19s', animationDelay: '8s' }} size={1.2} />
          <Fish style={{ top: '38%', animationDuration: '26s', animationDelay: '2s' }} size={0.6} flip />

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Octopus />
          </div>
        </div>

        <div className="ocean-words relative flex min-h-[90vh] items-center justify-center px-6">
          {reduced ? (
            <h2 className="c-huge c-serif flex flex-col gap-3 text-center text-4xl sm:text-6xl">
              {WORDS.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </h2>
          ) : (
            <div className="relative h-24 w-full max-w-3xl text-center">
              {WORDS.map((w, i) => (
                <h2
                  key={w}
                  ref={(el) => {
                    wordRefs.current[i] = el
                  }}
                  className="c-huge c-serif absolute inset-0 flex items-center justify-center text-[11vw] opacity-0 sm:text-6xl"
                >
                  {w}
                </h2>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
