// TETTESTHUB — admin upload for TET Primary/Secondary subject tests (tet/admin.html).
// Secret (Supabase → Edge Functions → Secrets): ADMIN_PASSWORD  (at least 10 characters)
// Deploy with verify_jwt false (the page calls it with the anon key).
// Actions (POST JSON, every call carries {password}):
//   upload_test {row}   → upserts one row into test_content (test_id like "tets-maths-01")
//   list_tests {prefix} → test_ids already stored that start with prefix
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
const ID = /^tet[ps]-[a-z]+-\d{2}$/;

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
    case "upload_test": {
      const r = body.row ?? {};
      const secs = r.questions;
      // deno-lint-ignore no-explicit-any
      const okSecs = Array.isArray(secs) && secs.length > 0 && secs.every((s: any) =>
        typeof s?.name === "string" && Array.isArray(s.questions) && s.questions.every((q: any) =>
          [0, 1, 2, 3].includes(q?.answer) && (q.hi?.options?.length === 4 || q.en?.options?.length === 4)));
      const count = okSecs ? secs.reduce((n: number, s: { questions: unknown[] }) => n + s.questions.length, 0) : 0;
      if (!ID.test(String(r.test_id ?? "")) || !okSecs || count < 1) return json({ error: "bad_test_file" }, 400);
      const { error } = await db.from("test_content").upsert({
        test_id: r.test_id, title: String(r.title ?? r.test_id), question_count: count,
        duration_minutes: parseInt(String(r.duration_minutes ?? 150), 10) || 150, questions: secs, is_free: !!r.is_free,
      });
      if (error) return json({ error: "db", detail: error.message }, 500);
      return json({ ok: true, test_id: r.test_id, questions: count });
    }
    case "list_tests": {
      const prefix = String(body.prefix ?? "");
      if (!/^tet[ps]-[a-z]+$/.test(prefix)) return json({ error: "bad_request" }, 400);
      const { data } = await db.from("test_content").select("test_id").like("test_id", `${prefix}-%`).order("test_id");
      return json({ tests: (data ?? []).map((x) => x.test_id) });
    }
  }
  return json({ error: "unknown_action" }, 400);
});
