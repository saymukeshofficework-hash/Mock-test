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
                <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-navy-700 hover:bg-slate-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-navy-800 dark:hover:text-cyan-400">
                  <span>{group.label}</span>
                  {group.badge && (
                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {group.badge}
                    </span>
                  )}
                  <Icon name="chevronDown" className="h-3.5 w-3.5" />
                </button>
                {openGroup === group.label && (
                  <div
                    className={`animate-scale-in absolute left-0 top-full origin-top-left rounded-xl border border-slate-200 bg-white p-2 shadow-card-lg dark:border-navy-700 dark:bg-navy-900 ${
                      group.label === 'Learn' ? 'w-80 p-3' : group.label === 'Virtual Lab' ? 'w-72 p-3' : 'w-56'
                    }`}
                  >
                    {group.label === 'Learn' ? (
                      <div>
                        {/* Science Notes Header Link */}
                        <Link
                          to="/learn/science"
                          onClick={() => setOpenGroup(null)}
                          className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700 transition-colors hover:bg-brand-100 dark:bg-cyan-950/60 dark:text-cyan-300 dark:hover:bg-cyan-900/60"
                        >
                          <span className="flex items-center gap-2">
                            <Icon name="sparkles" className="h-4 w-4 text-brand-600 dark:text-cyan-400" />
                            <span>Science Notes</span>
                          </span>
                          <span className="rounded-full bg-brand-200/70 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-800 dark:bg-cyan-400/20 dark:text-cyan-300">
                            Classes 6–12
                          </span>
                        </Link>

                        {/* Class 6 to 12 Grid */}
                        <div className="mt-2.5">
                          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Select Grade
                          </p>
                          <div className="mt-1 grid grid-cols-2 gap-1">
                            {group.links.slice(1).map((l) => (
                              <Link
                                key={l.to}
                                to={l.to}
                                onClick={() => setOpenGroup(null)}
                                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-navy-700 transition-colors hover:bg-slate-100 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-navy-800 dark:hover:text-cyan-400"
                              >
                                <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-navy-800 dark:bg-navy-700 dark:text-slate-200">
                                  {l.label.replace('Class ', '')}
                                </span>
                                <span>{l.label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* General Learning Secondary Links */}
                        {group.secondaryLinks && (
                          <div className="mt-3 border-t border-slate-100 pt-2 dark:border-navy-800">
                            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Explore More
                            </p>
                            <div className="mt-1 grid grid-cols-2 gap-1">
                              {group.secondaryLinks.map((sl) => (
                                <Link
                                  key={sl.to}
                                  to={sl.to}
                                  onClick={() => setOpenGroup(null)}
                                  className="block rounded-lg px-2.5 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-navy-800 dark:hover:text-cyan-400"
                                >
                                  {sl.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : group.label === 'Virtual Lab' ? (
                      <div>
                        {/* Featured 3D Lab Hub Link */}
                        <Link
                          to="/virtual-lab"
                          onClick={() => setOpenGroup(null)}
                          className="flex items-center justify-between rounded-lg bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent p-2.5 text-sm font-bold text-emerald-800 transition-colors hover:bg-emerald-50 dark:text-cyan-300 dark:hover:bg-navy-800 border border-emerald-500/20"
                        >
                          <span className="flex items-center gap-2">
                            <Icon name="microscope" className="h-4 w-4 text-emerald-600 dark:text-cyan-400" />
                            <span>3D Biology Lab Hub</span>
                          </span>
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-cyan-300">
                            Live 3D
                          </span>
                        </Link>

                        <div className="mt-2 space-y-0.5">
                          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Interactive Workbenches
                          </p>
                          {group.links.slice(1).map((l) => (
                            <Link
                              key={l.to}
                              to={l.to}
                              onClick={() => setOpenGroup(null)}
                              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold text-navy-700 transition-colors hover:bg-slate-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-navy-800 dark:hover:text-cyan-400"
                            >
                              <span>{l.label}</span>
                              <Icon name="chevronRight" className="h-3 w-3 text-slate-400" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      group.links.map((l) => (
                        <Link
                          key={l.to}
                          to={l.to}
                          onClick={() => setOpenGroup(null)}
                          className="block rounded-lg px-3 py-2 text-sm text-navy-700 transition-colors hover:bg-slate-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-navy-800 dark:hover:text-cyan-400"
                        >
                          {l.label}
                        </Link>
                      ))
                    )}
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
