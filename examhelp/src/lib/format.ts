import type { Lang } from "@/types";

export function formatINR(amount: number, lang: Lang): string {
  return new Intl.NumberFormat(lang === "hi" ? "hi-IN" : "en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const langLabel = (l: Lang) => (l === "hi" ? "हिंदी" : "English");
