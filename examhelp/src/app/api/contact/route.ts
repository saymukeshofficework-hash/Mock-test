import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { validateContact } from "@/lib/validation";

/**
 * POST /api/contact
 * Validates and forwards the message to CONTACT_WEBHOOK_URL (e.g. a Slack,
 * Discord, Zapier or email-service webhook). Nothing is stored locally.
 */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  // Honeypot field: bots fill it, humans never see it.
  if (typeof raw.website === "string" && raw.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const { data, errors } = validateContact(raw);
  if (Object.keys(errors).length) return NextResponse.json({ error: "validation", errors }, { status: 422 });

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (!webhook) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, receivedAt: new Date().toISOString(), source: "exam-hub-contact" }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(String(res.status));
  } catch {
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
