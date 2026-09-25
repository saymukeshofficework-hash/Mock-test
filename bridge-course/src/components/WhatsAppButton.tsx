import { Link } from 'react-router-dom'
import { hasWhatsApp, supportUrl } from '../lib/whatsapp'

export function WhatsAppIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1a8.2 8.2 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.8 1 3.9.8a3.3 3.3 0 0 0 2.1-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.1-.3-.2-.6-.3ZM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8ZM12 0a12 12 0 0 0-10.3 18l-1.7 6 6.2-1.6A12 12 0 1 0 12 0Z" />
    </svg>
  )
}

// Falls back to the /contact page when no WhatsApp number is configured, so no
// number is ever hard-coded and no button leads nowhere.
export default function WhatsAppButton({
  label = 'CONTACT ON WHATSAPP',
  message,
  className = 'btn-whatsapp',
}: { label?: string; message?: string; className?: string }) {
  if (!hasWhatsApp) {
    return <Link to="/contact" className={className.replace('btn-whatsapp', 'btn-secondary')}>CONTACT SUPPORT</Link>
  }
  return (
    <a href={supportUrl(message)} target="_blank" rel="noopener" className={className}>
      <WhatsAppIcon /> {label}
    </a>
  )
}
