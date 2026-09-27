import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Page } from '../components/Layout'
import WhatsAppButton from '../components/WhatsAppButton'
import { access } from '../lib/access'
import { track } from '../lib/analytics'
import { api, ApiError } from '../lib/api'
import { supportMessageForOrder } from '../lib/whatsapp'

// Payment recovery: "money deducted but no download", closed browser, failed callback,
// late webhook. The server re-checks with Razorpay and only unlocks when the order
// reference (or Razorpay payment id) AND the buyer's email/mobile match a captured
// payment of the right amount.
export default function CheckStatus() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const pending = access.getPending()
  const initialRef = params.get('ref') ?? pending?.orderReference ?? ''
  const [ref, setRef] = useState(initialRef)
  const [contact, setContact] = useState(pending && pending.orderReference === initialRef ? pending.phone : '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ tone: 'info' | 'error'; text: string } | null>(null)
  const autoTries = useRef(0)

  async function check(e?: FormEvent) {
    e?.preventDefault()
    if (!ref.trim() || contact.trim().length < 5) {
      setMsg({ tone: 'error', text: 'Enter your order reference (or Razorpay payment ID) and the mobile number or email you used.' })
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      const { status, data } = await api.recover(ref.trim(), contact.trim())
      if (data.status === 'paid' && data.access_token) {
        access.save(data.access_token, data.order_reference)
        track('payment_success')
        navigate('/success', { replace: true })
        return
      }
      if (status === 202 && autoTries.current < 6) {
        autoTries.current += 1
        setMsg({ tone: 'info', text: 'Payment verification is still processing. Checking again…' })
        setTimeout(() => check(), 5000)
        return
      }
      setMsg({ tone: 'info', text: data.message ?? 'We could not confirm your payment yet. Please contact support.' })
    } catch (err) {
      setMsg({ tone: 'error', text: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  // Coming straight from checkout (?auto=1) with a saved pending order: check at once.
  useEffect(() => {
    if (params.get('auto') === '1' && ref && contact) check()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const field = 'mt-1 block w-full rounded-xl border border-paper-300 bg-white px-4 py-3.5 text-base outline-none focus:border-saffron-500 focus:ring-4 focus:ring-saffron-400/20'

  return (
    <Page>
      <section className="mx-auto max-w-lg px-4 py-10 sm:py-16">
        <div className="rounded-3xl bg-paper-50 p-6 shadow-sheet ring-1 ring-paper-200 sm:p-8">
          <h1 className="font-serif text-3xl font-semibold text-ink-900">Check Payment Status</h1>
          <p className="mt-2 text-ink-700">Paid but didn’t get the download, or closed the page? Get your access back here.</p>
          <form onSubmit={check} className="mt-6 space-y-4" noValidate>
            <label className="block">
              <span className="text-sm font-medium">Order reference or Razorpay payment ID</span>
              <input className={`${field} font-mono`} value={ref} onChange={(e) => setRef(e.target.value)}
                placeholder="BCN-XXXXXXXXXX or pay_XXXXXXXX" autoCapitalize="characters" spellCheck={false} maxLength={64} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Mobile number or email used at checkout</span>
              <input className={field} value={contact} onChange={(e) => setContact(e.target.value)} autoComplete="tel" maxLength={254} />
            </label>
            {msg && (
              <p className={`rounded-xl px-4 py-3 text-sm ${msg.tone === 'error' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-900'}`} role="status">
                {msg.text}
              </p>
            )}
            <button className="btn-primary w-full" disabled={busy}>{busy ? 'Checking…' : 'CHECK PAYMENT STATUS'}</button>
          </form>
          <p className="mt-5 text-sm text-ink-500">
            The Razorpay payment ID (starts with <span className="font-mono">pay_</span>) is in the payment confirmation
            SMS/email from Razorpay.
          </p>
          <div className="mt-5 border-t border-paper-200 pt-5">
            <WhatsAppButton message={supportMessageForOrder(ref || null)} />
          </div>
        </div>
      </section>
    </Page>
  )
}
