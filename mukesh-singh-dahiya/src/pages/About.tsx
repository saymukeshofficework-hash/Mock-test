import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import CredentialCard from '../components/CredentialCard'
import { site } from '../data/site'
import { asset } from '../lib/publicBase'

const focusAreas = ['School Academics', 'English', 'Science', 'Biology', 'Mathematics', 'Social Science', 'NEET Biology', 'Botany', 'Zoology']

export default function About() {
  return (
    <>
      <SEO title="About" description="About Mukesh Dahiya — M.Sc. Botany, M.A. English, 12 years of teaching experience across Classes 5–12, CBSE and MP Board." />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'About' }]} />
      <div className="container-page py-14 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
            <img
              src={asset(site.teacherImage)}
              alt={`${site.name} — ${site.title}`}
              className="mx-auto h-40 w-40 shrink-0 rounded-2xl border border-navy-900/10 object-cover object-top shadow-card-lg dark:border-white/10 sm:mx-0 sm:h-44 sm:w-44"
            />
            <div>
              <p className="section-label mb-2">About the Teacher</p>
              <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">About {site.name}</h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300">{site.bio}</p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="card p-6">
              <h2 className="mb-3 text-lg font-bold text-navy-900 dark:text-white">Academic Qualifications</h2>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>M.Sc. Botany</li>
                <li>M.A. English</li>
              </ul>
            </div>
            <div className="card p-6">
              <h2 className="mb-3 text-lg font-bold text-navy-900 dark:text-white">Teaching Experience</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">12 Years</p>
            </div>
            <div className="card p-6">
              <h2 className="mb-3 text-lg font-bold text-navy-900 dark:text-white">Teaching Scope</h2>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>Classes 5–12</li>
                <li>CBSE</li>
                <li>MP Board</li>
                <li>English Medium</li>
              </ul>
            </div>
            <div className="card p-6">
              <h2 className="mb-3 text-lg font-bold text-navy-900 dark:text-white">Academic Focus</h2>
              <ul className="flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-300">
                {focusAreas.map((f) => (
                  <li key={f} className="badge bg-slate-100 dark:bg-navy-700">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {site.credentials.map((c) => (
              <CredentialCard key={c.label} label={c.label} icon={c.icon} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
