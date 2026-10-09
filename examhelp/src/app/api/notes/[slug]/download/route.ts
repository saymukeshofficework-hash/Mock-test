import { NextResponse } from "next/server";

/**
 * Protected PDF download. PDFs will live in private storage (never /public),
 * and this route will stream them only to signed-in users with a PAID order
 * for the product — using short-lived signed URLs (Phase 6).
 * Until authentication exists, every request is refused.
 */
export async function GET() {
  return NextResponse.json({ error: "Sign-in and purchase required" }, { status: 401 });
}
