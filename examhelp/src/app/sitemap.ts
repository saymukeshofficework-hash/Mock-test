export const dynamic = "force-static";

import type { MetadataRoute } from "next";
import { getExams, getNotes } from "@/lib/repo";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [exams, notes] = await Promise.all([getExams(), getNotes()]);
  const staticPaths: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1, freq: "daily" },
    { path: "/exams", priority: 0.9, freq: "daily" },
    { path: "/exam-calendar", priority: 0.9, freq: "daily" },
    { path: "/notifications", priority: 0.8, freq: "daily" },
    { path: "/notes", priority: 0.8, freq: "weekly" },
    { path: "/mp-high-court-assistant-grade-3-notes", priority: 0.9, freq: "weekly" },
    { path: "/test-series", priority: 0.6, freq: "weekly" },
    { path: "/mp-high-court-assistant-grade-3-test-series", priority: 0.8, freq: "weekly" },
    { path: "/practice", priority: 0.6, freq: "weekly" },
    { path: "/current-affairs", priority: 0.6, freq: "daily" },
    { path: "/previous-papers", priority: 0.6, freq: "weekly" },
    { path: "/results", priority: 0.7, freq: "daily" },
    { path: "/admit-card", priority: 0.7, freq: "daily" },
    { path: "/faq", priority: 0.4, freq: "monthly" },
    { path: "/about", priority: 0.3, freq: "yearly" },
    { path: "/contact", priority: 0.3, freq: "yearly" },
    { path: "/disclaimer", priority: 0.2, freq: "yearly" },
    { path: "/privacy-policy", priority: 0.2, freq: "yearly" },
    { path: "/terms", priority: 0.2, freq: "yearly" },
    { path: "/refund-policy", priority: 0.2, freq: "yearly" },
  ];
  return [
    ...staticPaths.map((p) => ({ url: `${site.url}${p.path}`, changeFrequency: p.freq, priority: p.priority })),
    ...exams.map((e) => ({ url: `${site.url}/exams/${e.slug}`, lastModified: new Date(e.updatedAt), changeFrequency: "daily" as const, priority: 0.8 })),
    ...notes.map((n) => ({ url: `${site.url}/notes/${n.slug}`, lastModified: new Date(n.updatedAt), changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
