import { Link } from 'react-router-dom'
import { site } from '../data/site'

const links = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Classes', to: '/classes' },
  { label: 'Subjects', to: '/subjects' },
  { label: 'Notes', to: '/notes' },
  { label: 'Solutions', to: '/solutions' },
  { label: 'Questions', to: '/questions' },
  { label: 'Previous Papers', to: '/previous-papers' },
  { label: 'NEET', to: '/neet' },
  { label: 'Calculators', to: '/calculators' },
  { label: 'Contact', to: '/contact' },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-navy-800 bg-navy-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-serif text-lg font-bold text-white">{site.name}</p>
          <p className="mt-2 text-sm text-slate-400">{site.qualifications}</p>
          <p className="mt-1 text-sm text-slate-400">{site.scope}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:col-span-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm text-slate-400 transition-colors hover:text-cyan-400">
              {l.label}
            </Link>
          ))}
        </div>
        <div>
          <p className="section-label mb-2 text-cyan-400">Contact</p>
          <p className="text-sm text-slate-400">
            Contact details will be added here soon. Visit the{' '}
            <Link to="/contact" className="font-semibold text-cyan-400">
              Contact page
            </Link>{' '}
            for updates.
          </p>
        </div>
      </div>
      <div className="border-t border-navy-800 py-5">
        <p className="container-page text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
