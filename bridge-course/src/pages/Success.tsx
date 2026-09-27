import { useState } from 'react'
import { Link } from 'react-router-dom'
import DownloadPanel from '../components/DownloadPanel'
import { Page } from '../components/Layout'
import WhatsAppButton from '../components/WhatsAppButton'
import { product } from '../config'
import { useLang } from '../i18n'
import { access, takeTokenFromHash } from '../lib/access'
import { supportMessageForOrder } from '../lib/whatsapp'

export default function Success() {
  const { t } = useLang()
  // Token sources, in order: a link sent by support (#t=…), or this device's storage.
  const [stored] = useState(() => {
    const fromHash = takeTokenFromHash()
    if (fromHash) {
      access.save(fromHash, '')
      return access.get()
    }
    return access.get()
  })

  return (
    <Page>
      <section className="mx-auto max-w-lg px-4 py-10 sm:py-16">
        {stored ? (
          <div className="rounded-3xl bg-paper-50 p-6 shadow-sheet ring-1 ring-paper-200 sm:p-8">
            <p className="text-3xl" aria-hidden>✅</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold text-ink-900">{t.success.title}</h1>
            <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-paper-100 px-4 py-3">
              <p className="font-semibold leading-snug text-ink-900">{product.name}</p>
              <p className="font-serif text-2xl font-bold">{product.priceDisplay}</p>
            </div>
            <div className="mt-6">
              <DownloadPanel token={stored.token} />
            </div>
            <div className="mt-6 border-t border-paper-200 pt-5">
              <WhatsAppButton label={t.success.support} message={supportMessageForOrder(stored.orderReference)} />
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-paper-50 p-6 text-center shadow-sheet ring-1 ring-paper-200 sm:p-8">
            <h1 className="font-serif text-2xl font-semibold text-ink-900">{t.success.notFoundTitle}</h1>
            <p className="mt-2 text-ink-700">
              {t.success.notFoundBody}
            </p>
            <Link to="/check-status" className="btn-primary mt-6 w-full">{t.success.check}</Link>
            <div className="mt-3"><WhatsAppButton /></div>
          </div>
        )}
      </section>
    </Page>
  )
}
