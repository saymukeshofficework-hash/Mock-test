// TETTESTHUB — private admin API for the /admin page.
// Secret (Supabase → Edge Functions → Secrets): ADMIN_PASSWORD  (at least 10 characters)
// Actions (POST JSON, every call carries {password}):
//   login                       → stats
//   list   {q?, status?}        → recent orders (search by payment id / order id / email / phone)
//   update {id, op}             → op: "reset" (downloads = 0) | "cancel" (status = cancelled) | "restore" (status = paid)
//   upload_test {series, n, data} → saves a mock test paper to the private bucket "tests" at <series>/NN.json
//   list_tests {series}         → test numbers stored for a series
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });

async function sha(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
const SERIES = ["ag3", "pcgd", "asi"];
const COLS = "id,product,amount,status,rzp_order_id,rzp_payment_id,email,phone,downloads,download_token,created_at,paid_at";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  const pw = (Deno.env.get("ADMIN_PASSWORD") ?? "").trim();
  if (pw.length < 10) return json({ error: "admin_not_configured" }, 503);
  // deno-lint-ignore no-explicit-any
  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }
  if (!safeEqual(await sha(String(body.password ?? "")), await sha(pw))) {
    await new Promise((r) => setTimeout(r, 1200)); // slow down guessing
    return json({ error: "wrong_password" }, 401);
  }

  switch (body.action) {
    case "login": {
      const { data } = await db.from("orders").select("amount,paid_at").eq("status", "paid").limit(10000);
      const now = new Date();
      const ist = (d: Date) => new Date(d.getTime() + 5.5 * 3600e3).toISOString().slice(0, 10);
      const today = ist(now);
      const weekAgo = now.getTime() - 7 * 86400e3;
      const s = { todayCount: 0, todayAmount: 0, weekCount: 0, weekAmount: 0, allCount: 0, allAmount: 0 };
      for (const o of data ?? []) {
        const t = o.paid_at ? new Date(o.paid_at) : null;
        s.allCount++; s.allAmount += o.amount;
        if (t && t.getTime() >= weekAgo) { s.weekCount++; s.weekAmount += o.amount; }
        if (t && ist(t) === today) { s.todayCount++; s.todayAmount += o.amount; }
      }
      return json({ ok: true, stats: s });
    }
    case "list": {
      let q = db.from("orders").select(COLS).order("created_at", { ascending: false }).limit(100);
      const st = body.status ?? "paid";
      if (st === "paid") q = q.eq("status", "paid");
      else if (st === "cancelled") q = q.eq("status", "cancelled");
      else if (st === "sold") q = q.in("status", ["paid", "cancelled"]);
      const term = (body.q ?? "").trim().replace(/[,()%*]/g, "");
      if (term) {
        const digits = term.replace(/\D/g, "");
        const ors = [`rzp_payment_id.ilike.%${term}%`, `rzp_order_id.ilike.%${term}%`, `email.ilike.%${term}%`];
        if (digits.length >= 4) ors.push(`phone.ilike.%${digits.slice(-10)}%`);
        q = q.or(ors.join(","));
      }
      const { data, error } = await q;
      if (error) return json({ error: "db" }, 500);
      return json({ orders: data });
    }
    case "update": {
      const id = body.id ?? "";
      const op = body.op ?? "";
      const patch = op === "reset" ? { downloads: 0 } : op === "cancel" ? { status: "cancelled" } : op === "restore" ? { status: "paid" } : null;
      if (!id || !patch) return json({ error: "bad_request" }, 400);
      const { data: ord } = await db.from("orders").select("status,download_token").eq("id", id).maybeSingle();
      if (!ord) return json({ error: "not_found" }, 404);
      if ((op === "cancel" && ord.status !== "paid") || (op === "restore" && (ord.status !== "cancelled" || !ord.download_token))) {
        return json({ error: "not_allowed" }, 409);
      }
      const { data, error } = await db.from("orders").update(patch).eq("id", id).select(COLS).maybeSingle();
      if (error) return json({ error: "db" }, 500);
      return json({ order: data });
    }
    case "upload_test": {
      const series = String(body.series ?? "");
      const n = parseInt(String(body.n ?? ""), 10);
      if (!SERIES.includes(series) || !(n >= 1 && n <= 50)) return json({ error: "bad_request" }, 400);
      const d = typeof body.data === "string" ? JSON.parse(body.data) : body.data;
      const qs = d?.questions;
      const okQ = Array.isArray(qs) && qs.length >= 50 && qs.every((q: any) =>
        q && typeof q.s === "string" && [0, 1, 2, 3].includes(q.a) && q.q?.hi && q.q?.en && q.o?.hi?.length === 4 && q.o?.en?.length === 4);
      if (!Array.isArray(d?.sections) || !okQ) return json({ error: "bad_test_file" }, 400);
      const path = `${series}/${String(n).padStart(2, "0")}.json`;
      const { error } = await db.storage.from("tests").upload(path, new Blob([JSON.stringify(d)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
      if (error) return json({ error: "storage", detail: error.message }, 500);
      return json({ ok: true, path, questions: qs.length });
    }
    case "list_tests": {
      const series = String(body.series ?? "");
      if (!SERIES.includes(series)) return json({ error: "bad_request" }, 400);
      const { data } = await db.storage.from("tests").list(series, { limit: 100 });
      return json({ tests: (data ?? []).filter((f) => f.name.endsWith(".json")).map((f) => parseInt(f.name, 10)).filter((x) => x > 0).sort((a, b) => a - b) });
    }
  }
  return json({ error: "unknown_action" }, 400);
});
