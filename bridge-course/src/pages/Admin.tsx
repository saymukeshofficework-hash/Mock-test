// /admin — protected by Supabase Auth AND the bridge_admins allowlist. The URL is not
// the protection: every number and action here comes from SECURITY DEFINER functions
// that re-check is_bridge_admin() in the database, so a non-admin (e.g. a TET student
// who is also a Supabase user) gets "forbidden" no matter what this page does.
import { createClient, type Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { site } from '../config'
import { absoluteUrl } from '../lib/base'

const supabase = createClient(site.supabaseUrl, site.supabasePublishableKey, {
  auth: { storageKey: 'bc-admin-auth', persistSession: true },
})

type Stats = {
  total_orders: number
  paid_orders: number
  failed_orders: number
  pending_orders: number
  refunded_orders: number
  revenue_paise: number
  today_paid_orders: number
  today_revenue_paise: number
  funnel_7d: Record<string, number>
}

type Row = {
  order_id: string
  public_reference: string
  created_at: string
  status: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  amount_paise: number
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  payment_method: string | null
  purchase_id: string | null
  download_count: number | null
  max_downloads: number | null
  last_download_at: string | null
  access_active: boolean | null
  access_expires_at: string | null
  has_token: boolean | null
}

const inr = (p: number) => `₹${(p / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const when = (s: string | null) => (s ? new Date(s).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—')

const STATUS_STYLE: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  payment_pending: 'bg-amber-100 text-amber-900',
  created: 'bg-slate-100 text-slate-700',
  refunded: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-slate-100 text-slate-500',
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setErr('Login failed. Check the email and password.')
    setBusy(false)
  }

  const field = 'mt-1 block w-full rounded-xl border border-paper-300 bg-white px-4 py-3 outline-none focus:border-saffron-500'
  return (
    <form onSubmit={submit} className="mx-auto mt-16 max-w-sm rounded-3xl bg-paper-50 p-6 shadow-sheet">
      <h1 className="font-serif text-2xl font-semibold">Admin login</h1>
      <label className="mt-4 block text-sm font-medium">Email
        <input className={field} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="mt-3 block text-sm font-medium">Password
        <input className={field} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {err && <p className="mt-3 text-sm text-red-700">{err}</p>}
      <button className="btn-primary mt-5 w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  )
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl bg-paper-50 p-4 ring-1 ring-paper-200">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-ink-900">{value}</p>
      {sub && <p className="text-xs text-ink-500">{sub}</p>}
    </div>
  )
}

function Dashboard({ session }: { session: Session }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [search, setSearch] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [issued, setIssued] = useState<{ ref: string; url: string } | null>(null)

  const load = useCallback(async (q = '') => {
    setErr(null)
    const [s, l] = await Promise.all([
      supabase.rpc('bridge_admin_stats'),
      supabase.rpc('bridge_admin_list_orders', { p_search: q || null, p_limit: 200 }),
    ])
    if (s.error || l.error) {
      setErr('Could not load data. Your account may not be a Bridge Course admin.')
      return
    }
    setStats(s.data as Stats)
    setRows(l.data as Row[])
  }, [])

  useEffect(() => { load() }, [load])

  async function act(row: Row, action: 'reset_downloads' | 'disable' | 'enable' | 'issue_link') {
    if (!row.purchase_id) return
    const confirmText: Record<string, string> = {
      reset_downloads: `Reset downloads to 0 for ${row.buyer_name}?`,
      disable: `Disable access for ${row.buyer_name}? Their download link will stop working.`,
      enable: `Enable access for ${row.buyer_name}?`,
      issue_link: `Issue a NEW download link for ${row.buyer_name}? Their old link will stop working.`,
    }
    if (!window.confirm(confirmText[action])) return
    const { data, error } = await supabase.rpc('bridge_admin_purchase_action', { p_purchase_id: row.purchase_id, p_action: action })
    if (error) {
      window.alert('Action failed.')
      return
    }
    if (action === 'issue_link' && typeof data === 'string') {
      setIssued({ ref: row.public_reference, url: `${absoluteUrl('success')}#t=${data}` })
    }
    load(search)
  }

  const funnel = useMemo(() => stats?.funnel_7d ?? {}, [stats])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Bridge Course — Sales</h1>
          <p className="text-sm text-ink-500">Signed in as {session.user.email}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => load(search)} className="btn-secondary !min-h-[40px] !px-4 !text-sm">Refresh</button>
          <button onClick={() => supabase.auth.signOut()} className="btn-secondary !min-h-[40px] !px-4 !text-sm">Sign out</button>
        </div>
      </div>

      {err && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-red-800">{err}</p>}

      {stats && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Stat label="Revenue" value={inr(stats.revenue_paise)} />
            <Stat label="Today's sales" value={stats.today_paid_orders} sub={inr(stats.today_revenue_paise)} />
            <Stat label="Paid orders" value={stats.paid_orders} />
            <Stat label="Total orders" value={stats.total_orders} sub={`${stats.pending_orders} pending`} />
            <Stat label="Failed" value={stats.failed_orders} />
            <Stat label="Refunded" value={stats.refunded_orders} />
          </div>
          <p className="mt-3 text-xs text-ink-500">
            Last 7 days — views {funnel.landing_page_view ?? 0} · buy clicks {funnel.buy_button_click ?? 0} · checkouts {funnel.checkout_opened ?? 0}
            {' '}· paid {funnel.payment_success ?? 0} · failed {funnel.payment_failed ?? 0} · downloads {funnel.download_started ?? 0}
          </p>
        </>
      )}

      {issued && (
        <div className="mt-5 rounded-2xl bg-green-50 p-4 text-sm ring-1 ring-green-200">
          <p className="font-semibold">New download link for {issued.ref} — shown once, copy it now:</p>
          <input readOnly value={issued.url} onFocus={(e) => e.currentTarget.select()} className="mt-2 w-full rounded-lg border bg-white px-3 py-2 font-mono text-xs" />
          <div className="mt-2 flex gap-2">
            <button className="btn-secondary !min-h-[36px] !px-3 !text-xs" onClick={() => navigator.clipboard?.writeText(issued.url)}>Copy</button>
            <button className="btn-secondary !min-h-[36px] !px-3 !text-xs" onClick={() => setIssued(null)}>Done</button>
          </div>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); load(search) }} className="mt-6 flex gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, phone, BCN-…, order_…"
          className="min-w-0 flex-1 rounded-xl border border-paper-300 bg-white px-4 py-2.5" />
        <button className="btn-primary !min-h-[44px] !px-5 !text-sm">Search</button>
      </form>

      <div className="mt-4 space-y-2">
        {rows.length === 0 && <p className="py-8 text-center text-ink-500">No orders yet.</p>}
        {rows.map((r) => (
          <div key={r.order_id} className="rounded-2xl bg-paper-50 ring-1 ring-paper-200">
            <button onClick={() => setOpen(open === r.order_id ? null : r.order_id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[r.status] ?? ''}`}>{r.status}</span>
              <span className="font-semibold">{r.buyer_name}</span>
              <span className="text-sm text-ink-500">{r.buyer_phone}</span>
              <span className="ml-auto text-sm tabular-nums text-ink-500">{when(r.created_at)}</span>
              {r.purchase_id && (
                <span className="text-xs text-ink-500">downloads {r.download_count}/{r.max_downloads}{r.access_active === false ? ' · DISABLED' : ''}</span>
              )}
            </button>
            {open === r.order_id && (
              <div className="border-t border-paper-200 px-4 py-3 text-sm">
                <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                  <div><dt className="inline text-ink-500">Reference: </dt><dd className="inline font-mono">{r.public_reference}</dd></div>
                  <div><dt className="inline text-ink-500">Email: </dt><dd className="inline break-all">{r.buyer_email}</dd></div>
                  <div><dt className="inline text-ink-500">Amount: </dt><dd className="inline">{inr(r.amount_paise)}</dd></div>
                  <div><dt className="inline text-ink-500">Method: </dt><dd className="inline">{r.payment_method ?? '—'}</dd></div>
                  <div><dt className="inline text-ink-500">Razorpay order: </dt><dd className="inline break-all font-mono">{r.razorpay_order_id ?? '—'}</dd></div>
                  <div><dt className="inline text-ink-500">Razorpay payment: </dt><dd className="inline break-all font-mono">{r.razorpay_payment_id ?? '—'}</dd></div>
                  {r.purchase_id && (
                    <>
                      <div><dt className="inline text-ink-500">Last download: </dt><dd className="inline">{when(r.last_download_at)}</dd></div>
                      <div><dt className="inline text-ink-500">Access until: </dt><dd className="inline">{when(r.access_expires_at)}</dd></div>
                    </>
                  )}
                </dl>
                {r.purchase_id ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="btn-secondary !min-h-[36px] !px-3 !text-xs" onClick={() => act(r, 'reset_downloads')}>Reset downloads</button>
                    {r.access_active
                      ? <button className="btn-secondary !min-h-[36px] !px-3 !text-xs !text-red-700" onClick={() => act(r, 'disable')}>Disable access</button>
                      : <button className="btn-secondary !min-h-[36px] !px-3 !text-xs" onClick={() => act(r, 'enable')}>Enable access</button>}
                    <button className="btn-secondary !min-h-[36px] !px-3 !text-xs" onClick={() => act(r, 'issue_link')}>Issue new download link</button>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-ink-500">No purchase — access is only created after a verified payment.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) { setIsAdmin(null); return }
    supabase.rpc('is_bridge_admin').then(({ data }) => setIsAdmin(data === true))
  }, [session])

  return (
    <div className="min-h-screen bg-paper-100">
      <meta name="robots" content="noindex, nofollow" />
      <div className="border-b border-paper-200 bg-paper-50 px-4 py-3 text-sm">
        <Link to="/" className="font-semibold">← Store</Link>
      </div>
      {!ready ? null : !session ? <Login /> : isAdmin === false ? (
        <div className="mx-auto mt-16 max-w-sm rounded-3xl bg-paper-50 p-6 text-center shadow-sheet">
          <p className="font-semibold">This account is not a Bridge Course admin.</p>
          <button className="btn-secondary mt-4" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      ) : isAdmin ? <Dashboard session={session} /> : null}
    </div>
  )
}
