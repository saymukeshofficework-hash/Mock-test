import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import Section from '../components/Section'
import Icon from '../components/Icon'
import ClassCard from '../components/ClassCard'
import CredentialCard from '../components/CredentialCard'
import CourseCard from '../components/CourseCard'
import PaidNoteCard from '../components/PaidNoteCard'
import BundleCard from '../components/BundleCard'
import OnlineClassCard from '../components/OnlineClassCard'
import CalculatorCard from '../components/CalculatorCard'
import ResourceCard from '../components/ResourceCard'
import WhatsAppButton from '../components/WhatsAppButton'
import { site } from '../data/site'
import { classes } from '../data/classes'
import { courses } from '../data/courses'
import { paidNotes } from '../data/paidNotes'
import { bundles } from '../data/bundles'
import { onlineClasses } from '../data/onlineClasses'
import { calculators } from '../data/calculators'
import { resources } from '../data/resources'
import { generalMessage } from '../lib/whatsapp'
import { asset } from '../lib/publicBase'

export default function Home() {
  const latestResources = [...resources].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).slice(0, 4)

  return (
    <>
      <SEO
        title="Home"
        description="Mukesh Singh Dahiya — M.Sc. Botany, M.A. English, 12 years teaching experience. Notes, solutions, questions, previous papers, courses and NEET Biology resources for Classes 5–12, CBSE & MP Board."
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-navy-800 bg-navy-900">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 animate-float rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 animate-float-slow rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 animate-float-slow rounded-full bg-gold-400/10 blur-3xl" />
        <div className="container-page relative grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="reveal section-label mb-4 text-cyan-400">Teacher & Educator</p>
            <h1 className="reveal font-serif text-4xl font-bold leading-tight text-white sm:text-5xl" style={{ transitionDelay: '80ms' }}>
              {site.name}
            </h1>
            <p className="reveal mt-3 text-lg font-medium text-gradient-gold" style={{ transitionDelay: '140ms' }}>
              {site.qualifications}
            </p>
            <p className="reveal mt-1 text-base text-slate-300" style={{ transitionDelay: '180ms' }}>
              {site.scope}
            </p>
            <p className="reveal mt-6 max-w-xl text-slate-300" style={{ transitionDelay: '220ms' }}>
              {site.intro}
            </p>
            <div className="reveal mt-8 flex flex-wrap gap-3" style={{ transitionDelay: '280ms' }}>
              <Link to="/classes" className="btn-primary">
                Explore Classes
              </Link>
              <Link to="/notes" className="btn-secondary border-white/20 bg-transparent text-white hover:border-cyan-400 hover:text-cyan-400">
                Study Resources
              </Link>
              <Link to="/neet" className="btn-secondary border-white/20 bg-transparent text-white hover:border-cyan-400 hover:text-cyan-400">
                NEET Biology
              </Link>
              <Link to="/courses" className="btn-secondary border-white/20 bg-transparent text-white hover:border-gold-400 hover:text-gold-400">
                Explore Courses
              </Link>
            </div>
          </div>
          <div className="reveal relative mx-auto w-full max-w-sm" style={{ transitionDelay: '160ms' }}>
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-white/10 shadow-card-lg transition-shadow duration-500 hover:shadow-glow-gold">
              <img
                src={asset(site.teacherImage)}
                alt={`${site.name} — ${site.title}`}
                className="h-full w-full object-cover object-top transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-transparent p-5">
                <p className="font-serif text-lg font-bold text-white">{site.name}</p>
                <p className="text-sm text-slate-300">{site.title}</p>
              </div>
            </div>
            <div className="glass-panel animate-scale-in absolute -left-6 bottom-6 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-glow-gold" style={{ animationDelay: '400ms' }}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-400/20 text-gold-300">
                <Icon name="clock" className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold text-white">12 Years</span>
                <span className="block text-xs text-slate-300">Teaching Experience</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <Section eyebrow="Credentials" title="Academic Background & Experience" className="bg-white dark:bg-navy-950">
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
      <Section eyebrow="Study Resources" title="Latest Resources" cta="Browse All Notes" ctaTo="/notes" className="bg-white dark:bg-navy-950">
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

      {/* Premium courses — Navy + Gold */}
      <Section tone="dark" eyebrow="Premium" title="Premium Courses" cta="View All Courses" ctaTo="/courses">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 3).map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </Section>

      {/* Premium notes */}
      <Section eyebrow="Premium" title="Premium Notes" cta="Explore Premium Notes" ctaTo="/paid-notes" className="bg-slate-50 dark:bg-navy-900/40">
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

      {/* Study bundles */}
      <Section eyebrow="Bundle & Save" title="Study Bundles" cta="View All Bundles" ctaTo="/bundles" className="bg-white dark:bg-navy-950">
        {bundles.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bundles.slice(0, 3).map((b) => (
              <BundleCard key={b.id} bundle={b} />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">Study bundles will be added here soon.</p>
        )}
      </Section>

      {/* Online classes */}
      <Section eyebrow="Live Learning" title="Online Classes" cta="View Online Classes" ctaTo="/online-classes" className="bg-white dark:bg-navy-950">
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

      {/* Learn directly — WhatsApp CTA */}
      <Section eyebrow="Get Started" title="Learn Directly with Mukesh Singh Dahiya" description="Every premium course, note and online class is a WhatsApp message away." className="bg-slate-50 dark:bg-navy-900/40">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: 'Premium Courses', desc: 'Structured, chapter-by-chapter courses.', to: '/courses' },
            { title: 'Premium Notes', desc: 'Exam-focused notes you can buy directly.', to: '/paid-notes' },
            { title: 'Online Classes', desc: 'Live, doubt-clearing batches.', to: '/online-classes' },
          ].map((item) => (
            <div key={item.to} className="card flex flex-col gap-3 p-6">
              <h3 className="font-bold text-navy-900 dark:text-white">{item.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                <Link to={item.to} className="btn-secondary">
                  Browse
                </Link>
                <WhatsAppButton message={generalMessage()} label="Ask on WhatsApp" variant="secondary" />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* NEET — Navy + Emerald */}
      <Section tone="dark" eyebrow="NEET Preparation" title="NEET Biology" description="Dedicated Botany and Zoology resources for NEET aspirants." cta="Explore NEET Biology" ctaTo="/neet">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Botany', to: '/neet/botany', icon: 'leaf' },
            { label: 'Zoology', to: '/neet/zoology', icon: 'globe' },
            { label: 'Questions', to: '/neet/questions', icon: 'check' },
            { label: 'Revision', to: '/neet/revision', icon: 'clock' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur transition hover:-translate-y-0.5 hover:border-emerald-400/40"
            >
              <div className="rounded-full bg-emerald-500/15 p-3 text-emerald-300">
                <Icon name={item.icon} className="h-5 w-5" />
              </div>
              <p className="font-semibold text-white">{item.label}</p>
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
      <Section eyebrow="About the Teacher" title={site.name} className="bg-white dark:bg-navy-950">
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
      <section className="border-t border-navy-800 bg-navy-900">
        <div className="container-page flex flex-col items-center gap-4 py-16 text-center">
          <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
            Have a question about classes, courses or study material?
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn-primary bg-cyan-400 text-navy-950 hover:bg-cyan-300">
              Get in Touch
            </Link>
            <WhatsAppButton message={generalMessage()} label="Chat on WhatsApp" />
          </div>
        </div>
      </section>
    </>
  )
}
