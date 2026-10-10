"use client";

// Bridge Course orders (separate Supabase project). Needs its own sign-in: every list and
// action is a SECURITY DEFINER function that re-checks is_bridge_admin() in the database,
// so only emails in the bridge_admins table can see or change anything.
import { useCallback, useEffect, useState } from "react";
import { Ban, Copy, LogOut, RefreshCw, RotateCcw, Search, Undo2 } from "lucide-react";

const SB_URL = "https://ovaubhekxjtkodkhsybg.supabase.co";
const SB_KEY = "sb_publishable_LXYxPPuR4tX7vGyWg7NIyA_-F_ieSGW"; // public key, safe in the browser
const TOKEN_KEY = "bc_admin_token";

type Row = {
  order_id: string;
  public_reference: string;
  created_at: string;
  status: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  amount_paise: number;
  razorpay_payment_id: string | null;
  purchase_id: string | null;
  download_count: number | null;
  max_downloads: number | null;
  access_active: boolean | null;
};
type Stats = { paid_orders: number; revenue_paise: number; today_paid_orders: number; today_revenue_paise: number; refunded_orders: number };
type Action = "reset_downloads" | "disable" | "enable" | "issue_link";

const rupees = (paise: number) => "₹" + (paise / 100).toLocaleString("en-IN");
const when = (s: string | null) =>
  s ? new Date(s).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "—";

async function rpc<T>(token: string, fn: string, args: Record<string, unknown> = {}): Promise<{ data?: T; status: number }> {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: SB_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    return r.ok ? { data: (await r.json()) as T, status: r.status } : { status: r.status };
  } catch {
    return { status: 0 };
  }
}

export function BridgeAdmin() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [issued, setIssued] = useState("");

  const signOut = () => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    setToken("");
    setRows([]);
    setStats(null);
  };

  const load = useCallback(async (t: string, term = "") => {
    setBusy(true);
    const [s, l] = await Promise.all([
      rpc<Stats>(t, "bridge_admin_stats"),
      rpc<Row[]>(t, "bridge_admin_list_orders", { p_search: term || null, p_limit: 200 }),
    ]);
    setBusy(false);
    if (s.status === 401 || l.status === 401) {
      signOut();
      setMsg("Session expired. Sign in again. / दोबारा लॉगिन करें।");
      return;
    }
    if (!s.data || !l.data) {
      setMsg("Could not load. This email may not be a Bridge Course admin. / यह ईमेल एडमिन नहीं है।");
      return;
    }
    setMsg("");
    setStats(s.data);
    setRows(l.data);
  }, []);

  useEffect(() => {
    try {
      const t = sessionStorage.getItem(TOKEN_KEY);
      if (t) {
        setToken(t);
        load(t);
      }
    } catch {
      /* ignore */
    }
  }, [load]);

  const signIn = async () => {
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: SB_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const d = await r.json();
      setBusy(false);
      if (!r.ok || !d.access_token) {
        setMsg("Login failed. Check email and password. / लॉगिन नहीं हुआ।");
        return;
      }
      try {
        sessionStorage.setItem(TOKEN_KEY, d.access_token);
      } catch {
        /* ignore */
      }
      setPassword("");
      setToken(d.access_token);
      load(d.access_token);
    } catch {
      setBusy(false);
      setMsg("Could not connect. Try again.");
    }
  };

  const act = async (r: Row, action: Action) => {
    if (!r.purchase_id) return;
    const ask: Record<Action, string> = {
      reset_downloads: `Reset downloads to 0 for ${r.buyer_name}?`,
      disable: `Remove access for ${r.buyer_name}? Their download link will stop working.`,
      enable: `Give access back to ${r.buyer_name}?`,
      issue_link: `Issue a NEW download link for ${r.buyer_name}? The old link will stop working.`,
    };
    if (!window.confirm(ask[action])) return;
    setBusy(true);
    const res = await rpc<string>(token, "bridge_admin_purchase_action", { p_purchase_id: r.purchase_id, p_action: action });
    setBusy(false);
    if (res.status >= 300 || res.status === 0) {
      setMsg("Action failed. / काम नहीं हुआ।");
      return;
    }
    if (action === "issue_link" && typeof res.data === "string") setIssued(`${location.origin}/bridge-course/success#t=${res.data}`);
    load(token, q);
  };

  return (
    <section id="bridge" className="mt-10 border-t border-ink-200 pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-brand-900">Bridge Course (NIOS) / ब्रिज कोर्स</h2>
        {token ? (
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={() => load(token, q)} className="btn-outline px-3 py-1.5 text-sm">
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh
            </button>
            <button type="button" onClick={signOut} className="btn-outline px-3 py-1.5 text-sm">
              <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
            </button>
          </div>
        ) : null}
      </div>

      {!token ? (
        <form
          className="card mt-4 max-w-sm p-5"
          onSubmit={(e) => {
            e.preventDefault();
            signIn();
          }}
        >
          <p className="text-sm text-ink-700">Sign in with your Bridge Course admin email. / ब्रिज कोर्स एडमिन ईमेल से लॉगिन करें।</p>
          <input type="email" autoComplete="username" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-3 w-full rounded-lg border border-ink-200 px-3 py-2" />
          <input type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-ink-200 px-3 py-2" />
          <button type="submit" disabled={busy || !email || !password} className="btn-primary mt-3 w-full disabled:opacity-60">
            {busy ? "Checking…" : "Sign in"}
          </button>
        </form>
      ) : null}

      {msg ? <p role="alert" className="mt-3 text-sm text-danger-700">{msg}</p> : null}

      {token && stats ? (
        <dl className="mt-4 grid grid-cols-3 gap-3">
          {[
            ["Today", `${stats.today_paid_orders} sales`, stats.today_revenue_paise],
            ["All paid", `${stats.paid_orders} sales`, stats.revenue_paise],
            ["Refunded", `${stats.refunded_orders} orders`, null],
          ].map(([label, sub, amt]) => (
            <div key={label as string} className="card p-4">
              <dt className="text-xs font-semibold text-ink-500 sm:text-sm">{label}</dt>
              <dd className="mt-1 text-lg font-extrabold text-ink-900 sm:text-2xl">{amt === null ? "—" : rupees(amt as number)}</dd>
              <dd className="text-xs text-ink-500 sm:text-sm">{sub}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {issued ? (
        <div className="card mt-4 p-4 text-sm">
          <p className="font-semibold">New download link (shown once, copy now) / नया लिंक:</p>
          <input readOnly value={issued} onFocus={(e) => e.currentTarget.select()} className="mt-2 w-full rounded-lg border border-ink-200 px-3 py-2 font-mono text-xs" />
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => navigator.clipboard?.writeText(issued)} className="btn-outline px-3 py-1.5 text-sm">
              <Copy className="h-4 w-4" aria-hidden="true" /> Copy
            </button>
            <button type="button" onClick={() => setIssued("")} className="btn-outline px-3 py-1.5 text-sm">Done</button>
          </div>
        </div>
      ) : null}

      {token ? (
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            load(token, q);
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email, phone, BCN-… or pay_…"
              className="w-full rounded-lg border border-ink-200 py-2 pl-9 pr-3" />
          </div>
          <button type="submit" disabled={busy} className="btn-primary">Search</button>
        </form>
      ) : null}

      {token ? (
        <ul className="mt-4 space-y-3">
          {rows.length === 0 ? <li className="py-6 text-center text-sm text-ink-500">No orders. / कोई ऑर्डर नहीं।</li> : null}
          {rows.map((r) => (
            <li key={r.order_id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-ink-900">
                    {r.buyer_name} <span className="text-ink-500">· {rupees(r.amount_paise)}</span>
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-ink-700">{r.public_reference} · {r.razorpay_payment_id ?? "—"}</p>
                </div>
                <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-bold uppercase text-ink-700">
                  {r.status}{r.access_active === false ? " · access off" : ""}
                </span>
              </div>
              <div className="mt-2 grid gap-x-6 gap-y-1 text-sm text-ink-700 sm:grid-cols-2">
                <p>📧 {r.buyer_email}</p>
                <p>📱 {r.buyer_phone}</p>
                <p>🕒 {when(r.created_at)}</p>
                {r.purchase_id ? <p>⬇️ Downloads: {r.download_count} / {r.max_downloads}</p> : null}
              </div>
              {r.purchase_id ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" disabled={busy || r.download_count === 0} onClick={() => act(r, "reset_downloads")} className="btn-outline px-3 py-1.5 text-sm disabled:opacity-50">
                    <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset limit
                  </button>
                  {r.access_active ? (
                    <button type="button" disabled={busy} onClick={() => act(r, "disable")} className="inline-flex items-center gap-1.5 rounded-lg border border-danger-700/30 px-3 py-1.5 text-sm font-semibold text-danger-700">
                      <Ban className="h-4 w-4" aria-hidden="true" /> Remove access
                    </button>
                  ) : (
                    <button type="button" disabled={busy} onClick={() => act(r, "enable")} className="btn-outline px-3 py-1.5 text-sm">
                      <Undo2 className="h-4 w-4" aria-hidden="true" /> Restore access
                    </button>
                  )}
                  <button type="button" disabled={busy} onClick={() => act(r, "issue_link")} className="btn-outline px-3 py-1.5 text-sm">
                    <Copy className="h-4 w-4" aria-hidden="true" /> New download link
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
