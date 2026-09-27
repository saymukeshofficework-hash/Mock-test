// Loads Razorpay Standard Checkout (checkout.js) on demand — not on page load — so the
// landing page stays light for people arriving from WhatsApp.

export type RazorpaySuccess = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export type RazorpayOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: { name: string; email: string; contact: string }
  notes?: Record<string, string>
  theme?: { color: string }
  handler: (r: RazorpaySuccess) => void
  modal?: { ondismiss?: () => void; confirm_close?: boolean }
  retry?: { enabled: boolean }
}

type RazorpayInstance = {
  open: () => void
  close: () => void
  on: (event: 'payment.failed', cb: (r: { error?: { description?: string } }) => void) => void
}

declare global {
  interface Window {
    Razorpay?: new (o: RazorpayOptions) => RazorpayInstance
  }
}

const SRC = 'https://checkout.razorpay.com/v1/checkout.js'
let loading: Promise<void> | null = null

export function loadCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  if (loading) return loading
  loading = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SRC
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      loading = null
      reject(new Error('Could not load Razorpay'))
    }
    document.head.appendChild(s)
  })
  return loading
}

export function openCheckout(
  options: RazorpayOptions,
  onFailed: (description?: string) => void,
): RazorpayInstance {
  if (!window.Razorpay) throw new Error('Razorpay not loaded')
  const rzp = new window.Razorpay(options)
  rzp.on('payment.failed', (r) => onFailed(r?.error?.description))
  rzp.open()
  return rzp
}
