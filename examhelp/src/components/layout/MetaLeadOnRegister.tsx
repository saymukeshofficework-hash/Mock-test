"use client";

import { useEffect } from "react";

/**
 * Fires the Meta Pixel "Lead" event when a visitor clicks any Register/Login link
 * (href to /login.html) or a `.js-reg` element on this page. Used on ad landing
 * pages so the Meta campaign (optimised for Lead) gets a signal.
 * Does nothing when the pixel is not loaded (e.g. inside the Android app).
 */
export function MetaLeadOnRegister() {
  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      const t = ev.target as Element | null;
      const el = t?.closest?.('a[href*="login.html"], .js-reg');
      const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq;
      if (el && fbq) {
        try {
          fbq("track", "Lead");
        } catch {
          /* ignore */
        }
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
