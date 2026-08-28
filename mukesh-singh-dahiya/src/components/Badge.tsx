import type { ReactNode } from 'react'

type Tone = 'brand' | 'gold' | 'green' | 'slate' | 'red'

const tones: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
  gold: 'bg-gold-300/20 text-gold-500 ring-1 ring-inset ring-gold-400/30 dark:text-gold-300',
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-navy-700 dark:text-slate-300',
  red: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
}

export default function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`badge relative overflow-hidden ${tones[tone]}`}>
      {children}
      {tone === 'gold' && (
        <span
          aria-hidden="true"
          className="badge-shimmer pointer-events-none absolute inset-0 bg-shimmer"
        />
      )}
    </span>
  )
}

export function AccessBadge({ access }: { access: 'free' | 'paid' | 'preview' }) {
  if (access === 'free') return <Badge tone="green">Free</Badge>
  if (access === 'preview') return <Badge tone="gold">Preview</Badge>
  return <Badge tone="gold">Premium</Badge>
}
