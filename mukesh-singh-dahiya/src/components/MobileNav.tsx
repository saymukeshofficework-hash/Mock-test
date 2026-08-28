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
                {group.links.map((l) => (
                  <Link key={l.to} to={l.to} onClick={onClose} className="rounded-lg px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-navy-800">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
