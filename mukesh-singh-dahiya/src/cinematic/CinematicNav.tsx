import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'learning-journey', label: 'Journey' },
  { id: 'teaching', label: 'Teaching' },
  { id: 'resources', label: 'Resources' },
  { id: 'contact', label: 'Contact' },
]

export default function CinematicNav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('home')
  const [mobileOpen, setMobileOpen] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter((el): el is HTMLElement => !!el)
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { threshold: [0.2, 0.4, 0.6] }
    )
    sections.forEach((s) => observerRef.current?.observe(s))
    return () => observerRef.current?.disconnect()
  }, [])

  const go = (id: string) => {
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <header className="c-nav" data-scrolled={scrolled}>
        <button className="c-nav-logo" onClick={() => go('home')} data-cursor="hover">
          MSD
        </button>
        <nav className="c-nav-links">
          {LINKS.map((l) => (
            <button
              key={l.id}
              className="c-nav-link"
              data-active={active === l.id}
              data-cursor="hover"
              onClick={() => go(l.id)}
            >
              {l.label}
            </button>
          ))}
          <Link to="/classes" className="c-nav-link" data-cursor="hover">
            Site ↗
          </Link>
        </nav>
        <button
          className="c-nav-toggle"
          data-open={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <div className="c-mobile-menu" data-open={mobileOpen} aria-hidden={!mobileOpen}>
        {LINKS.map((l, i) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            style={{ animationDelay: mobileOpen ? `${0.08 * i + 0.15}s` : undefined }}
            onClick={(e) => {
              e.preventDefault()
              go(l.id)
            }}
          >
            {l.label}
          </a>
        ))}
        <Link
          to="/classes"
          style={{ animationDelay: mobileOpen ? `${0.08 * LINKS.length + 0.15}s` : undefined }}
          className="!text-base !font-semibold !opacity-100"
          onClick={() => setMobileOpen(false)}
        >
          Full Site ↗
        </Link>
      </div>
    </>
  )
}
