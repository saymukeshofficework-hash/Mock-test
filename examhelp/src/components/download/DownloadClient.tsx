"use client";

import { useEffect, useState } from "react";
import { MOCK_SERIES } from "@/data/mockTests";
import { CheckCircle2, Download, KeyRound, Loader2 } from "lucide-react";
import { checkout, downloadPath } from "@/lib/checkout";
import { site } from "@/lib/site";

/** Private download page for paid notes: /download/?t=<token>. Bilingual (Hindi first). */
type Info = { title: string; downloads: number; max: number; payment_id?: string; kind?: string; product?: string };

function Support({ pid }: { pid?: string }) {
  const msg = encodeURIComponent(`नमस्ते TETTESTHUB, डाउनलोड/टेस्ट में समस्या है।${pid ? " Payment ID: " + pid : ""}`);
  return (
    <p className="mt-5 border-t border-ink-100 pt-4 text-center text-sm text-ink-600">
      समस्या है? / Need help?{" "}
      <a href={`${site.contact.whatsapp}?text=${msg}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-success-700 underline">
        WhatsApp पर संपर्क करें / Chat on WhatsApp
      </a>
    </p>
  );
}

export function DownloadClient() {
  const [token, setToken] = useState<string | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "notfound" | "busy" | "limit" | "error" | "tests">("loading");
  const [pid, setPid] = useState("");
  const [contact, setContact] = useState("");
  const [recoverMsg, setRecoverMsg] = useState("");

  useEffect(() => {
    const tk = new URLSearchParams(window.location.search).get("t");
    setToken(tk);
    if (!tk) {
      setState("notfound");
      return;
    }
    checkout<Info>({ action: "download", token: tk, peek: true }).then((r) => {
      if (r.error) setState("notfound");
      else if (r.kind === "ca") {
        // current affairs pass: remember it on this device and open the reader
        try {
          localStorage.setItem("testhub_dl_ca-30", tk);
        } catch {
          /* ignore */
        }
        window.location.replace(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/current-affairs/`);
      } else if (r.kind === "tests") {
        try {
          localStorage.setItem(`testhub_dl_${r.product}`, tk);
        } catch {
          /* ignore */
        }
        setInfo(r);
        setState("tests");
      } else {
        if (r.kind === "combo") {
          try {
            localStorage.setItem("testhub_dl_ag3-tests", tk);
          } catch {
            /* ignore */
          }
        }
        setInfo(r);
        setState(r.downloads >= r.max ? "limit" : "ready");
      }
    }).catch(() => setState("error"));
  }, []);

  const download = async () => {
    if (!token) return;
    setState("busy");
    const r = await checkout<{ url: string; downloads: number; max: number }>({ action: "download", token });
    if (r.url) {
      setInfo((i) => (i ? { ...i, downloads: r.downloads } : i));
      setState(r.downloads >= r.max ? "limit" : "ready");
      window.location.href = r.url;
    } else setState(r.error === "limit" ? "limit" : "error");
  };

  const recover = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverMsg("");
    const r = await checkout<{ token: string }>({ action: "recover", payment_id: pid.trim(), contact: contact.trim() });
    if (r.token) window.location.href = downloadPath(r.token);
    else setRecoverMsg("यह भुगतान नहीं मिला — Payment ID और ईमेल/मोबाइल जाँचें। / Payment not found — check the Payment ID and email/mobile.");
  };

  if (state === "loading") {
    return (
      <div className="card flex items-center justify-center gap-2 p-8 text-ink-500">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> लोड हो रहा है… / Loading…
      </div>
    );
  }

  if (state === "notfound" || !info) {
    return (
      <div className="card p-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-brand-900">
          <KeyRound className="h-5 w-5" aria-hidden="true" /> डाउनलोड वापस पाएँ / Recover your download
        </h1>
        <p className="mt-2 text-sm text-ink-600">
          भुगतान के समय मिली Razorpay Payment ID (pay_…) और वही ईमेल या मोबाइल नंबर डालें।
          <br />
          Enter the Razorpay Payment ID (pay_…) and the email or mobile number you used to pay.
        </p>
        <form onSubmit={recover} className="mt-5 space-y-3">
          <label className="block text-sm font-semibold text-ink-700">
            Payment ID
            <input required value={pid} onChange={(e) => setPid(e.target.value)} placeholder="pay_XXXXXXXXXXXXXX" className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 font-mono text-sm" />
          </label>
          <label className="block text-sm font-semibold text-ink-700">
            ईमेल या मोबाइल / Email or mobile
            <input required value={contact} onChange={(e) => setContact(e.target.value)} className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
          </label>
          <button type="submit" className="btn-primary w-full">खोजें / Find my PDF</button>
          {recoverMsg ? <p role="alert" className="text-sm text-danger-700">{recoverMsg}</p> : null}
        </form>
        <Support />
      </div>
    );
  }

  if (state === "tests") {
    return (
      <div className="card p-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success-700" aria-hidden="true" />
        <h1 className="mt-3 text-2xl font-bold text-brand-900">टेस्ट सीरीज़ अनलॉक! / Test series unlocked!</h1>
        <p className="mt-2 text-ink-700">{info.title}</p>
        <a href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${(Object.values(MOCK_SERIES).find((m) => m.product === info.product)?.listPath ?? "/mp-high-court-assistant-grade-3-mock-tests")}/`} className="btn-primary mt-6 w-full text-base">
          टेस्ट शुरू करें / Go to tests
        </a>
        <p className="mt-4 text-xs text-ink-500">
          यह डिवाइस अब अनलॉक है। दूसरे डिवाइस पर इसी पेज का लिंक खोलें।
          <br />
          This device is now unlocked. Open this page&apos;s link on another device to unlock it too.
        </p>
        <Support pid={info.payment_id} />
      </div>
    );
  }

  const left = Math.max(0, info.max - info.downloads);
  return (
    <div className="card p-6 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-success-700" aria-hidden="true" />
      <h1 className="mt-3 text-2xl font-bold text-brand-900">भुगतान सफल! / Payment successful!</h1>
      <p className="mt-2 text-ink-700">{info.title}</p>
      {state === "limit" ? (
        <p className="mt-5 rounded-lg bg-accent-100 p-3 text-sm text-accent-700">
          डाउनलोड सीमा पूरी हो गई। सहायता के लिए हमसे संपर्क करें (Payment ID: {info.payment_id}).
          <br />
          Download limit reached. Please contact us with your Payment ID.
        </p>
      ) : (
        <button type="button" onClick={download} disabled={state === "busy"} className="btn-primary mt-6 w-full text-base">
          {state === "busy" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Download className="h-5 w-5" aria-hidden="true" />}
          PDF डाउनलोड करें / Download PDF
        </button>
      )}
      {state === "error" ? <p role="alert" className="mt-3 text-sm text-danger-700">कुछ गड़बड़ हुई, दोबारा प्रयास करें। / Something went wrong, please try again.</p> : null}
      <p className="mt-4 text-xs text-ink-500">
        इस पेज को बुकमार्क कर लें — आप {left} बार और डाउनलोड कर सकते हैं।
        <br />
        Bookmark this page — you can download {left} more time{left === 1 ? "" : "s"}.
        {info.payment_id ? <><br />Payment ID: <span className="font-mono">{info.payment_id}</span></> : null}
      </p>
      {info.kind === "combo" ? (
        <a href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/mp-high-court-assistant-grade-3-mock-tests/`} className="btn-outline mt-5 w-full">
          20 मॉक टेस्ट (अनलॉक) / Go to your 20 mock tests
        </a>
      ) : null}
      <Support pid={info.payment_id} />
    </div>
  );
}
