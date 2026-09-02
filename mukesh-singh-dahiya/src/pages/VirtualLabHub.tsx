import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Icon from '../components/Icon'
import { labExperiments } from '../data/virtualLab'

export default function VirtualLabHub() {
  return (
    <>
      <SEO
        title="3D Virtual Biology Lab — Interactive Microscope, Cells & Genetics"
        description="Experience the 3D Virtual Biology Laboratory. Operate compound microscopes, explore plant & animal cells in 360°, inspect DNA double helix, and dissect flowers for Classes 6 to 12 & NEET."
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Virtual Biology Lab' },
        ]}
      />

      <div className="container-custom py-8 lg:py-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-brand-950 p-8 text-white shadow-xl lg:p-12">
          {/* Background Glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/60 px-3.5 py-1 text-xs font-bold text-cyan-300 backdrop-blur">
              <Icon name="sparkles" className="h-3.5 w-3.5 text-cyan-400" />
              <span>Next-Gen WebGL 3D Simulator</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400">Live & Interactive</span>
            </div>

            <h1 className="mt-4 font-serif text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              3D Virtual Biology Lab
            </h1>

            <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
              Step onto the virtual workbench. Examine prepared slides under a realistic compound microscope, rotate plant and animal cells in 360°, unravel the DNA double helix, and conduct physiological experiments with zero lab fees.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                to="/virtual-lab/microscope"
                className="btn-primary gap-2 shadow-lg shadow-brand-500/20"
              >
                <Icon name="microscope" className="h-4 w-4" />
                <span>Launch Microscope Simulator</span>
              </Link>
              <Link
                to="/virtual-lab/cell"
                className="btn-secondary gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                <Icon name="atom" className="h-4 w-4" />
                <span>Explore 3D Cells</span>
              </Link>
            </div>

            {/* Quick Badge Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
              <div>
                <span className="block font-serif text-2xl font-bold text-cyan-300">5</span>
                <span className="text-xs text-slate-400">3D Lab Stations</span>
              </div>
              <div>
                <span className="block font-serif text-2xl font-bold text-emerald-400">100%</span>
                <span className="text-xs text-slate-400">Interactive WebGL</span>
              </div>
              <div>
                <span className="block font-serif text-2xl font-bold text-amber-300">6 to 12</span>
                <span className="text-xs text-slate-400">CBSE & MP Board</span>
              </div>
              <div>
                <span className="block font-serif text-2xl font-bold text-pink-400">NEET</span>
                <span className="text-xs text-slate-400">Exam Aligned</span>
              </div>
            </div>
          </div>
        </div>

        {/* Experiment Stations Grid */}
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="section-label">Interactive Workbenches</span>
              <h2 className="section-heading mt-1">Select an Experiment Station</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
              Each station is equipped with 3D real-time rendering, slide mounting, procedural controls, and Mukesh Sir's practical exam tips.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {labExperiments.map((exp) => (
              <div
                key={exp.id}
                className="card flex flex-col justify-between p-6 transition-all hover:-translate-y-1 hover:shadow-card-lg border border-slate-200/80 dark:border-navy-700/80"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40">
                      {exp.category}
                    </span>
                    <span className="rounded bg-brand-50 px-2 py-0.5 text-[11px] font-extrabold text-brand-700 dark:bg-navy-800 dark:text-cyan-400">
                      {exp.badge}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-cyan-500 text-white shadow-md">
                      <Icon name={exp.icon} className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white leading-snug">
                        {exp.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {exp.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {exp.description}
                  </p>

                  {/* Target Classes */}
                  <div className="mt-4 flex flex-wrap gap-1">
                    {exp.classes.slice(0, 4).map((c) => (
                      <span
                        key={c}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-navy-800 dark:text-slate-300"
                      >
                        {c}
                      </span>
                    ))}
                    {exp.classes.length > 4 && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-navy-800">
                        +{exp.classes.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-navy-800">
                  <Link
                    to={`/virtual-lab/${exp.slug}`}
                    className="btn-primary w-full justify-center gap-2 text-xs py-2.5"
                  >
                    <span>Launch 3D Lab</span>
                    <Icon name="chevronRight" className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mukesh Sir's Practical Lab Guidelines */}
        <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 dark:border-navy-800 dark:bg-navy-900/40 lg:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Icon name="graduation" className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white">
                Mukesh Sir’s Practical Exam Advice
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Essential laboratory habits for 100% marks in CBSE & MP Board practical exams
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-900">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-cyan-400">
                1. Avoid Air Bubbles
              </h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Always lower the cover slip gently at a 45° angle with a mounting needle to avoid trapping spherical air bubbles that look like artificial dark rings.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-900">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-cyan-400">
                2. Optimal Staining
              </h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Excess stain obscures cellular details. Always blot extra dye using filter paper from the side of the cover slip before placing on the stage.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-900">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-cyan-400">
                3. High Power Focus Safety
              </h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Never use coarse adjustment when focusing under 40x or 100x. The short working distance can shatter the glass slide and damage the front lens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
