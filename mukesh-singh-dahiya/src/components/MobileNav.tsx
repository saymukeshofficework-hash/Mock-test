import { Link } from 'react-router-dom'
import { navGroups, topLevelLinks } from '../data/nav'
import { site } from '../data/site'
import Icon from './Icon'
import SearchBar from './SearchBar'

export default function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="animate-fade-in absolute inset-0 bg-navy-950/50" onClick={onClose} />
      <div className="animate-slide-in-right absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col overflow-y-auto bg-white p-5 shadow-card-lg dark:bg-navy-900">
        <div className="mb-5 flex items-center justify-between">
          <span className="font-serif text-lg font-bold text-navy-900 dark:text-white">{site.name}</span>
          <button onClick={onClose} aria-label="Close menu" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-800">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-5">
          <SearchBar variant="inline" />
        </div>
        <nav className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            {topLevelLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={onClose} className="rounded-lg px-2 py-2 text-sm font-semibold text-navy-800 transition-colors hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-navy-800">
                {l.label}
              </Link>
            ))}
          </div>
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="section-label mb-2 px-2">{group.label}</p>
              <div className="flex flex-col gap-1">
                {group.label === 'Learn' ? (
                  <>
                    <Link
                      to="/learn/science"
                      onClick={onClose}
                      className="flex items-center justify-between rounded-lg bg-brand-50 px-2.5 py-2 text-sm font-bold text-brand-700 dark:bg-cyan-950/60 dark:text-cyan-300"
                    >
                      <span className="flex items-center gap-1.5">
                        <Icon name="sparkles" className="h-4 w-4 text-brand-600 dark:text-cyan-400" />
                        <span>Science Notes</span>
                      </span>
                      <span className="rounded bg-brand-200/60 px-1.5 py-0.5 text-[10px] font-bold dark:bg-cyan-400/20">
                        Grades 6–12
                      </span>
                    </Link>
                    <div className="grid grid-cols-2 gap-1 py-1">
                      {group.links.slice(1).map((l) => (
                        <Link
                          key={l.to}
                          to={l.to}
                          onClick={onClose}
                          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-navy-800"
                        >
                          <span className="flex h-4 w-4 items-center justify-center rounded bg-slate-100 text-[9px] font-bold text-navy-800 dark:bg-navy-700 dark:text-slate-200">
                            {l.label.replace('Class ', '')}
                          </span>
                          <span>{l.label}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : group.label === 'Virtual Lab' ? (
                  <>
                    <Link
                      to="/virtual-lab"
                      onClick={onClose}
                      className="flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-2 text-sm font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-cyan-300"
                    >
                      <span className="flex items-center gap-1.5">
                        <Icon name="microscope" className="h-4 w-4 text-emerald-600 dark:text-cyan-400" />
                        <span>3D Virtual Biology Lab</span>
                      </span>
                      <span className="rounded bg-emerald-200/70 px-1.5 py-0.5 text-[10px] font-bold text-emerald-900 dark:bg-emerald-400/20 dark:text-cyan-300">
                        Live 3D
                      </span>
                    </Link>
                    <div className="flex flex-col gap-1 py-1">
                      {group.links.slice(1).map((l) => (
                        <Link
                          key={l.to}
                          to={l.to}
                          onClick={onClose}
                          className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-navy-800"
                        >
                          <span>{l.label}</span>
                          <Icon name="chevronRight" className="h-3 w-3 text-slate-400" />
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  group.links.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={onClose}
                      className="rounded-lg px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-navy-800"
                    >
                      {l.label}
                    </Link>
                  ))
                )}
                {group.secondaryLinks && (
                  <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-navy-800 flex flex-col gap-0.5">
                    {group.secondaryLinks.map((sl) => (
                      <Link
                        key={sl.to}
                        to={sl.to}
                        onClick={onClose}
                        className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-cyan-400"
                      >
                        {sl.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
