"use client";

import { useCallback, useEffect, useState } from "react";
import { Ban, Copy, LogOut, MessageCircle, RefreshCw, RotateCcw, Search, ShieldCheck, Undo2 } from "lucide-react";
import { adminCall, downloadPath } from "@/lib/checkout";
import { UploadTests } from "@/components/admin/UploadTests";

type Order = {
  id: string;
  product: string;
  amount: number;
  status: string;
  rzp_order_id: string | null;
  rzp_payment_id: string | null;
  email: string | null;
  phone: string | null;
  downloads: number;
  download_token: string | null;
  created_at: string;
  paid_at: string | null;
};
type Stats = { todayCount: number; todayAmount: number; weekCount: number; weekAmount: number; allCount: number; allAmount: number };

const PRODUCT: Record<string, string> = {
  "ag3-hi": "Notes — Hindi PDF",
  "ag3-en": "Notes — English PDF",
  "ag3-tests": "High Court AG-3 — 25 tests",
  "ag3-combo-hi": "Combo — Hindi notes + tests",
  "ag3-combo-en": "Combo — English notes + tests",
  "pcgd-tests": "Police Constable GD — 25 tests",
  "asi-tests": "Police Subedar/ASI — 25 tests",
  "ca-30": "Current affairs — 30-day pass",
};
const hasPdf = (p: string) => !p.endsWith("-tests") && p !== "ca-30";
const MAX_DL = 10;
const PW_KEY = "testhub_admin_pw";
const rupees = (paise: number) => "₹" + (paise / 100).toLocaleString("en-IN");
const when = (s: string | null) =>
  s ? new Date(s).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "—";

export function AdminClient() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("sold");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);

  const login = useCallback(async (password: string) => {
    setBusy(true);
    setMsg("");
    const r = await adminCall<{ ok: boolean; stats: Stats }>({ action: "login", password });
    setBusy(false);
    if (r.ok) {
      setAuthed(true);
      setStats(r.stats);
      try {
        sessionStorage.setItem(PW_KEY, password);
      } catch {
        /* ignore */
      }
    } else {
      setMsg(r.error === "wrong_password" ? "Wrong password." : r.error === "admin_not_configured" ? "ADMIN_PASSWORD is not set in Supabase secrets yet (min 10 characters)." : "Could not connect. Try again.");
      try {
        sessionStorage.removeItem(PW_KEY);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const load = useCallback(async () => {
    setBusy(true);
    const r = await adminCall<{ orders: Order[] }>({ action: "list", password: pw, q, status });
    setBusy(false);
    if (r.orders) setOrders(r.orders);
    else setMsg("Could not load orders.");
  }, [pw, q, status]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(PW_KEY);
      if (saved) {
        setPw(saved);
        login(saved);
      }
    } catch {
      /* ignore */
    }
  }, [login]);

  useEffect(() => {
    if (authed) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, status]);

  const act = async (o: Order, op: "reset" | "cancel" | "restore") => {
    setConfirm(null);
    setBusy(true);
    const r = await adminCall<{ order: Order }>({ action: "update", password: pw, id: o.id, op });
    setBusy(false);
    if (r.order) {
      setOrders((list) => list.map((x) => (x.id === o.id ? r.order : x)));
      setMsg(op === "reset" ? "Download limit reset." : op === "cancel" ? "Access cancelled." : "Access restored.");
      const s = await adminCall<{ ok: boolean; stats: Stats }>({ action: "login", password: pw });
      if (s.stats) setStats(s.stats);
    } else setMsg("Action failed (" + (r.error ?? "error") + ").");
  };

  const accessLink = (o: Order) => (o.download_token ? location.origin + downloadPath(o.download_token) : "");
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMsg("Link copied.");
    } catch {
      setMsg(text);
    }
  };
  const logout = () => {
    try {
      sessionStorage.removeItem(PW_KEY);
    } catch {
      /* ignore */
    }
    setAuthed(false);
    setPw("");
    setOrders([]);
    setStats(null);
  };

  if (!authed) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
        <form
          className="card w-full max-w-sm p-6"
          onSubmit={(e) => {
            e.preventDefault();
            login(pw);
          }}
        >
          <h1 className="flex items-center gap-2 text-xl font-extrabold text-brand-900">
            <ShieldCheck className="h-5 w-5 text-accent-600" aria-hidden="true" />
            TETTESTHUB Admin
          </h1>
          <label className="mt-5 block text-sm font-semibold text-ink-700" htmlFor="adm-pw">
            Password
          </label>
          <input id="adm-pw" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2" />
          <button type="submit" disabled={busy || !pw} className="btn-primary mt-4 w-full disabled:opacity-60">
            {busy ? "Checking…" : "Log in"}
          </button>
          {msg ? <p role="alert" className="mt-3 text-sm text-danger-700">{msg}</p> : null}
        </form>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-brand-900">
          <ShieldCheck className="h-6 w-6 text-accent-600" aria-hidden="true" />
          TETTESTHUB Admin
        </h1>
        <button type="button" onClick={logout} className="btn-outline">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Log out
        </button>
      </div>

      {stats ? (
        <dl className="mt-6 grid grid-cols-3 gap-3">
          {[
            ["Today", stats.todayCount, stats.todayAmount],
            ["Last 7 days", stats.weekCount, stats.weekAmount],
            ["All time", stats.allCount, stats.allAmount],
          ].map(([label, n, amt]) => (
            <div key={label as string} className="card p-4">
              <dt className="text-xs font-semibold text-ink-500 sm:text-sm">{label}</dt>
              <dd className="mt-1 text-lg font-extrabold text-ink-900 sm:text-2xl">{rupees(amt as number)}</dd>
              <dd className="text-xs text-ink-500 sm:text-sm">{n as number} sales</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <form
        className="mt-6 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Payment ID (pay_…), email or phone"
            className="w-full rounded-lg border border-ink-200 py-2 pl-9 pr-3" aria-label="Search orders" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-ink-200 px-3 py-2" aria-label="Status filter">
          <option value="sold">Paid + cancelled</option>
          <option value="paid">Paid only</option>
          <option value="cancelled">Cancelled only</option>
          <option value="all">All (incl. unpaid attempts)</option>
        </select>
        <button type="submit" className="btn-primary" disabled={busy}>
          <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} aria-hidden="true" />
          Search
        </button>
      </form>
      {msg ? <p role="status" className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-900">{msg}</p> : null}

      <ul className="mt-5 space-y-3">
        {orders.length === 0 && !busy ? <li className="card p-5 text-center text-ink-500">No orders found.</li> : null}
        {orders.map((o) => {
          const link = accessLink(o);
          const wa = o.phone ? `https://wa.me/${o.phone.replace(/\D/g, "").replace(/^(\d{10})$/, "91$1")}?text=${encodeURIComponent("TETTESTHUB — your access link: " + link)}` : "";
          const chip =
            o.status === "paid" ? "bg-success-50 text-success-700" : o.status === "cancelled" ? "bg-danger-50 text-danger-700" : "bg-ink-100 text-ink-700";
          return (
            <li key={o.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-ink-900">
                    {PRODUCT[o.product] ?? o.product} <span className="text-ink-500">· {rupees(o.amount)}</span>
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-ink-700">{o.rzp_payment_id ?? o.rzp_order_id}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${chip}`}>{o.status === "created" ? "unpaid" : o.status}</span>
              </div>
              <div className="mt-2 grid gap-x-6 gap-y-1 text-sm text-ink-700 sm:grid-cols-2">
                <p>📧 {o.email ?? "—"}</p>
                <p>📱 {o.phone ?? "—"}</p>
                <p>🕒 {when(o.paid_at ?? o.created_at)}</p>
                {hasPdf(o.product) && o.download_token ? <p>⬇️ Downloads: {o.downloads} / {MAX_DL}</p> : null}
              </div>
              {o.download_token ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {hasPdf(o.product) && o.status === "paid" ? (
                    <button type="button" disabled={busy || o.downloads === 0} onClick={() => act(o, "reset")} className="btn-outline px-3 py-1.5 text-sm disabled:opacity-50">
                      <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset limit
                    </button>
                  ) : null}
                  {o.status === "paid" ? (
                    confirm === o.id ? (
                      <>
                        <button type="button" disabled={busy} onClick={() => act(o, "cancel")} className="inline-flex items-center gap-1.5 rounded-lg bg-danger-700 px-3 py-1.5 text-sm font-semibold text-white">
                          <Ban className="h-4 w-4" aria-hidden="true" /> Yes, cancel access
                        </button>
                        <button type="button" onClick={() => setConfirm(null)} className="btn-outline px-3 py-1.5 text-sm">Keep</button>
                      </>
                    ) : (
                      <button type="button" disabled={busy} onClick={() => setConfirm(o.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-danger-700/30 px-3 py-1.5 text-sm font-semibold text-danger-700">
                        <Ban className="h-4 w-4" aria-hidden="true" /> Cancel access
                      </button>
                    )
                  ) : null}
                  {o.status === "cancelled" ? (
                    <button type="button" disabled={busy} onClick={() => act(o, "restore")} className="btn-outline px-3 py-1.5 text-sm">
                      <Undo2 className="h-4 w-4" aria-hidden="true" /> Restore access
                    </button>
                  ) : null}
                  {o.status === "paid" ? (
                    <>
                      <button type="button" onClick={() => copy(link)} className="btn-outline px-3 py-1.5 text-sm">
                        <Copy className="h-4 w-4" aria-hidden="true" /> Copy access link
                      </button>
                      {wa ? (
                        <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-success-700/30 px-3 py-1.5 text-sm font-semibold text-success-700">
                          <MessageCircle className="h-4 w-4" aria-hidden="true" /> Send on WhatsApp
                        </a>
                      ) : null}
                    </>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      <UploadTests pw={pw} />
      <p className="mt-6 text-xs text-ink-500">Showing the latest 100 matching orders. Refunds themselves are done in the Razorpay dashboard; cancel access here after refunding.</p>
    </div>
  );
}
