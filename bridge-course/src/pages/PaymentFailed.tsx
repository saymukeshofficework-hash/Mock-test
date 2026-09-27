import { Link, useSearchParams } from 'react-router-dom'
import { Page } from '../components/Layout'
import WhatsAppButton from '../components/WhatsAppButton'
import { supportMessageForOrder } from '../lib/whatsapp'

export default function PaymentFailed() {
  const [params] = useSearchParams()
  const ref = params.get('ref')?.slice(0, 20) ?? null

  return (
    <Page>
      <section className="mx-auto max-w-lg px-4 py-10 sm:py-16">
        <div className="rounded-3xl bg-paper-50 p-6 shadow-sheet ring-1 ring-paper-200 sm:p-8">
          <p className="text-3xl" aria-hidden>⚠️</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-ink-900">Payment could not be completed.</h1>
          <p className="mt-3 text-ink-700">Your order has not been granted access yet.</p>
          <p className="mt-2 text-sm text-ink-500">
            If money was deducted from your account, don’t pay again straight away — first use
            {' '}<Link to={`/check-status${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`} className="font-semibold underline">Check Payment Status</Link>.
            Payments that didn’t complete are reversed by your bank.
          </p>
          {ref && (
            <p className="mt-4 rounded-xl bg-paper-100 px-4 py-3 text-sm">
              Order reference: <span className="font-mono font-semibold">{ref}</span>
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3">
            <Link to="/" className="btn-primary w-full">TRY AGAIN</Link>
            <WhatsAppButton label="CONTACT SUPPORT" message={supportMessageForOrder(ref)} />
          </div>
        </div>
      </section>
    </Page>
  )
}
