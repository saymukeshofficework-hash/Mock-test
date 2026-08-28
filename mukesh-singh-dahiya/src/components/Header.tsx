import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { navGroups, topLevelLinks } from '../data/nav'
import { site } from '../data/site'
import Icon from './Icon'
import SearchBar from './SearchBar'
import ThemeToggle from './ThemeToggle'
import MobileNav from './MobileNav'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`sticky top-0 z-30 border-b bg-white/90 backdrop-blur transition-shadow duration-300 dark:bg-navy-950/90 ${
          scrolled ? 'border-slate-200 shadow-card dark:border-navy-800' : 'border-slate-200/80 dark:border-navy-800/80'
        }`}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/" className="group flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-sm font-bold text-cyan-400 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 dark:bg-cyan-400 dark:text-navy-950">
              MD
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-serif text-base font-bold text-navy-900 dark:text-white">{site.name}</span>
              <span className="hidden truncate text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:block">{site.title}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" onMouseLeave={() => setOpenGroup(null)}>
            {topLevelLinks.slice(0, 2).map((l) => (
              <Link key={l.to} to={l.to} className="rounded-lg px-3 py-2 text-sm font-semibold text-navy-700 hover:bg-slate-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-navy-800 dark:hover:text-cyan-400">
                {l.label}
              </Link>
            ))}
            {navGroups.map((group) => (
              <div key={group.label} className="relative" onMouseEnter={() => setOpenGroup(group.label)}>
                <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-navy-700 hover:bg-slate-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-navy-800 dark:hover:text-cyan-400">
                  {group.label}
                  <Icon name="chevronDown" className="h-3.5 w-3.5" />
                </button>
                {openGroup === group.label && (
                  <div className="animate-scale-in absolute left-0 top-full w-56 origin-top-left rounded-xl border border-slate-200 bg-white p-2 shadow-card-lg dark:border-navy-700 dark:bg-navy-900">
                    {group.links.map((l) => (
                      <Link key={l.to} to={l.to} className="block rounded-lg px-3 py-2 text-sm text-navy-700 transition-colors hover:bg-slate-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-navy-800 dark:hover:text-cyan-400">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {topLevelLinks.slice(2).map((l) => (
              <Link key={l.to} to={l.to} className="rounded-lg px-3 py-2 text-sm font-semibold text-navy-700 hover:bg-slate-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-navy-800 dark:hover:text-cyan-400">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <SearchBar />
            </div>
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 dark:border-navy-700 dark:text-slate-300 lg:hidden"
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
