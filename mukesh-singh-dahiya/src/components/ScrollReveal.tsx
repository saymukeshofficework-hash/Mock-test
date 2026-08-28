import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Adds `.is-visible` to any `.reveal` element as it enters the viewport,
 * driving the fade/slide-up transition defined in index.css. Re-scans on
 * route change since each page mounts its own `.reveal` elements.
 */
export default function ScrollReveal() {
  const { pathname } = useLocation()

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)'))
    if (targets.length === 0) return

    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    )

    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [pathname])

  return null
}
