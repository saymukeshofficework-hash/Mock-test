import "server-only";

/**
 * Payment architecture (Razorpay: UPI, cards, net banking).
 *
 * Nothing here processes payments yet. The shape is ready so Phase 6 only has
 * to implement createGatewayOrder() and signature verification.
 * Credentials come exclusively from server-side environment variables and are
 * never exposed to the browser (no NEXT_PUBLIC_ prefix for the secret).
 */

export type PaymentStatus = "CREATED" | "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";

export interface OrderDraft {
  productSlug: string;
  /** Amount in paise, always computed on the server from the product record. */
  amountPaise: number;
  currency: "INR";
  couponCode?: string;
}

export function paymentsConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export class PaymentsNotConfiguredError extends Error {
  constructor() {
    super("Payments are not configured");
  }
}

/** Phase 6: call Razorpay Orders API with Basic auth (key id + secret). */
export async function createGatewayOrder(draft: OrderDraft): Promise<{ gatewayOrderId: string }> {
  if (!paymentsConfigured()) throw new PaymentsNotConfiguredError();
  void draft;
  throw new Error("Razorpay integration not implemented yet (Phase 6)");
}
