"use client";

import { useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { dict, tr } from "@/i18n/dictionary";
import { buyNotes } from "@/lib/checkout";
import type { Lang } from "@/types";

/**
 * Starts the existing Supabase Edge Function + Razorpay checkout flow.
 * The server owns the product price and verifies the payment before issuing a
 * private, time-limited download token. The button is disabled until the PDF
 * and live payment configuration are ready.
 */
export function PurchaseButton({ productId, available, lang }: { productId: string; available: boolean; lang: Lang }) {
  const [state, setState] = useState<"idle" | "loading" | "unavailable" | "error">("idle");
  const n = dict.notes;

  if (!available) {
    return (
      <button type="button" disabled className="btn-outline w-full">
        {tr(n.comingSoon, lang)}
      </button>
    );
  }

  const buy = async () => {
    if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "1") return setState("unavailable");
    setState("loading");
    await buyNotes(productId, {
      onState: (next) => {
        setState(next === "idle" ? "idle" : "loading");
      },
      onError: (message) => {
        setState(
          ["payments_not_configured", "unknown_product", "product_file_missing", "http_503"].some((code) => message.includes(code))
            ? "unavailable"
            : "error",
        );
      },
    });
  };

  return (
    <div>
      <button type="button" onClick={buy} disabled={state === "loading"} className="btn-primary w-full">
        {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ShoppingCart className="h-4 w-4" aria-hidden="true" />}
        {tr(n.buyNow, lang)}
      </button>
      <p role="status" className="mt-2 min-h-5 text-sm text-ink-500">
        {state === "unavailable" && tr(n.purchaseSoon, lang)}
        {state === "error" && (lang === "hi" ? "भुगतान सत्यापित नहीं हो पाया। कृपया दोबारा प्रयास करें।" : "Payment could not be verified. Please try again.")}
      </p>
    </div>
  );
}
