import { useEffect, useState } from 'react'
import { product } from '../config'
import { track } from '../lib/analytics'
import { api, ApiError, type TokenStatus } from '../lib/api'

const REASON_TEXT: Record<string, string> = {
  disabled: 'Access for this purchase has been disabled. Please contact support.',
  not_paid: 'We could not confirm your payment yet. Please contact support.',
  expired: 'Your download link has expired. Please request a new one using “Check Payment Status”.',
  limit: 'You have used all your downloads. Please contact support if you need another.',
}

export default function DownloadPanel({ token }: { token: string }) {
  const [status, setStatus] = useState<TokenStatus | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    api.tokenStatus(token)
      .then(({ data }) => setStatus(data))
      .catch((e) => setLoadErr(e instanceof ApiError ? e.message : 'Could not load your purchase.'))
  }, [token])

  async function download() {
    setBusy(true)
    setMsg(null)
    try {
      const { data } = await api.downloadLink(token)
      track('download_started')
      setStatus((s) => (s ? { ...s, downloads_left: data.downloads_left, status: data.downloads_left > 0 ? s.status : 'limit' } : s))
      // Navigate to the short-lived signed URL; Storage sends it as an attachment.
      window.location.href = data.url
      setMsg(`Your download has started. ${data.downloads_left} download${data.downloads_left === 1 ? '' : 's'} left.`)
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : 'Download failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (loadErr) return <p className="rounded-xl bg-red-50 px-4 py-3 text-red-800" role="alert">{loadErr}</p>
  if (!status) return <div className="h-14 animate-pulse rounded-2xl bg-paper-200" aria-label="Loading" />

  const active = status.status === 'active'
  return (
    <div>
      {active ? (
        <button onClick={download} disabled={busy} className="btn-primary w-full text-lg">
          {busy ? 'Preparing secure link…' : 'DOWNLOAD NOTES'}
        </button>
      ) : (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-amber-900" role="alert">{REASON_TEXT[status.status]}</p>
      )}
      {msg && <p className="mt-3 text-sm text-ink-700" role="status">{msg}</p>}
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-paper-100 p-3">
          <dt className="text-ink-500">Downloads left</dt>
          <dd className="mt-0.5 text-lg font-semibold">{status.downloads_left} of {product.maxDownloads}</dd>
        </div>
        <div className="rounded-xl bg-paper-100 p-3">
          <dt className="text-ink-500">Order reference</dt>
          <dd className="mt-0.5 break-all font-mono text-[15px] font-semibold">{status.order_reference}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-ink-500">
        The download link is temporary and protected — each link works for {product.linkExpiryMinutes} minutes.
        Save the PDF to your phone once it opens. Keep your order reference for support.
      </p>
    </div>
  )
}
