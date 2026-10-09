import "server-only";
import { cookies } from "next/headers";
import type { Lang } from "@/types";

export const LANG_COOKIE = "testhub_lang";

/** True for the static GitHub Pages demo build (no server, no cookies). */
export const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

/** Hindi is the default; English only when the visitor switched. */
export async function getLang(): Promise<Lang> {
  if (isStaticExport) return "hi";
  const c = (await cookies()).get(LANG_COOKIE)?.value;
  return c === "en" ? "en" : "hi";
}
