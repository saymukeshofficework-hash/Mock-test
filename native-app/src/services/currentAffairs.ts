import type { Bi } from "@/lib/i18n";
import type { BiList } from "@/engine/types";
import { db } from "./db";
import { hubCall } from "./hub";

export type CaItem = { id: string; cat: string; title: Bi; points: BiList };
export type CaQuiz = { q: Bi; o: BiList; a: number; exp?: Bi };
export type CaDay = { day: string; title?: Bi; items: CaItem[]; oneliners?: BiList; quiz?: CaQuiz[] };

/** Current affairs published on the website (exam-hub ca_days), read-only. */
export async function caIndex(): Promise<{ day: string; items: number }[]> {
  const r = await hubCall<{ days?: { day: string; items: number }[] }>({ action: "ca_index" });
  if (!r.ok || !r.data) throw new Error("ca_index_failed");
  return r.data.days ?? [];
}

export async function caDay(day?: string): Promise<CaDay | null> {
  const r = await hubCall<{ day?: string; data?: CaDay }>({ action: "ca_day", ...(day ? { day } : {}) });
  if (r.status === 404) return null;
  if (!r.ok || !r.data?.data) throw new Error("ca_day_failed");
  return { ...r.data.data, day: r.data.day ?? r.data.data.day, items: r.data.data.items ?? [] };
}

/** Filter chips asked for in the app spec, mapped from the website's free-form categories. */
export type CaFilter = "all" | "mp" | "national" | "international" | "sports" | "schemes" | "scitech";
export const CA_FILTERS: CaFilter[] = ["all", "mp", "national", "international", "sports", "schemes", "scitech"];
export function caFilterOf(item: CaItem): CaFilter[] {
  const c = item.cat.toLowerCase();
  const text = `${item.title.en ?? ""} ${item.title.hi ?? ""}`.toLowerCase();
  const out: CaFilter[] = [];
  if (c.includes("mp") || c.includes("madhya") || /madhya pradesh|मध्य प्रदेश|\bmp\b/.test(text)) out.push("mp");
  if (/sport|खेल/.test(c)) out.push("sports");
  if (/scheme|योजना/.test(c)) out.push("schemes");
  if (/science|tech|space|विज्ञान|अंतरिक्ष/.test(c)) out.push("scitech");
  if (/international|world|relation|summit|defence|अंतरराष्ट्रीय/.test(c)) out.push("international");
  if (!out.length || /national|polity|economy|bank|award|appoint|day|environment|राष्ट्रीय/.test(c)) out.push("national");
  return out;
}

export async function saveQuizScore(userId: string, day: string, score: number, total: number) {
  const d = await db();
  await d.runAsync("INSERT OR REPLACE INTO ca_quiz (user_id, day, score, total, at) VALUES (?, ?, ?, ?, ?)", userId, day, score, total, Date.now());
}
export async function quizScores(userId: string): Promise<{ day: string; score: number; total: number }[]> {
  const d = await db();
  return d.getAllAsync("SELECT day, score, total FROM ca_quiz WHERE user_id = ? ORDER BY day DESC", userId);
}
export async function toggleCaBookmark(userId: string, day: string, item: CaItem): Promise<boolean> {
  const d = await db();
  const has = await d.getFirstAsync("SELECT 1 FROM ca_bookmarks WHERE user_id = ? AND day = ? AND item_id = ?", userId, day, item.id);
  if (has) {
    await d.runAsync("DELETE FROM ca_bookmarks WHERE user_id = ? AND day = ? AND item_id = ?", userId, day, item.id);
    return false;
  }
  await d.runAsync("INSERT INTO ca_bookmarks (user_id, day, item_id, payload, created_at) VALUES (?, ?, ?, ?, ?)", userId, day, item.id, JSON.stringify(item), Date.now());
  return true;
}
export async function caBookmarks(userId: string): Promise<{ day: string; item: CaItem }[]> {
  const d = await db();
  const rows = await d.getAllAsync<{ day: string; payload: string }>("SELECT day, payload FROM ca_bookmarks WHERE user_id = ? ORDER BY created_at DESC", userId);
  return rows.map((r) => ({ day: r.day, item: JSON.parse(r.payload) as CaItem }));
}
