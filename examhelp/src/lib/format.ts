import type { Lang } from "@/types";

export function formatINR(amount: number, lang: Lang): string {
  return new Intl.NumberFormat(lang === "hi" ? "hi-IN" : "en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const langLabel = (l: Lang) => (l === "hi" ? "हिंदी" : "English");

/** Splits a line that mentions a price (₹) into a normal version and an app-safe one (Google Play: no prices in the Android app). */
export function priceSafe(text: string): { full: string; app: string } {
  const app = text.split(" · ").filter((p) => !p.includes("₹")).join(" · ");
  return { full: text, app };
}
