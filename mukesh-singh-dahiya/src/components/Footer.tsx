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
  { label: 'Courses', to: '/courses' },
  { label: 'Paid Notes', to: '/paid-notes' },
  { label: 'Online Classes', to: '/online-classes' },
  { label: 'NEET', to: '/neet' },
  { label: 'Calculators', to: '/calculators' },
  { label: 'Contact', to: '/contact' },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-navy-800 dark:bg-navy-900">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-serif text-lg font-bold text-navy-900 dark:text-white">{site.name}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{site.qualifications}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{site.scope}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:col-span-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-cyan-400">
              {l.label}
            </Link>
          ))}
        </div>
        <div>
          <p className="section-label mb-2">Contact</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Contact details will be added here soon. Visit the{' '}
            <Link to="/contact" className="font-semibold text-brand-600 dark:text-cyan-400">
              Contact page
            </Link>{' '}
            for updates.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-200 py-5 dark:border-navy-800">
        <p className="container-page text-center text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
