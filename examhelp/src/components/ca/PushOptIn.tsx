"use client";

// Daily current affairs alerts (Web Push). Works on the website and in the Android app (TWA notification delegation).
import { useEffect, useState } from "react";
import { Bell, BellOff, Send } from "lucide-react";

const VAPID_PUBLIC = "BDRIthDF0G3luX_-8wjFpsuUW9u0pj0JE5eVbAR3lT8RACdQwRm42TRHMHBcJl9oRxN-K6G2YtcatqWrAr6-SBw";
const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://znulepzdihzhjmuvyroi.supabase.co";
const ANON =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudWxlcHpkaWh6aGptdXZ5cm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMjE5MjIsImV4cCI6MjEwNjY5NzkyMn0.XoqC6vNDJkEAxgtXLVPCpTxocv3lAa-ZBeg69OdbhdU";

function keyBytes(b64: string) {
  const s = atob((b64 + "=".repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

async function callPush(body: Record<string, unknown>) {
  const r = await fetch(`${BASE}/functions/v1/ca-push`, {
    method: "POST",
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(String(r.status));
}

async function getReg() {
  return (await navigator.serviceWorker.getRegistration("/examhelp/")) ?? (await navigator.serviceWorker.register("/examhelp/sw.js", { scope: "/examhelp/" }));
}

export function PushOptIn({ lang }: { lang: "hi" | "en" }) {
  const [state, setState] = useState<"unsupported" | "off" | "on" | "blocked" | "busy">("busy");
  const [msg, setMsg] = useState("");
  const hi = lang === "hi";

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return setState("unsupported");
      if (Notification.permission === "denied") return setState("blocked");
      try {
        const sub = await (await getReg()).pushManager.getSubscription();
        setState(sub ? "on" : "off");
      } catch {
        setState("off");
      }
    })();
  }, []);

  async function turnOn() {
    setState("busy");
    setMsg("");
    try {
      if ((await Notification.requestPermission()) !== "granted") return setState("blocked");
      const reg = await getReg();
      await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID_PUBLIC) }));
      await callPush({ action: "subscribe", subscription: sub.toJSON(), lang });
      setState("on");
      setMsg(hi ? "चालू हो गया! हर सुबह नए करेंट अफेयर्स की सूचना मिलेगी।" : "Done! You will get an alert every morning.");
    } catch {
      setState("off");
      setMsg(hi ? "चालू नहीं हो पाया, फिर कोशिश करें।" : "Could not turn on. Please try again.");
    }
  }

  async function turnOff() {
    setState("busy");
    try {
      const sub = await (await getReg()).pushManager.getSubscription();
      if (sub) {
        await callPush({ action: "unsubscribe", endpoint: sub.endpoint }).catch(() => {});
        await sub.unsubscribe();
      }
      setMsg(hi ? "सूचना बंद कर दी गई।" : "Alerts turned off.");
    } finally {
      setState("off");
    }
  }

  async function sendTest() {
    setMsg("");
    try {
      const sub = await (await getReg()).pushManager.getSubscription();
      if (!sub) return setState("off");
      await callPush({ action: "test", endpoint: sub.endpoint });
      setMsg(hi ? "टेस्ट सूचना भेजी गई, कुछ सेकंड में आएगी।" : "Test alert sent. It should arrive in a few seconds.");
    } catch {
      setMsg(hi ? "टेस्ट सूचना नहीं भेज पाए।" : "Could not send the test alert.");
    }
  }

  if (state === "unsupported") return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {state === "on" ? (
        <>
          <button type="button" onClick={sendTest} className="btn-outline">
            <Send className="h-4 w-4" aria-hidden="true" />
            {hi ? "टेस्ट सूचना भेजें" : "Send test alert"}
          </button>
          <button type="button" onClick={turnOff} className="btn-outline">
            <BellOff className="h-4 w-4" aria-hidden="true" />
            {hi ? "सूचना बंद करें" : "Turn off alerts"}
          </button>
        </>
      ) : state === "blocked" ? (
        <span className="text-xs text-ink-500">{hi ? "सूचना ब्लॉक है। ब्राउज़र/ऐप सेटिंग में Notifications चालू करें।" : "Notifications are blocked. Allow them in browser/app settings."}</span>
      ) : (
        <button type="button" onClick={turnOn} disabled={state === "busy"} className="btn-outline disabled:opacity-60">
          <Bell className="h-4 w-4" aria-hidden="true" />
          {hi ? "रोज़ की सूचना पाएँ" : "Get daily alerts"}
        </button>
      )}
      {msg ? <span className="w-full text-xs text-ink-600">{msg}</span> : null}
    </div>
  );
}
