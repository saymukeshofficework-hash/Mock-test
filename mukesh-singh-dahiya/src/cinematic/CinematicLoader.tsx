import { useEffect, useState } from 'react'

/**
 * Short opening loader: MSD -> full name -> progress line -> hero.
 * Real progress isn't tracked (this is a static SPA build, nothing to
 * wait on) — the bar is a deliberate, brief cinematic beat, capped short
 * so it never makes a returning visitor wait.
 */
export default function CinematicLoader({ onDone }: { onDone: () => void }) {
  const [hidden, setHidden] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const already = sessionStorage.getItem('msd-intro-seen') === '1'
    const duration = already ? 250 : 900
    const raf = requestAnimationFrame(() => setProgress(100))
    const t1 = setTimeout(() => setHidden(true), duration)
    const t2 = setTimeout(() => {
      sessionStorage.setItem('msd-intro-seen', '1')
      onDone()
    }, duration + 620)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t1)
      clearTimeout(t2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="c-loader" data-hidden={hidden} role="status" aria-label="Loading">
      <span className="c-loader-mark">MSD</span>
      <span className="c-loader-name">Mukesh Dahiya</span>
      <span className="c-loader-bar">
        <span className="c-loader-bar-fill" style={{ width: `${progress}%` }} />
      </span>
    </div>
  )
}
