"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Lang } from "@/types";

const COOKIE = "testhub_lang";

/** हिंदी | English toggle. Stores choice in a cookie and re-renders on the server. */
export function LanguageSwitcher({ lang, className = "" }: { lang: Lang; className?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const set = (l: Lang) => {
    if (l === lang) return;
    document.cookie = `${COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = l;
    start(() => router.refresh());
  };

  // The static demo (GitHub Pages) has no server to switch languages on.
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "1") return null;

  const base = "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors";
  return (
    <div
      role="group"
      aria-label="Language / भाषा"
      className={`inline-flex items-center rounded-lg border border-ink-200 bg-surface p-0.5 ${pending ? "opacity-60" : ""} ${className}`}
    >
      <button
        type="button"
        onClick={() => set("hi")}
        aria-pressed={lang === "hi"}
        lang="hi"
        className={`${base} ${lang === "hi" ? "bg-brand-700 text-white" : "text-ink-700 hover:bg-ink-100"}`}
      >
        हिंदी
      </button>
      <button
        type="button"
        onClick={() => set("en")}
        aria-pressed={lang === "en"}
        lang="en"
        className={`${base} ${lang === "en" ? "bg-brand-700 text-white" : "text-ink-700 hover:bg-ink-100"}`}
      >
        English
      </button>
    </div>
  );
}
