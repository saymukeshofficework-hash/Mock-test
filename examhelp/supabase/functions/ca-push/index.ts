// TETTESTHUB — daily current affairs alerts (Web Push). Deploy with verify_jwt false.
// Actions: subscribe / unsubscribe / test (from the site), daily (from the ca_days trigger, needs x-push-key).
// Secrets live in Supabase Vault (ca_push_vapid_private, ca_push_trigger_key), read via rpc ca_push_secret.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const VAPID_PUBLIC = "BDRIthDF0G3luX_-8wjFpsuUW9u0pj0JE5eVbAR3lT8RACdQwRm42TRHMHBcJl9oRxN-K6G2YtcatqWrAr6-SBw";
const CA_URL = "/examhelp/current-affairs/";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-push-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

let ready = false;
async function secret(name: string) {
  const { data, error } = await db.rpc("ca_push_secret", { secret_name: name });
  if (error || !data) throw new Error("missing secret " + name);
  return data as string;
}
async function setup() {
  if (ready) return;
  webpush.setVapidDetails("https://tettesthub.in", VAPID_PUBLIC, await secret("ca_push_vapid_private"));
  ready = true;
}

type Row = { endpoint: string; p256dh: string; auth: string; lang: string };
async function sendTo(rows: Row[], payload: (r: Row) => object) {
  let sent = 0, failed = 0;
  const gone: string[] = [];
  for (let i = 0; i < rows.length; i += 50) {
    await Promise.all(rows.slice(i, i + 50).map(async (r) => {
      try {
        await webpush.sendNotification({ endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } }, JSON.stringify(payload(r)), { TTL: 86400, urgency: "normal" });
        sent++;
      } catch (e) {
        failed++;
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) gone.push(r.endpoint);
      }
    }));
  }
  if (gone.length) await db.from("push_subscriptions").delete().in("endpoint", gone);
  return { sent, failed };
}

const todayIST = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
const daily = (r: Row, day: string) => {
  const [y, m, d] = day.split("-");
  return r.lang === "en"
    ? { title: `Current Affairs ${d}-${m}-${y} 📰`, body: "Today's current affairs and quiz are live. Tap to read.", url: CA_URL, tag: "ca-" + day }
    : { title: `करेंट अफेयर्स ${d}-${m}-${y} 📰`, body: "आज के करेंट अफेयर्स और क्विज़ आ गए हैं। पढ़ने के लिए टैप करें।", url: CA_URL, tag: "ca-" + day };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  let b: Record<string, any>;
  try { b = await req.json(); } catch { return json({ error: "bad json" }, 400); }

  try {
    if (b.action === "subscribe") {
      const s = b.subscription ?? {};
      if (typeof s.endpoint !== "string" || !s.endpoint.startsWith("https://") || s.endpoint.length > 1000 || !s.keys?.p256dh || !s.keys?.auth) return json({ error: "bad subscription" }, 400);
      const { error } = await db.from("push_subscriptions").upsert({ endpoint: s.endpoint, p256dh: String(s.keys.p256dh).slice(0, 200), auth: String(s.keys.auth).slice(0, 100), lang: b.lang === "en" ? "en" : "hi" });
      if (error) throw error;
      return json({ ok: true });
    }
    if (b.action === "unsubscribe") {
      if (typeof b.endpoint === "string") await db.from("push_subscriptions").delete().eq("endpoint", b.endpoint);
      return json({ ok: true });
    }
    if (b.action === "test") {
      // Sends only to the caller's own subscription.
      const { data } = await db.from("push_subscriptions").select("endpoint,p256dh,auth,lang").eq("endpoint", String(b.endpoint ?? "")).limit(1);
      if (!data?.length) return json({ error: "not subscribed" }, 404);
      await setup();
      const r = await sendTo(data as Row[], (row) => ({ ...daily(row, todayIST()), title: row.lang === "en" ? "Test alert ✅ TETTESTHUB" : "टेस्ट सूचना ✅ TETTESTHUB", tag: "ca-test" }));
      return json({ ok: r.sent === 1 });
    }
    if (b.action === "daily") {
      if (req.headers.get("x-push-key") !== (await secret("ca_push_trigger_key"))) return json({ error: "forbidden" }, 403);
      const day = String(b.day ?? "");
      if (day !== todayIST()) return json({ skipped: "not today" });
      const { data: claimed } = await db.from("ca_push_log").upsert({ day }, { onConflict: "day", ignoreDuplicates: true }).select("day");
      if (!claimed?.length) return json({ skipped: "already sent" });
      const work = (async () => {
        await setup();
        const { data } = await db.from("push_subscriptions").select("endpoint,p256dh,auth,lang");
        const r = await sendTo((data ?? []) as Row[], (row) => daily(row, day));
        await db.from("ca_push_log").update(r).eq("day", day);
      })();
      EdgeRuntime.waitUntil(work);
      return json({ ok: true, queued: true }, 202);
    }
    return json({ error: "unknown action" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: "server error" }, 500);
  }
});
