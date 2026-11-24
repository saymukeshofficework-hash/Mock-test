/**
 * Client helpers for paid PDF notes (Razorpay checkout + secure download).
 * Server side lives in supabase/functions/notes-checkout (Supabase project "exam-hub").
 * The anon key is public by design; all checks happen in the edge function.
 */
export const CHECKOUT_URL =
  process.env.NEXT_PUBLIC_CHECKOUT_URL ?? "https://znulepzdihzhjmuvyroi.supabase.co/functions/v1/notes-checkout";
const ANON =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudWxlcHpkaWh6aGptdXZ5cm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMjE5MjIsImV4cCI6MjEwNjY5NzkyMn0.XoqC6vNDJkEAxgtXLVPCpTxocv3lAa-ZBeg69OdbhdU";

export async function checkout<T = Record<string, unknown>>(payload: Record<string, unknown>): Promise<T & { error?: string }> {
  const r = await fetch(CHECKOUT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
    body: JSON.stringify(payload),
  });
  try {
    return (await r.json()) as T & { error?: string };
  } catch {
    return { error: `http_${r.status}` } as T & { error?: string };
  }
}

export const ADMIN_USER_KEY = "testhub_admin_user";
function adminUser() {
  try {
    return sessionStorage.getItem(ADMIN_USER_KEY) ?? "";
  } catch {
    return "";
  }
}

/** Private admin API (supabase/functions/testhub-admin). Username + password are checked on the server. */
export async function adminCall<T = Record<string, unknown>>(payload: Record<string, unknown>): Promise<T & { error?: string }> {
  try {
    const r = await fetch(CHECKOUT_URL.replace("notes-checkout", "testhub-admin"), {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
      body: JSON.stringify({ username: adminUser(), ...payload }),
    });
    try {
      return (await r.json()) as T & { error?: string };
    } catch {
      return { error: `http_${r.status}` } as T & { error?: string };
    }
  } catch {
    return { error: "network" } as T & { error?: string };
  }
}

type RazorpayHandlerArgs = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on: (ev: string, cb: (e: unknown) => void) => void };
declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => RazorpayInstance;
  }
}

function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("razorpay_script"));
    document.body.appendChild(s);
  });
}

// Main-site login (tettesthub.in). URL and anon key are public (same as js/site-config.js).
const MAIN_URL = "https://ovaubhekxjtkodkhsybg.supabase.co";
const MAIN_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92YXViaGVreGp0a29ka2hzeWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTk4NDMsImV4cCI6MjEwMzQzNTg0M30.KKDmp6mt2YEIKxI0BP5I7BvAgMAStNXJiwgUy3X4b2s";
const SESSION_KEY = "sb-ovaubhekxjtkodkhsybg-auth-token";

/**
 * Access token of the student logged in on the main site, refreshed if it has expired
 * (the saved session is updated so the main site keeps working). Undefined when logged out.
 */
export async function mainSiteAccessToken(): Promise<string | undefined> {
  try {
    const sess = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!sess?.access_token) return undefined;
    if (!sess.expires_at || sess.expires_at * 1000 > Date.now() + 60_000) return sess.access_token;
    if (!sess.refresh_token) return undefined;
    const r = await fetch(`${MAIN_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: MAIN_ANON },
      body: JSON.stringify({ refresh_token: sess.refresh_token }),
    });
    if (!r.ok) return undefined;
    const fresh = await r.json();
    if (!fresh?.access_token) return undefined;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...sess, ...fresh, expires_at: fresh.expires_at ?? Math.floor(Date.now() / 1000) + (fresh.expires_in ?? 3600) }));
    return fresh.access_token;
  } catch {
    return undefined;
  }
}

/**
 * Paid-series tokens (testhub_dl_*) are saved per browser. They belong to the account that was
 * logged in when they were saved, so when a different account logs in on the same browser they
 * are dropped (the server "claim" gives the new account its own purchases back). Same rule in
 * public/mock-tests/free-pass.js.
 */
export function forgetOtherAccountTokens() {
  try {
    const sess = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    const uid: string = sess?.user?.id || "anon";
    const owner = localStorage.getItem("testhub_tokens_owner");
    // logged out: keep the tokens and who they belong to, so the next login is still checked
    if (owner === uid || (uid === "anon" && owner)) return;
    // owner unknown (saved before this rule): keep them, so old buyers never lose access
    if (uid !== "anon" && owner && owner !== "anon") {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.startsWith("testhub_dl_") || k.startsWith("testhub_pending_"))) localStorage.removeItem(k);
      }
    }
    localStorage.setItem("testhub_tokens_owner", uid);
  } catch {
    /* private mode */
  }
}

/**
 * After the login page sends the student back with ?buy=<product>, runs `start(product)` once
 * (opens Razorpay) if they are now logged in, and removes the parameter from the address bar.
 */
export function resumeBuyAfterLogin(products: string[], start: (product: string) => void) {
  try {
    const u = new URL(location.href);
    const product = u.searchParams.get("buy");
    if (!product || !products.includes(product)) return;
    u.searchParams.delete("buy");
    history.replaceState(null, "", u.pathname + u.search + u.hash);
    if (localStorage.getItem(SESSION_KEY)) start(product);
  } catch {
    /* ignore */
  }
}

/** Products whose tests open on the main site (profiles.purchased_tests via tet-unlock). */
// Every test series (and the AG-3 combos, which include the tests) needs a login first, so the
// purchase is linked to the student's account and opens on any device (owner, 2026-11-24).
const needsLogin = (product: string) => product.startsWith("tet-") || product.endsWith("-tests") || product.startsWith("ag3-combo");

/** Asks the main site to add every paid TET / RRB series to the logged-in student's tests. */
export async function mainSiteUnlock(): Promise<boolean> {
  const access_token = await mainSiteAccessToken();
  if (!access_token) return false;
  try {
    const r = await fetch(`${MAIN_URL}/functions/v1/tet-unlock`, {
      method: "POST",
      headers: { apikey: MAIN_ANON, Authorization: `Bearer ${access_token}` },
    });
    return r.ok;
  } catch {
    return false;
  }
}

const pendingKey = (product: string) => `testhub_pending_${product}`;
function pendingOrders(product: string): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(pendingKey(product)) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/**
 * Auto-unlock: finds a paid order for `product` that this browser started, or that belongs to the
 * logged-in student, saves its token and returns it. Covers payments where the page reloaded
 * (UPI app switch) before the Razorpay success handler ran, and purchases made on another device.
 */
export async function claimPurchase(product: string): Promise<string | null> {
  const order_ids = pendingOrders(product);
  const access_token = await mainSiteAccessToken();
  if (!order_ids.length && !access_token) return null;
  try {
    const r = await checkout<{ token?: string }>({ action: "claim", product, order_ids, access_token });
    if (!r.token) return null;
    try {
      localStorage.setItem(`testhub_dl_${product}`, r.token);
      localStorage.removeItem(pendingKey(product));
    } catch {
      /* private mode */
    }
    return r.token;
  } catch {
    return null;
  }
}

export const downloadPath = (token: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/download/?t=${encodeURIComponent(token)}`;

/**
 * Opens Razorpay checkout for `product`. On success the payment is verified on the
 * server and the buyer is sent to their private download page.
 */
export async function buyNotes(
  product: string,
  opts: { onState?: (s: "creating" | "open" | "verifying" | "idle") => void; onError?: (msg: string) => void; onPaid?: (token: string) => void },
) {
  const { onState = () => {}, onError = () => {}, onPaid } = opts;
  try {
    onState("creating");
    // purchases belong to the student's login, so they open on any device: log in first
    const access_token = await mainSiteAccessToken();
    // Test series need a login (see needsLogin); PDF notes still work without one.
    if (!access_token && needsLogin(product)) {
      // come back with ?buy=<product> so the payment opens right after login / sign-up
      const q = new URLSearchParams(location.search);
      q.set("buy", product);
      window.location.href = `/login.html?next=${encodeURIComponent(`${location.pathname}?${q.toString()}`)}`;
      return;
    }
    await loadRazorpay();
    const order = await checkout<{ order_id: string; key_id: string; amount: number; currency: string; name: string; description: string }>({
      action: "create",
      product,
      access_token,
    });
    if (order.error || !order.order_id) {
      onState("idle");
      onError(order.error ?? "order");
      return;
    }
    // remember the order so it can still unlock if the page reloads during payment
    try {
      localStorage.setItem(pendingKey(product), JSON.stringify([order.order_id, ...pendingOrders(product)].slice(0, 5)));
    } catch {
      /* private mode */
    }
    // fill the logged-in student's email and name in Razorpay (phone is still typed there)
    const prefill: Record<string, string> = {};
    try {
      const u = JSON.parse(localStorage.getItem(SESSION_KEY) || "null")?.user;
      if (typeof u?.email === "string" && u.email.includes("@")) prefill.email = u.email;
      const nm = u?.user_metadata?.full_name;
      if (typeof nm === "string" && nm.trim()) prefill.name = nm.trim().slice(0, 60);
    } catch {
      /* private mode */
    }
    const rzp = new window.Razorpay!({
      key: order.key_id,
      prefill,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      name: order.name,
      description: order.description,
      theme: { color: "#1e3a8a" },
      modal: { ondismiss: () => onState("idle") },
      handler: async (res: RazorpayHandlerArgs) => {
        onState("verifying");
        try {
          const v = await checkout<{ token: string }>({
            action: "verify",
            order_id: res.razorpay_order_id,
            payment_id: res.razorpay_payment_id,
            signature: res.razorpay_signature,
          });
          if (v.token) {
            try {
              localStorage.setItem(`testhub_dl_${product}`, v.token);
              localStorage.removeItem(pendingKey(product));
            } catch {
              /* private mode */
            }
            if (onPaid) {
              onState("idle");
              onPaid(v.token);
            } else window.location.href = downloadPath(v.token);
          } else {
            onState("idle");
            onError(v.error ? `verify:${v.error}` : `verify:${res.razorpay_payment_id}`);
          }
        } catch {
          onState("idle");
          onError("verify_network");
        }
      },
    });
    rzp.on("payment.failed", () => onError("failed"));
    onState("open");
    rzp.open();
  } catch {
    onState("idle");
    onError("network");
  }
}
