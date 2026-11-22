"use client";

// Registered users (main Supabase project, where students sign up). Same admin sign-in as the
// Bridge Course section: the list comes from the SECURITY DEFINER function admin_list_users(),
// which re-checks is_bridge_admin() in the database, so only admins get any rows.
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LogOut, RefreshCw, Search, Users } from "lucide-react";

const SB_URL = "https://ovaubhekxjtkodkhsybg.supabase.co";
const SB_KEY = "sb_publishable_LXYxPPuR4tX7vGyWg7NIyA_-F_ieSGW"; // public key, safe in the browser
const TOKEN_KEY = "bc_admin_token"; // shared with BridgeAdmin: one sign-in for both
const PAGE = 50;

type Row = {
  user_id: string;
  full_name: string | null;
  contact: string | null;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  total_users: number;
  matched_users: number;
};

const when = (s: string | null) =>
  s ? new Date(s).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "—";

export function UsersAdmin() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [matched, setMatched] = useState(0);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const signOut = () => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    setToken("");
    setRows([]);
    setTotal(null);
  };

  const load = useCallback(async (t: string, term: string, p: number) => {
    setBusy(true);
    try {
      const r = await fetch(`${SB_URL}/rest/v1/rpc/admin_list_users`, {
        method: "POST",
        headers: { apikey: SB_KEY, Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
        body: JSON.stringify({ p_search: term.trim() || null, p_limit: PAGE, p_offset: p * PAGE }),
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
      const data = (await r.json()) as Row[];
      setMsg("");
      setRows(data);
      setPage(p);
      if (data[0]) {
        setTotal(data[0].total_users);
        setMatched(data[0].matched_users);
      } else setMatched(0);
    } catch {
      setBusy(false);
      setMsg("Could not connect. Try again. / कनेक्ट नहीं हुआ।");
    }
  }, []);

  useEffect(() => {
    try {
      const t = sessionStorage.getItem(TOKEN_KEY);
      if (t) {
        setToken(t);
        load(t, "", 0);
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
      load(d.access_token, "", 0);
    } catch {
      setBusy(false);
      setMsg("Could not connect. Try again. / कनेक्ट नहीं हुआ।");
    }
  };

  const pages = Math.max(1, Math.ceil(matched / PAGE));

  return (
    <section id="users" className="mt-10 border-t border-ink-200 pt-8">
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
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:max-w-md">
          <div className="card p-4">
            <dt className="text-xs font-semibold text-ink-500 sm:text-sm">Total users / कुल यूज़र</dt>
            <dd className="mt-1 text-2xl font-extrabold text-ink-900">{total.toLocaleString("en-IN")}</dd>
          </div>
          <div className="card p-4">
            <dt className="text-xs font-semibold text-ink-500 sm:text-sm">Matching / मिले</dt>
            <dd className="mt-1 text-2xl font-extrabold text-ink-900">{matched.toLocaleString("en-IN")}</dd>
          </div>
        </dl>
      ) : null}

      {token ? (
        <>
          <form
            className="mt-4 flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              load(token, q, 0);
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

          <div className="card mt-4 overflow-x-auto p-0">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-ink-50 text-xs uppercase text-ink-500">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Name / नाम</th>
                  <th className="px-3 py-2">Email / Phone</th>
                  <th className="px-3 py-2">Registered / रजिस्टर</th>
                  <th className="px-3 py-2">Last login</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && !busy ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-5 text-center text-ink-500">No users found. / कोई यूज़र नहीं मिला।</td>
                  </tr>
                ) : null}
                {rows.map((u, i) => (
                  <tr key={u.user_id} className="border-t border-ink-100">
                    <td className="px-3 py-2 text-ink-500">{page * PAGE + i + 1}</td>
                    <td className="px-3 py-2 font-semibold text-ink-900">{u.full_name || "—"}</td>
                    <td className="px-3 py-2 text-ink-700">
                      {u.contact || "—"}
                      {u.email && u.email !== u.contact && u.contact ? <span className="block text-xs text-ink-500">{u.email}</span> : null}
                    </td>
                    <td className="px-3 py-2 text-ink-700">{when(u.created_at)}</td>
                    <td className="px-3 py-2 text-ink-700">{when(u.last_sign_in_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 text-sm">
            <button type="button" className="btn-outline px-3 py-1.5" disabled={busy || page === 0} onClick={() => load(token, q, page - 1)}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Prev
            </button>
            <span className="text-ink-600">Page {page + 1} / {pages}</span>
            <button type="button" className="btn-outline px-3 py-1.5" disabled={busy || page + 1 >= pages} onClick={() => load(token, q, page + 1)}>
              Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
