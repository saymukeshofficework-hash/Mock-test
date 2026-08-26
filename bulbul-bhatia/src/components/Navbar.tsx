import { useEffect, useRef, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageToggle from './LanguageToggle'

interface NavChild {
  label: string
  to: string
}

interface NavItem {
  label: string
  to?: string
  children?: NavChild[]
}

export default function Navbar() {
  const { t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const servicesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const navItems: NavItem[] = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.about'), to: '/about' },
    {
      label: t('nav.services'),
      children: [
        { label: t('nav.astrology') + ' — ' + t('nav.services'), to: '/astrology-services' },
        { label: t('nav.tarot') + ' — ' + t('nav.services'), to: '/tarot-services' },
      ],
    },
    { label: t('nav.astrology'), to: '/astrology' },
    { label: t('nav.tarot'), to: '/tarot' },
    { label: t('nav.courses'), to: '/courses' },
    { label: t('nav.tools'), to: '/tools' },
    { label: t('nav.horoscope'), to: '/horoscope' },
    { label: t('nav.contact'), to: '/contact' },
  ]

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3 py-2 text-sm font-medium transition hover:text-rose-600 ${
      isActive ? 'text-rose-600' : 'text-navy-900/80'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-navy-900/5 bg-white/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-serif text-xl font-semibold text-navy-900">
          <span
            aria-hidden="true"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cosmic-gradient text-champagne-300"
          >
            ✦
          </span>
          Bulbul Bhatia
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navItems.map((item) =>
            item.children ? (
              <div className="relative" key={item.label} ref={servicesRef}>
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-navy-900/80 transition hover:text-rose-600"
                  aria-haspopup="true"
                  aria-expanded={servicesOpen}
                  onClick={() => setServicesOpen((v) => !v)}
                >
                  {item.label}
                  <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                </button>
                {servicesOpen && (
                  <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-navy-900/10 bg-white p-2 shadow-card">
                    {item.children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        className="block rounded-xl px-3 py-2 text-sm text-navy-900/80 hover:bg-blush-50 hover:text-rose-600"
                        onClick={() => setServicesOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink key={item.to} to={item.to!} className={linkClass} end={item.to === '/'}>
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageToggle />
          <Link to="/courses" className="btn-secondary !px-4 !py-2 text-xs">
            {t('nav.joinCourse')}
          </Link>
          <Link to="/book" className="btn-primary !px-4 !py-2 text-xs">
            {t('nav.bookConsultation')}
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy-900/10 text-navy-900 lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M2 2l16 16M18 2L2 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-navy-900/5 bg-white lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-4" aria-label="Mobile">
            {navItems.flatMap((item) =>
              item.children
                ? item.children.map((child) => (
                    <Link
                      key={child.to}
                      to={child.to}
                      className="rounded-xl px-3 py-3 text-base font-medium text-navy-900/80 hover:bg-blush-50"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))
                : (
                    <NavLink
                      key={item.to}
                      to={item.to!}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `rounded-xl px-3 py-3 text-base font-medium hover:bg-blush-50 ${
                          isActive ? 'text-rose-600' : 'text-navy-900/80'
                        }`
                      }
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  ),
            )}
            <div className="mt-2 flex items-center justify-between border-t border-navy-900/5 pt-4">
              <LanguageToggle />
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <Link to="/courses" className="btn-secondary" onClick={() => setMobileOpen(false)}>
                {t('nav.joinCourse')}
              </Link>
              <Link to="/book" className="btn-primary" onClick={() => setMobileOpen(false)}>
                {t('nav.bookConsultation')}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
