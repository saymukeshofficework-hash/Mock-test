// First-party funnel events. No third-party tracker is added: events go to the
// insert-only `analytics_events` table (RLS lets the browser insert, never read), and
// are also pushed to window.dataLayer / gtag IF the host page already has them.
import { site } from '../config'

export type EventName =
  | 'landing_page_view'
  | 'buy_button_click'
  | 'checkout_opened'
  | 'payment_success'
  | 'payment_failed'
  | 'download_started'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function source(): string | null {
  try {
    const p = new URLSearchParams(window.location.search)
    const s = p.get('utm_source') || p.get('src') || p.get('ref')
    if (s) return s.slice(0, 64)
    const ua = navigator.userAgent
    if (/WhatsApp/i.test(ua)) return 'whatsapp-inapp'
    if (document.referrer) return new URL(document.referrer).hostname.slice(0, 64)
  } catch {
    // ignore
  }
  return null
}

export function track(event: EventName): void {
  try {
    window.dataLayer?.push({ event })
    window.gtag?.('event', event)
  } catch {
    // ignore
  }
  try {
    const body = JSON.stringify({ event, source: source() })
    fetch(`${site.supabaseUrl}/rest/v1/analytics_events`, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        apikey: site.supabasePublishableKey,
        Prefer: 'return=minimal',
      },
      body,
    }).catch(() => {})
  } catch {
    // analytics must never break the page
  }
}
