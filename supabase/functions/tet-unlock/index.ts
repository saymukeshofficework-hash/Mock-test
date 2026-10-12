// TETTESTHUB — auto-unlock TET subject series after a Razorpay payment (tet/index.html).
// Payment runs on the exam-hub project's notes-checkout function (TETTESTHUB Razorpay keys).
// This function asks it which TET series the logged-in student has paid for, then adds those
// tests to the student's profiles.purchased_tests. Safe to call any number of times.
// Deploy with verify_jwt false; the page sends the student's access token as Bearer.
// No secrets needed: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY come from the platform.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
// exam-hub notes-checkout: public URL and anon key (same values as dashboard.html)
const CHECKOUT_URL = "https://znulepzdihzhjmuvyroi.supabase.co/functions/v1/notes-checkout";
const CHECKOUT_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudWxlcHpkaWh6aGptdXZ5cm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMjE5MjIsImV4cCI6MjEwNjY5NzkyMn0.XoqC6vNDJkEAxgtXLVPCpTxocv3lAa-ZBeg69OdbhdU";
const TESTS_PER_SERIES = 25;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });

// Paid tests of one series: 02..25 (test 1 is free). Primary Hindi is the original
// full-paper series with ids test01..test25.
function seriesTests(series: string): string[] {
  const ids: string[] = [];
  for (let n = 2; n <= TESTS_PER_SERIES; n++) {
    const nn = String(n).padStart(2, "0");
    ids.push(series === "tetp-hindi" ? `test${nn}` : `${series}-${nn}`);
  }
  return ids;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  const { data: auth } = await db.auth.getUser(token);
  const user = auth?.user;
  if (!user) return json({ error: "login_required" }, 401);

  let series: string[] = [];
  try {
    const r = await fetch(CHECKOUT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: CHECKOUT_ANON, Authorization: `Bearer ${CHECKOUT_ANON}` },
      body: JSON.stringify({ action: "tet_paid", access_token: token }),
    });
    if (!r.ok) return json({ error: "checkout_unavailable" }, 502);
    const out = await r.json();
    series = (Array.isArray(out?.series) ? out.series : []).filter((s: unknown) => typeof s === "string" && /^tet[ps]-[a-z]+$/.test(s));
  } catch {
    return json({ error: "checkout_unavailable" }, 502);
  }
  if (!series.length) return json({ series: [], added: 0 });

  const { data: prof, error } = await db.from("profiles").select("purchased_tests").eq("id", user.id).maybeSingle();
  if (error || !prof) return json({ error: "no_profile" }, 404);
  const have = new Set<string>(prof.purchased_tests ?? []);
  const add = series.flatMap(seriesTests).filter((id) => !have.has(id));
  if (add.length) {
    const { error: upErr } = await db.from("profiles").update({ purchased_tests: [...have, ...add] }).eq("id", user.id);
    if (upErr) return json({ error: "db" }, 500);
  }
  return json({ series, added: add.length });
});
