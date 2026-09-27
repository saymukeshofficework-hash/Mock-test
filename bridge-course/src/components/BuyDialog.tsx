import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { product, site } from '../config'
import { access } from '../lib/access'
import { track } from '../lib/analytics'
import { api, ApiError } from '../lib/api'
import { loadCheckout, openCheckout } from '../lib/razorpay'

type Stage = 'form' | 'starting' | 'checkout' | 'verifying'

const PHONE = /^[6-9]\d{9}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function normalisePhone(v: string) {
  const d = v.replace(/\D/g, '')
  if (d.length === 12 && d.startsWith('91')) return d.slice(2)
  if (d.length === 11 && d.startsWith('0')) return d.slice(1)
  return d
}

export default function BuyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [stage, setStage] = useState<Stage>('form')
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
      // Warm up checkout.js while the buyer types.
      loadCheckout().catch(() => {})
    }
    if (!open && d.open) d.close()
  }, [open])

  const phone = normalisePhone(form.phone)
  const errors = {
    name: form.name.trim().length < 2 ? 'Please enter your full name.' : '',
    phone: !PHONE.test(phone) ? 'Enter a valid 10-digit mobile number.' : '',
    email: !EMAIL.test(form.email.trim()) ? 'Enter a valid email address.' : '',
  }
  const valid = !errors.name && !errors.phone && !errors.email
  const busy = stage !== 'form'

  async function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    setError(null)
    if (!valid || busy) return
    setStage('starting')

    const buyer = { buyer_name: form.name.trim(), buyer_email: form.email.trim().toLowerCase(), buyer_phone: phone }
    try {
      const [{ data: order }] = await Promise.all([api.createOrder(buyer, product.slug), loadCheckout()])
      access.savePending({ orderReference: order.internal_order_reference, email: buyer.buyer_email, phone })

      setStage('checkout')
      track('checkout_opened')
      openCheckout(
        {
          key: order.razorpay_key_id || site.razorpayKeyIdFallback,
          amount: order.amount, // from the server, never from this page
          currency: order.currency,
          name: product.name,
          description: `Digital PDF notes — ${product.priceDisplay}`,
          order_id: order.razorpay_order_id,
          prefill: { name: buyer.buyer_name, email: buyer.buyer_email, contact: `+91${phone}` },
          notes: { order_reference: order.internal_order_reference },
          theme: { color: '#10213a' },
          modal: { confirm_close: true, ondismiss: () => setStage('form') },
          handler: async (resp) => {
            setStage('verifying')
            try {
              const { status, data } = await api.verifyPayment(resp)
              if (status === 200 && data.access_token) {
                access.save(data.access_token, data.order_reference)
                track('payment_success')
                navigate('/success', { replace: true })
              } else {
                navigate(`/check-status?ref=${encodeURIComponent(order.internal_order_reference)}&auto=1`, { replace: true })
              }
            } catch {
              // Money may have moved even if our verify call failed — send them to
              // recovery, which re-checks with Razorpay server-side.
              navigate(`/check-status?ref=${encodeURIComponent(order.internal_order_reference)}&auto=1`, { replace: true })
            }
          },
        },
        () => {
          track('payment_failed')
          navigate(`/payment-failed?ref=${encodeURIComponent(order.internal_order_reference)}`)
        },
      )
    } catch (err) {
      setStage('form')
      setError(err instanceof ApiError ? err.message : 'Unable to start payment. Please try again.')
    }
  }

  const field = 'mt-1 block w-full rounded-xl border border-paper-300 bg-white px-4 py-3.5 text-base text-ink-900 outline-none transition focus:border-saffron-500 focus:ring-4 focus:ring-saffron-400/20'

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={(e) => { if (busy) e.preventDefault() }}
      className="m-0 mt-auto w-full max-w-none rounded-t-3xl bg-paper-50 p-0 text-ink-900 shadow-sheet backdrop:bg-ink-950/60 sm:m-auto sm:max-w-md sm:rounded-3xl"
      aria-labelledby="buy-title"
    >
      <form onSubmit={submit} noValidate className="px-5 pb-6 pt-5 sm:px-7 sm:pb-7">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-paper-300 sm:hidden" aria-hidden />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="buy-title" className="font-serif text-2xl font-semibold leading-tight">{product.shortName}</h2>
            <p className="mt-0.5 text-sm text-ink-500">by {product.author} · PDF</p>
          </div>
          <div className="text-right">
            <p className="font-serif text-3xl font-bold text-ink-900">{product.priceDisplay}</p>
          </div>
        </div>

        {stage === 'verifying' ? (
          <div className="py-10 text-center" role="status" aria-live="polite">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-paper-300 border-t-saffron-500" />
            <p className="mt-4 font-medium">Verifying your payment…</p>
            <p className="mt-1 text-sm text-ink-500">Please don’t close this page.</p>
          </div>
        ) : (
          <>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Full name</span>
                <input className={field} autoComplete="name" value={form.name} maxLength={80}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={busy} />
                {touched && errors.name && <span className="mt-1 block text-sm text-red-700">{errors.name}</span>}
              </label>
              <label className="block">
                <span className="text-sm font-medium">Mobile number</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 mt-0.5 -translate-y-1/2 text-base text-ink-500">+91</span>
                  <input className={`${field} pl-14`} type="tel" inputMode="numeric" autoComplete="tel-national"
                    value={form.phone} maxLength={18}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={busy} />
                </div>
                {touched && errors.phone && <span className="mt-1 block text-sm text-red-700">{errors.phone}</span>}
              </label>
              <label className="block">
                <span className="text-sm font-medium">Email</span>
                <input className={field} type="email" inputMode="email" autoComplete="email" value={form.email} maxLength={254}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={busy} />
                {touched && errors.email && <span className="mt-1 block text-sm text-red-700">{errors.email}</span>}
              </label>
            </div>

            {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p>}

            <button type="submit" disabled={busy} className="btn-primary mt-6 w-full">
              {stage === 'form' ? `PAY ${product.priceDisplay} SECURELY` : 'Opening secure payment…'}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-ink-500">
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden><path d="M10 1.5 3.5 4v5.2c0 4 2.8 7.6 6.5 8.8 3.7-1.2 6.5-4.8 6.5-8.8V4L10 1.5Z" /></svg>
              Payments are processed by Razorpay. We never see your card or UPI PIN.
            </p>
            <button type="button" onClick={onClose} disabled={busy}
              className="mt-1 w-full py-3 text-sm font-medium text-ink-500 underline-offset-4 hover:underline">
              Cancel
            </button>
          </>
        )}
      </form>
    </dialog>
  )
}
