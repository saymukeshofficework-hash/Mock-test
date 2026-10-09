// Razorpay webhook (event: payment.captured / order.paid). Marks the order paid even if the buyer
// closed the page before the browser could verify, so "recover my download" works.
// Secret: RAZORPAY_WEBHOOK_SECRET (same value you type when creating the webhook in Razorpay).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

async function hmacHex(secret: string, msg: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function newToken() {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

Deno.serve(async (req) => {
  const secret = (Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "").trim();
  // setup check (reveals nothing secret): GET → {"configured": true|false}
  if (req.method === "GET") return new Response(JSON.stringify({ configured: !!secret }), { headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" } });
  if (!secret || req.method !== "POST") return new Response("not configured", { status: 503 });
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") ?? "";
  if ((await hmacHex(secret, raw)) !== sig) return new Response("bad signature", { status: 400 });
  const ev = JSON.parse(raw);
  const pay = ev?.payload?.payment?.entity;
  if (!pay || !["payment.captured", "order.paid"].includes(ev.event)) return new Response("ignored");
  const { data: ord } = await db.from("orders").select("*").eq("rzp_order_id", pay.order_id).maybeSingle();
  if (!ord) return new Response("unknown order");
  if (ord.status !== "paid") {
    await db.from("orders").update({
      status: "paid", rzp_payment_id: pay.id, paid_at: new Date().toISOString(),
      email: pay.email ?? null, phone: pay.contact ?? null, download_token: ord.download_token ?? newToken(),
    }).eq("id", ord.id);
  }
  return new Response("ok");
});
