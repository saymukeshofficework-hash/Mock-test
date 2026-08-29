import { site } from '../data/site'

export default function CinematicFooter() {
  return (
    <footer className="scene-teacher relative border-t border-white/10 px-6 py-10 text-center">
      <p className="c-serif text-sm font-semibold">{site.name}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[color:var(--c-ink-faint)]">
        Teacher • Mentor • Lifelong Learner
      </p>
      <p className="mt-4 text-xs text-[color:var(--c-ink-faint)]">© {new Date().getFullYear()} {site.name}</p>
    </footer>
  )
}
