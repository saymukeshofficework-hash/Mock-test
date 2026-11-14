"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, X } from "lucide-react";

const VAPID_PUBLIC = "BDRIthDF0G3luX_-8wjFpsuUW9u0pj0JE5eVbAR3lT8RACdQwRm42TRHMHBcJl9oRxN-K6G2YtcatqWrAr6-SBw";
const PUSH_URL = "https://znulepzdihzhjmuvyroi.supabase.co/functions/v1/ca-push";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudWxlcHpkaWh6aGptdXZ5cm9pIiwiaWF0IjoxNzkxMTIxOTIyLCJleHAiOjIxMDY2OTc5MjN9.XoqC6vNDJkEAxgtXLVPCpTxocv3lAa-ZBeg69OdbhdU";

function applicationKey() {
  const raw = VAPID_PUBLIC.replace(/-/g, "+").replace(/_/g, "/");
  const padded = raw + "=".repeat((4 - (raw.length % 4)) % 4);
  const binary = window.atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function PushAlerts() {
  const [lang, setLang] = useState<"hi" | "en">("hi");
  const [state, setState] = useState<"checking" | "off" | "on" | "unsupported" | "denied" | "busy" | "error">("checking");
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("testhub_lang_pref");
      if (saved === "en") setLang("en");
    } catch { /* ignore */ }
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    navigator.serviceWorker.register("/examhelp/sw.js", { scope: "/examhelp/" })
      .then(async (registration) => {
        const subscription = await registration.pushManager.getSubscription();
        setState(subscription ? "on" : "off");
      })
      .catch(() => setState("error"));
  }, []);

  const copy = (hi: string, en: string) => lang === "hi" ? hi : en;

  async function enable() {
    setState("busy");
    setMessage("");
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setState("unsupported");
        setMessage(copy("इस ब्राउज़र में Push Notification उपलब्ध नहीं है।", "Push notifications are not supported in this browser."));
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        setMessage(copy("नोटिफिकेशन की अनुमति नहीं मिली। ब्राउज़र सेटिंग में इसे Allow करें।", "Permission was not granted. Allow notifications in browser settings."));
        return;
      }
      const registration = await navigator.serviceWorker.register("/examhelp/sw.js", { scope: "/examhelp/" });
      await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription() || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationKey(),
      });
      const response = await fetch(PUSH_URL, {
        method: "POST",
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "subscribe", subscription: subscription.toJSON(), lang }),
      });
      if (!response.ok) throw new Error("subscribe_failed");
      setState("on");
      setMessage(copy("नोटिफिकेशन चालू हो गया है।", "Notifications are enabled."));
    } catch {
      setState("error");
      setMessage(copy("अभी नोटिफिकेशन चालू नहीं हो पाया। कृपया बाद में कोशिश करें।", "Could not enable notifications. Please try again later."));
    }
  }

  async function disable() {
    setState("busy");
    try {
      const registration = await navigator.serviceWorker.getRegistration("/examhelp/");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await fetch(PUSH_URL, {
          method: "POST",
          headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "unsubscribe", endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setState("off");
      setMessage(copy("नोटिफिकेशन बंद कर दिया गया है।", "Notifications have been turned off."));
    } catch {
      setState("error");
      setMessage(copy("नोटिफिकेशन बंद नहीं हो पाया।", "Could not turn notifications off."));
    }
  }

  if (state === "checking" || state === "unsupported") return null;
  const active = state === "on";
  const label = state === "denied"
    ? copy("ब्राउज़र सेटिंग में अनुमति दें", "Allow in browser settings")
    : active ? copy("सूचनाएँ चालू हैं", "Alerts on") : copy("सूचनाएँ चालू करें", "Enable alerts");

  return (
    <div className="fixed bottom-24 right-3 z-[60] max-w-[min(21rem,calc(100vw-1.5rem))] sm:bottom-6 sm:right-5">
      {show && (
        <div className="mb-2 rounded-xl border border-ink-200 bg-surface p-3 text-sm text-ink-700 shadow-xl">
          <div className="flex items-start justify-between gap-2">
            <p>{copy("डेली करेंट अफेयर्स और नए टेस्ट पेपर की सूचना पाने के लिए नोटिफिकेशन चालू करें।", "Enable alerts for daily current affairs and newly added test papers.")}</p>
            <button type="button" onClick={() => setShow(false)} aria-label="Close" className="shrink-0 rounded p-1 hover:bg-ink-100"><X className="h-4 w-4" /></button>
          </div>
          {message && <p role="status" className="mt-2 text-xs font-medium">{message}</p>}
          {active ? (
            <button type="button" onClick={disable} disabled={state === "busy"} className="mt-3 rounded-lg border border-ink-300 px-3 py-2 text-xs font-semibold disabled:opacity-50">{copy("नोटिफिकेशन बंद करें", "Turn off alerts")}</button>
          ) : (
            <button type="button" onClick={enable} disabled={state === "busy" || state === "denied"} className="mt-3 rounded-lg bg-brand-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{state === "busy" ? copy("कृपया प्रतीक्षा करें…", "Please wait…") : label}</button>
          )}
        </div>
      )}
      <button type="button" onClick={() => setShow((v) => !v)} aria-expanded={show} className="ml-auto flex items-center gap-2 rounded-full border border-brand-200 bg-surface px-3 py-2 text-xs font-bold text-brand-800 shadow-lg hover:bg-brand-50">
        {active ? <BellRing className="h-4 w-4" aria-hidden="true" /> : <Bell className="h-4 w-4" aria-hidden="true" />}
        {label}
      </button>
    </div>
  );
}
