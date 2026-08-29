import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PANELS = [
  { n: '01', title: 'Learn', desc: 'Absorb new ideas with curiosity and an open mind.' },
  { n: '02', title: 'Understand', desc: 'Break concepts down until they truly make sense.' },
  { n: '03', title: 'Practice', desc: 'Reinforce understanding through consistent effort.' },
  { n: '04', title: 'Teach', desc: 'Share knowledge — explaining deepens mastery.' },
  { n: '05', title: 'Inspire', desc: 'Help the next learner start their own journey.' },
]

export default function LearningJourney({ reduced, isDesktop }: { reduced: boolean; isDesktop: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return
    if (reduced || !isDesktop) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.journey-panel',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } }
        )
      }, sectionRef)
      return () => ctx.revert()
    }

    const ctx = gsap.context(() => {
      const track = trackRef.current!
      const distance = track.scrollWidth - window.innerWidth
      gsap.to(track, {
        x: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${distance}`,
          scrub: 0.6,
          pin: true,
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [reduced, isDesktop])

  return (
    <div ref={sectionRef} id="learning-journey" className="scene-teacher relative overflow-hidden">
      <div className="px-6 pt-24 text-center lg:pb-8 lg:pt-24">
        <p className="c-eyebrow mb-3">Journey</p>
        <h2 className="c-huge c-serif text-3xl sm:text-4xl">A Journey of Learning</h2>
      </div>

      {isDesktop && !reduced ? (
        <div ref={trackRef} className="c-journey-track flex w-max items-center gap-0">
          {PANELS.map((p) => (
            <div key={p.n} className="journey-panel flex h-[70vh] w-[100vw] flex-col items-center justify-center px-12 text-center">
              <span className="c-serif text-lg text-[color:var(--c-ink-faint)]">{p.n}</span>
              <h3 className="c-huge c-serif c-accent-text mt-2 text-[10vw] sm:text-7xl">{p.title}</h3>
              <span className="mt-6 max-w-md text-[color:var(--c-ink-dim)]">{p.desc}</span>
            </div>
          ))}
        </div>
      ) : (
        <div ref={trackRef} className="flex flex-col gap-4 px-6 pb-24">
          {PANELS.map((p) => (
            <div key={p.n} className="journey-panel flex flex-col items-center gap-2 py-8 text-center">
              <span className="c-serif text-sm text-[color:var(--c-ink-faint)]">{p.n}</span>
              <h3 className="c-huge c-serif c-accent-text text-4xl">{p.title}</h3>
              <span className="max-w-sm text-sm text-[color:var(--c-ink-dim)]">{p.desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
