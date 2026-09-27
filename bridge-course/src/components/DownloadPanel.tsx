import { useEffect, useState } from 'react'
import { track } from '../lib/analytics'
import { useLang } from '../i18n'
import { api, type TokenStatus } from '../lib/api'

export default function DownloadPanel({ token }: { token: string }) {
  const { t, errorText } = useLang()
  const [status, setStatus] = useState<TokenStatus | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    api.tokenStatus(token)
      .then(({ data }) => setStatus(data))
      .catch((e) => setLoadErr(errorText(e, t.download.loadErr)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setMsg(t.download.started(data.downloads_left))
    } catch (e) {
      setMsg(errorText(e, t.download.failed))
    } finally {
      setBusy(false)
    }
  }

  if (loadErr) return <p className="rounded-xl bg-red-50 px-4 py-3 text-red-800" role="alert">{loadErr}</p>
  if (!status) return <div className="h-14 animate-pulse rounded-2xl bg-paper-200" aria-label={t.download.loading} />

  const active = status.status === 'active'
  return (
    <div>
      {active ? (
        <button onClick={download} disabled={busy} className="btn-primary w-full text-lg">
          {busy ? t.download.preparing : t.download.button}
        </button>
      ) : (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-amber-900" role="alert">{t.download.reasons[status.status]}</p>
      )}
      {msg && <p className="mt-3 text-sm text-ink-700" role="status">{msg}</p>}
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-paper-100 p-3">
          <dt className="text-ink-500">{t.download.left}</dt>
          <dd className="mt-0.5 text-lg font-semibold">{t.download.of(status.downloads_left)}</dd>
        </div>
        <div className="rounded-xl bg-paper-100 p-3">
          <dt className="text-ink-500">{t.download.ref}</dt>
          <dd className="mt-0.5 break-all font-mono text-[15px] font-semibold">{status.order_reference}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-ink-500">
        {t.download.note}
      </p>
    </div>
  )
}
