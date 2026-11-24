"use client";

// Registered users (main Supabase project, where students sign up). Same admin sign-in as the
// Bridge Course section: the list comes from the SECURITY DEFINER function admin_list_users(),
// which re-checks is_bridge_admin() in the database, so only admins get any rows.
// Paid vs non-paid (owner, 2026-11-24): real paid orders (₹0 excluded) come from the exam-hub
// notes-checkout function (action admin_paid_users, which also checks the admin token) and are
// matched to users by user id, email or phone inside admin_list_users().
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LogOut, RefreshCw, Search, Users } from "lucide-react";

const SB_URL = "https://ovaubhekxjtkodkhsybg.supabase.co";
const SB_KEY = "sb_publishable_LXYxPPuR4tX7vGyWg7NIyA_-F_ieSGW"; // public key, safe in the browser
const TOKEN_KEY = "bc_admin_token"; // shared with BridgeAdmin: one sign-in for both
const PAGE = 50;
const EH_URL = "https://znulepzdihzhjmuvyroi.supabase.co";
const EH_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudWxlcHpkaWh6aGptdXZ5cm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMjE5MjIsImV4cCI6MjEwNjY5NzkyMn0.XoqC6vNDJkEAxgtXLVPCpTxocv3lAa-ZBeg69OdbhdU"; // public key

type Row = {
  user_id: string;
  full_name: string | null;
  contact: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  total_users: number;
  matched_users: number;
  is_paid: boolean;
  paid_users: number;
};
type Order = { buyer_user_id: string | null; email: string | null; phone: string | null; product: string; amount: number; paid_at: string | null; title: string };
type Paid = { ids: string[]; contacts: string[]; orders: Order[] };

const digits10 = (s: string | null) => {
  const d = (s ?? "").replace(/\D/g, "").slice(-10);
  return d.length === 10 ? d : "";
};
// orders that belong to this user (same rules as admin_list_users)
const ordersOf = (u: Row, paid: Paid) => {
  const em = [u.email, u.contact].filter((x): x is string => !!x && x.includes("@")).map((x) => x.toLowerCase());
  const ph = [digits10(u.phone), u.contact && !u.contact.includes("@") ? digits10(u.contact) : ""].filter(Boolean);
  return paid.orders.filter((o) => o.buyer_user_id === u.user_id || (o.email && !o.email.endsWith("@razorpay.com") && em.includes(o.email.toLowerCase())) || (digits10(o.phone) && ph.includes(digits10(o.phone))));
};
const rupees = (paise: number) => "₹" + (paise / 100).toLocaleString("en-IN");

const when = (s: string | null) =>
  s ? new Date(s).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "—";

export function UsersAdmin({ standalone = false }: { standalone?: boolean }) {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [paid, setPaid] = useState<Paid | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [paidCount, setPaidCount] = useState(0);
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const signOut = useCallback(() => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    setToken("");
    setPaid(null);
    setTotal(null);
  }, []);

  // paid orders (exam-hub) → ids and contacts sent to admin_list_users
  const loadPaid = useCallback(async (t: string) => {
    setBusy(true);
    try {
      const r = await fetch(`${EH_URL}/functions/v1/notes-checkout`, {
        method: "POST",
        headers: { apikey: EH_ANON, Authorization: `Bearer ${EH_ANON}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "admin_paid_users", access_token: t }),
      });
      setBusy(false);
      if (r.status === 401) {
        signOut();
        setMsg("Session expired. Sign in again. / दोबारा लॉगिन करें।");
        return;
      }
      if (!r.ok) {
        setMsg("Could not load. This email may not be an admin. / यह ईमेल एडमिन नहीं है।");
        return;
      }
      const orders = ((await r.json()).orders ?? []) as Order[];
      const ids = [...new Set(orders.map((o) => o.buyer_user_id).filter((x): x is string => !!x))];
      const contacts = [...new Set(orders.flatMap((o) => [o.email?.toLowerCase() ?? "", digits10(o.phone)]).filter((x) => x && !x.endsWith("@razorpay.com")))];
      setMsg("");
      setPaid({ ids, contacts, orders });
    } catch {
      setBusy(false);
      setMsg("Could not connect. Try again. / कनेक्ट नहीं हुआ।");
    }
  }, [signOut]);

  useEffect(() => {
    try {
      const t = sessionStorage.getItem(TOKEN_KEY);
      if (t) {
        setToken(t);
        loadPaid(t);
      }
    } catch {
      /* ignore */
    }
  }, [loadPaid]);

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
      loadPaid(d.access_token);
    } catch {
      setBusy(false);
      setMsg("Could not connect. Try again. / कनेक्ट नहीं हुआ।");
    }
  };

  const onCounts = useCallback((t: number, p: number) => {
    setTotal(t);
    setPaidCount(p);
  }, []);
  const onError = useCallback((m: string, expired: boolean) => {
    if (expired) signOut();
    setMsg(m);
  }, [signOut]);

  return (
    <section id="users" className={standalone ? "pt-2" : "mt-10 border-t border-ink-200 pt-8"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-brand-900">
          <Users className="h-5 w-5 text-accent-600" aria-hidden="true" />
          Registered users / रजिस्टर्ड यूज़र
        </h2>
        {token ? (
          <button type="button" onClick={signOut} className="btn-outline px-3 py-1.5 text-sm">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
          </button>
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
          <p className="text-sm text-ink-700">Sign in with your admin email (same as Bridge Course). / एडमिन ईमेल से लॉगिन करें।</p>
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

      {token && total !== null ? (
        <dl className="mt-4 grid grid-cols-3 gap-3 sm:max-w-xl">
          <div className="card p-4">
            <dt className="text-xs font-semibold text-ink-500 sm:text-sm">Total users / कुल यूज़र</dt>
            <dd className="mt-1 text-2xl font-extrabold text-ink-900">{total.toLocaleString("en-IN")}</dd>
          </div>
          <div className="card p-4">
            <dt className="text-xs font-semibold text-ink-500 sm:text-sm">Paid / पेमेंट किया</dt>
            <dd className="mt-1 text-2xl font-extrabold text-success-700">{paidCount.toLocaleString("en-IN")}</dd>
          </div>
          <div className="card p-4">
            <dt className="text-xs font-semibold text-ink-500 sm:text-sm">Non-paid / सिर्फ़ रजिस्टर</dt>
            <dd className="mt-1 text-2xl font-extrabold text-ink-900">{(total - paidCount).toLocaleString("en-IN")}</dd>
          </div>
        </dl>
      ) : null}

      {token && paid ? (
        <>
          <form
            className="mt-4 flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setTerm(q.trim());
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email or phone / नाम, ईमेल या फ़ोन"
                className="w-full rounded-lg border border-ink-200 py-2 pl-9 pr-3" aria-label="Search users" />
            </div>
            <button type="submit" className="btn-primary" disabled={busy}>
              <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} aria-hidden="true" />
              Search / खोजें
            </button>
          </form>

          <UserTable token={token} paid={paid} term={term} isPaid onCounts={onCounts} onError={onError}
            title="Paid users / पेमेंट करने वाले यूज़र" />
          <UserTable token={token} paid={paid} term={term} isPaid={false} onCounts={onCounts} onError={onError}
            title="Non-paid users (only registered) / बिना पेमेंट वाले (सिर्फ़ रजिस्टर)" />
        </>
      ) : null}
    </section>
  );
}

function UserTable({ token, paid, term, isPaid, title, onCounts, onError }: {
  token: string;
  paid: Paid;
  term: string;
  isPaid: boolean;
  title: string;
  onCounts: (total: number, paid: number) => void;
  onError: (msg: string, expired: boolean) => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [matched, setMatched] = useState(0);
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (p: number) => {
    setBusy(true);
    try {
      const r = await fetch(`${SB_URL}/rest/v1/rpc/admin_list_users`, {
        method: "POST",
        headers: { apikey: SB_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ p_search: term || null, p_limit: PAGE, p_offset: p * PAGE, p_paid: isPaid, p_paid_ids: paid.ids, p_paid_contacts: paid.contacts }),
      });
      setBusy(false);
      if (r.status === 401) return onError("Session expired. Sign in again. / दोबारा लॉगिन करें।", true);
      if (!r.ok) return onError("Could not load. This email may not be an admin. / यह ईमेल एडमिन नहीं है।", false);
      const data = (await r.json()) as Row[];
      setRows(data);
      setPage(p);
      setMatched(data[0]?.matched_users ?? 0);
      if (data[0]) onCounts(data[0].total_users, data[0].paid_users);
    } catch {
      setBusy(false);
      onError("Could not connect. Try again. / कनेक्ट नहीं हुआ।", false);
    }
  }, [token, term, isPaid, paid, onCounts, onError]);

  useEffect(() => {
    load(0);
  }, [load]);

  const pages = Math.max(1, Math.ceil(matched / PAGE));
  const cols = isPaid ? 6 : 5;

  return (
    <div className={`mt-6 overflow-hidden rounded-2xl border-2 bg-white ${isPaid ? "border-success-700" : "border-ink-300"}`}>
      <h3 className={`flex items-center justify-between gap-3 px-4 py-3 text-lg font-extrabold ${isPaid ? "bg-success-700 text-white" : "bg-ink-100 text-ink-900"}`}>
        <span>{title}</span>
        <span className="text-2xl">{matched.toLocaleString("en-IN")}</span>
      </h3>
      <div className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-ink-50 text-xs uppercase text-ink-500">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Name / नाम</th>
              <th className="px-3 py-2">Email / Phone</th>
              {isPaid ? <th className="px-3 py-2">Bought / खरीदा</th> : null}
              <th className="px-3 py-2">Registered / रजिस्टर</th>
              <th className="px-3 py-2">Last login</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !busy ? (
              <tr>
                <td colSpan={cols} className="px-3 py-5 text-center text-ink-500">No users found. / कोई यूज़र नहीं मिला।</td>
              </tr>
            ) : null}
            {rows.map((u, i) => {
              const bought = isPaid ? ordersOf(u, paid) : [];
              return (
                <tr key={u.user_id} className="border-t border-ink-100 align-top">
                  <td className="px-3 py-2 text-ink-500">{page * PAGE + i + 1}</td>
                  <td className="px-3 py-2 font-semibold text-ink-900">{u.full_name || "—"}</td>
                  <td className="px-3 py-2 text-ink-700">
                    {u.contact || "—"}
                    {u.email && u.email !== u.contact && u.contact ? <span className="block text-xs text-ink-500">{u.email}</span> : null}
                  </td>
                  {isPaid ? (
                    <td className="min-w-[240px] px-3 py-2 text-ink-700">
                      {bought.map((o, k) => (
                        <span key={k} className="block text-xs">
                          {o.title} — <b>{rupees(o.amount)}</b> <span className="text-ink-500">({when(o.paid_at)})</span>
                        </span>
                      ))}
                      {bought.length > 1 ? (
                        <span className="mt-1 block text-xs font-bold">Total / कुल: {rupees(bought.reduce((a, o) => a + o.amount, 0))}</span>
                      ) : null}
                    </td>
                  ) : null}
                  <td className="px-3 py-2 text-ink-700">{when(u.created_at)}</td>
                  <td className="px-3 py-2 text-ink-700">{when(u.last_sign_in_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-ink-100 p-3 text-sm">
        <button type="button" className="btn-outline px-3 py-1.5" disabled={busy || page === 0} onClick={() => load(page - 1)}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Prev
        </button>
        <span className="text-ink-600">Page {page + 1} / {pages}</span>
        <button type="button" className="btn-outline px-3 py-1.5" disabled={busy || page + 1 >= pages} onClick={() => load(page + 1)}>
          Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
