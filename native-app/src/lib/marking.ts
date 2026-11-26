import type { Scoring } from "@/data/catalog";
import type { Lang } from "@/store/settings";

/** Marking scheme line shown before a test, matching the website's instructions. */
export function markingText(s: Scoring, lang: Lang, jsonMarks?: { c: number; w: number }): string {
  const hi = lang === "hi";
  if (s.kind === "rpcNeg3") return hi ? "हर सही उत्तर +1, हर गलत उत्तर −⅓, छोड़े गए प्रश्न 0।" : "+1 for each correct answer, −⅓ for each wrong answer, 0 for skipped.";
  if (s.kind === "rpc") return hi ? "हर प्रश्न 1 अंक। ऋणात्मक अंकन नहीं।" : "1 mark per question. No negative marking.";
  const m = jsonMarks ?? { c: s.c, w: s.w };
  const w = m.w === 0 ? (hi ? "ऋणात्मक अंकन नहीं" : "no negative marking") : `${hi ? "गलत उत्तर" : "wrong answer"} −${m.w === 1 / 3 ? "⅓" : m.w}`;
  return hi ? `सही उत्तर +${m.c}, ${w}, छोड़े गए प्रश्न 0।` : `Correct answer +${m.c}, ${w}, skipped 0.`;
}
