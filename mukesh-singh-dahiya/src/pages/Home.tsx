import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import Section from '../components/Section'
import Icon from '../components/Icon'
import ClassCard from '../components/ClassCard'
import CredentialCard from '../components/CredentialCard'
import CourseCard from '../components/CourseCard'
import PaidNoteCard from '../components/PaidNoteCard'
import OnlineClassCard from '../components/OnlineClassCard'
import CalculatorCard from '../components/CalculatorCard'
import ResourceCard from '../components/ResourceCard'
import { site } from '../data/site'
import { classes } from '../data/classes'
import { courses } from '../data/courses'
import { paidNotes } from '../data/paidNotes'
import { onlineClasses } from '../data/onlineClasses'
import { calculators } from '../data/calculators'
import { resources } from '../data/resources'

export default function Home() {
  const latestResources = [...resources].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).slice(0, 4)

  return (
    <>
      <SEO
        title="Home"
        description="Mukesh Singh Dahiya — M.Sc. Botany, M.A. English, 12 years teaching experience. Notes, solutions, questions, previous papers, courses and NEET Biology resources for Classes 5–12, CBSE & MP Board."
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white dark:border-navy-800 dark:from-navy-900 dark:to-navy-950">
        <div className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="section-label mb-4">Teacher & Educator</p>
            <h1 className="font-serif text-4xl font-bold leading-tight text-navy-900 dark:text-white sm:text-5xl">{site.name}</h1>
            <p className="mt-3 text-lg font-medium text-brand-700 dark:text-cyan-400">{site.qualifications}</p>
            <p className="mt-1 text-base text-slate-600 dark:text-slate-300">{site.scope}</p>
            <p className="mt-6 max-w-xl text-slate-600 dark:text-slate-300">{site.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/classes" className="btn-primary">
                Explore Classes
              </Link>
              <Link to="/notes" className="btn-secondary">
                Study Resources
              </Link>
              <Link to="/neet" className="btn-secondary">
                NEET Biology
              </Link>
              <Link to="/calculators" className="btn-secondary">
                Calculators
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="card flex aspect-square w-full flex-col items-center justify-center gap-3 overflow-hidden p-8 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-navy-900 text-3xl font-bold text-cyan-400 dark:bg-cyan-400 dark:text-navy-950">
                MD
              </div>
              <p className="font-serif text-lg font-bold text-navy-900 dark:text-white">{site.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Teacher photograph to be added</p>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <Section eyebrow="Credentials" title="Academic Background & Experience">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {site.credentials.map((c) => (
            <CredentialCard key={c.label} label={c.label} icon={c.icon} />
          ))}
        </div>
      </Section>

      {/* Classes */}
      <Section eyebrow="Classes 5–12" title="Find Material for Your Class" description="CBSE and MP Board, English Medium." cta="View All Classes" ctaTo="/classes" className="bg-slate-50 dark:bg-navy-900/40">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {classes.map((c) => (
            <ClassCard key={c.slug} cls={c} />
          ))}
        </div>
      </Section>

      {/* Latest resources */}
      <Section eyebrow="Study Resources" title="Latest Resources" cta="Browse All Notes" ctaTo="/notes">
        {latestResources.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latestResources.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">Study material will be added here soon.</p>
        )}
      </Section>

      {/* Premium courses */}
      <Section eyebrow="Premium" title="Premium Courses" cta="View All Courses" ctaTo="/courses" className="bg-slate-50 dark:bg-navy-900/40">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 3).map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </Section>

      {/* Premium notes */}
      <Section eyebrow="Premium" title="Premium Notes" cta="Explore Premium Notes" ctaTo="/paid-notes">
        {paidNotes.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paidNotes.slice(0, 3).map((n) => (
              <PaidNoteCard key={n.id} note={n} />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">Premium notes will be added here soon.</p>
        )}
      </Section>

      {/* Online classes */}
      <Section eyebrow="Live Learning" title="Online Classes" cta="View Online Classes" ctaTo="/online-classes" className="bg-slate-50 dark:bg-navy-900/40">
        {onlineClasses.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {onlineClasses.map((c) => (
              <OnlineClassCard key={c.id} oc={c} />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">Online classes will be announced here soon.</p>
        )}
      </Section>

      {/* NEET */}
      <Section eyebrow="NEET Preparation" title="NEET Biology" description="Dedicated Botany and Zoology resources for NEET aspirants." cta="Explore NEET Biology" ctaTo="/neet">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Botany', to: '/neet/botany', icon: 'leaf' },
            { label: 'Zoology', to: '/neet/zoology', icon: 'globe' },
            { label: 'Questions', to: '/neet/questions', icon: 'check' },
            { label: 'Revision', to: '/neet/revision', icon: 'clock' },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="card flex flex-col items-center gap-3 p-6 text-center transition hover:-translate-y-0.5 hover:shadow-card-lg">
              <div className="rounded-full bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/10 dark:text-cyan-300">
                <Icon name={item.icon} className="h-5 w-5" />
              </div>
              <p className="font-semibold text-navy-900 dark:text-white">{item.label}</p>
            </Link>
          ))}
        </div>
      </Section>

      {/* Calculators */}
      <Section eyebrow="Tools" title="Educational Calculators" cta="All Calculators" ctaTo="/calculators" className="bg-slate-50 dark:bg-navy-900/40">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {calculators.slice(0, 4).map((c) => (
            <CalculatorCard key={c.slug} calc={c} />
          ))}
        </div>
      </Section>

      {/* About teacher */}
      <Section eyebrow="About the Teacher" title={site.name}>
        <div className="card grid gap-6 p-6 sm:p-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-slate-600 dark:text-slate-300">{site.bio}</p>
            <Link to="/about" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-cyan-400">
              Read Full Profile <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {site.credentials.slice(0, 3).map((c) => (
              <CredentialCard key={c.label} label={c.label} icon={c.icon} />
            ))}
          </div>
        </div>
      </Section>

      {/* Contact CTA */}
      <section className="border-t border-slate-200 bg-navy-900 dark:border-navy-800">
        <div className="container-page flex flex-col items-center gap-4 py-16 text-center">
          <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
            Have a question about classes, courses or study material?
          </h2>
          <Link to="/contact" className="btn-primary bg-cyan-400 text-navy-950 hover:bg-cyan-300">
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  )
}
