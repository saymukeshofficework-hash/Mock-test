"use client";

import { useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { dict, tr } from "@/i18n/dictionary";
import type { Lang } from "@/types";

/**
 * Starts checkout by asking the server to create an order. The server
 * validates the product and price; the client never decides the amount.
 * Until payments are configured the server answers 503 and we say so.
 */
export function PurchaseButton({ productSlug, available, lang }: { productSlug: string; available: boolean; lang: Lang }) {
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
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug }),
      });
      if (res.status === 503) return setState("unavailable");
      if (!res.ok) return setState("error");
      // Phase 6: open Razorpay Checkout with the returned order id here.
      setState("unavailable");
    } catch {
      setState("error");
    }
  };

  return (
    <div>
      <button type="button" onClick={buy} disabled={state === "loading"} className="btn-primary w-full">
        {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ShoppingCart className="h-4 w-4" aria-hidden="true" />}
        {tr(n.buyNow, lang)}
      </button>
      <p role="status" className="mt-2 min-h-5 text-sm text-ink-500">
        {state === "unavailable" && tr(n.purchaseSoon, lang)}
        {state === "error" && (lang === "hi" ? "कुछ गलत हुआ, कृपया पुनः प्रयास करें।" : "Something went wrong, please try again.")}
      </p>
    </div>
  );
}
