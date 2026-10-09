"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import type { Lang } from "@/types";

/** Shows a small banner while the device is offline. */
export function OfflineBanner({ lang }: { lang: Lang }) {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  if (!offline) return null;
  return (
    <div role="status" className="fixed inset-x-3 bottom-20 z-[70] mx-auto flex max-w-md items-center gap-3 rounded-xl bg-ink-900 px-4 py-3 text-sm text-white shadow-2xl xl:bottom-6">
      <WifiOff className="h-5 w-5 shrink-0" aria-hidden="true" />
      {lang === "hi" ? "आप ऑफ़लाइन हैं। कनेक्शन लौटने पर पेज अपडेट होगा।" : "You're offline. The page will update when you reconnect."}
    </div>
  );
}
