import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { search } from '../lib/search'

export default function SearchBar({ variant = 'header' }: { variant?: 'header' | 'inline' }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const results = search(query)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function go(to: string) {
    setOpen(false)
    setQuery('')
    navigate(to)
  }

  return (
    <div ref={containerRef} className={`relative ${variant === 'header' ? 'w-full max-w-xs' : 'w-full'}`}>
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search classes, notes, NEET, calculators..."
          aria-label="Search the site"
          className="input pl-9"
        />
      </div>
      {open && query.trim() && (
        <div className="absolute z-40 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-card-lg dark:border-navy-700 dark:bg-navy-900">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">No results for "{query}".</p>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                onClick={() => go(r.to)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-navy-800"
              >
                <span className="truncate font-medium text-navy-800 dark:text-slate-100">{r.title}</span>
                <span className="shrink-0 text-xs text-slate-400">{r.type}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export function SearchLink() {
  return (
    <Link to="/resources" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-cyan-400">
      Browse all resources
    </Link>
  )
}
