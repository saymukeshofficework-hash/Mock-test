import { NextResponse } from "next/server";
import { getNoteBySlug } from "@/lib/repo";
import { createGatewayOrder, paymentsConfigured } from "@/lib/payments";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/orders { productSlug }
 * Validates the product server-side and (from Phase 6) creates a gateway order.
 * Never trusts a price from the client.
 */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (!rateLimit(`orders:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const slug = typeof body === "object" && body && "productSlug" in body ? (body as { productSlug: unknown }).productSlug : undefined;
  if (typeof slug !== "string" || !/^[a-z0-9-]{1,120}$/.test(slug)) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  const note = await getNoteBySlug(slug);
  if (!note) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (note.status !== "AVAILABLE") return NextResponse.json({ error: "Product not available yet" }, { status: 409 });

  if (!paymentsConfigured()) {
    return NextResponse.json({ error: "Payments are launching soon" }, { status: 503 });
  }

  // Authentication is required to buy (Phase 6). Until then, refuse.
  return NextResponse.json({ error: "Sign-in required" }, { status: 401 });

  // Phase 6:
  // const user = await requireUser(req);
  // const { gatewayOrderId } = await createGatewayOrder({ productSlug: slug, amountPaise: note.price.amount * 100, currency: "INR" });
  // persist Order(userId, productId, amount, status: "CREATED", gatewayOrderId) and return it.
}

// Referenced so the Phase 6 hook-up point stays type-checked.
void createGatewayOrder;
