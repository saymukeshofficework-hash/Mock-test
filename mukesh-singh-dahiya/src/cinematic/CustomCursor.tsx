import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Desktop-only custom cursor: a small dot that tracks instantly and a ring
 * that trails with easing. Elements opt in via `data-cursor="hover"` or
 * `data-cursor="cta"` (the latter also reads `data-cursor-label`).
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' })
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3' })

    const onMove = (e: MouseEvent) => {
      dotX(e.clientX)
      dotY(e.clientY)
      ringX(e.clientX)
      ringY(e.clientY)
    }

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>('[data-cursor]')
      if (!target) {
        ring.dataset.variant = ''
        if (labelRef.current) labelRef.current.textContent = ''
        return
      }
      ring.dataset.variant = target.dataset.cursor ?? ''
      if (labelRef.current) labelRef.current.textContent = target.dataset.cursorLabel ?? ''
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="c-cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="c-cursor-ring" aria-hidden="true">
        <span ref={labelRef} />
      </div>
    </>
  )
}
