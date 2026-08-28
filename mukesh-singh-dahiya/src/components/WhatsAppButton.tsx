import Icon from './Icon'
import { buildWhatsAppUrl } from '../lib/whatsapp'

// Opens WhatsApp with a pre-filled, product-specific message. This is the
// entire "checkout" flow for now — payment and enrollment are confirmed
// manually by the teacher over WhatsApp. See src/lib/whatsapp.ts and
// src/config/contact.ts.
export default function WhatsAppButton({
  message,
  label = 'Chat on WhatsApp',
  variant = 'primary',
  className = '',
}: {
  message: string
  label?: string
  variant?: 'primary' | 'secondary'
  className?: string
}) {
  const base =
    variant === 'primary'
      ? 'animate-pulse-glow bg-emerald-600 text-white hover:bg-emerald-700'
      : 'border border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10'

  return (
    <a
      href={buildWhatsAppUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 motion-reduce:animate-none ${base} ${className}`}
    >
      <Icon name="whatsapp" className="h-4 w-4 transition-transform group-hover:rotate-6" />
      {label}
    </a>
  )
}
