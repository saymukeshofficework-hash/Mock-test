"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { validateContact, type ContactErrors, type ContactInput } from "@/lib/validation";
import type { Lang } from "@/types";

const L = {
  name: { hi: "नाम", en: "Name" },
  email: { hi: "ईमेल", en: "Email" },
  phone: { hi: "फ़ोन (वैकल्पिक)", en: "Phone (optional)" },
  subject: { hi: "विषय", en: "Subject" },
  message: { hi: "संदेश", en: "Message" },
  send: { hi: "संदेश भेजें", en: "Send message" },
  required: { hi: "यह आवश्यक है", en: "This is required" },
  invalid: { hi: "कृपया सही जानकारी दर्ज करें", en: "Please enter a valid value" },
  tooLong: { hi: "बहुत लंबा है", en: "Too long" },
  sent: { hi: "धन्यवाद! आपका संदेश मिल गया है।", en: "Thank you! Your message has been received." },
  notConfigured: { hi: "संपर्क फ़ॉर्म अभी सक्रिय नहीं है। कृपया बाद में प्रयास करें।", en: "The contact form isn't active yet. Please try again later." },
  failed: { hi: "संदेश नहीं भेजा जा सका। कृपया पुनः प्रयास करें।", en: "Your message could not be sent. Please try again." },
  rate: { hi: "बहुत अधिक प्रयास। कुछ देर बाद प्रयास करें।", en: "Too many attempts. Please try again later." },
};

/** Pre-fills the subject from ?subject= (used by "Notify me" buttons). */
function SubjectFromUrl({ onSubject }: { onSubject: (s: string) => void }) {
  const s = useSearchParams().get("subject");
  useEffect(() => {
    if (s) onSubject(s.slice(0, 150));
  }, [s, onSubject]);
  return null;
}

export function ContactForm({ lang }: { lang: Lang }) {
  const [values, setValues] = useState<ContactInput>({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "notConfigured" | "failed" | "rate">("idle");
  const t = (k: keyof typeof L) => L[k][lang];
  const [setSubject] = useState(() => (subject: string) => setValues((v) => (v.subject ? v : { ...v, subject })));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const honeypot = (new FormData(e.currentTarget).get("website") as string) || "";
    const { errors: errs } = validateContact({ ...values });
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      document.getElementById(`cf-${first}`)?.focus();
      return;
    }
    if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "1") return setState("notConfigured");
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website: honeypot }),
      });
      if (res.ok) return setState("sent");
      if (res.status === 503) return setState("notConfigured");
      if (res.status === 429) return setState("rate");
      if (res.status === 422) {
        const j = await res.json();
        setErrors(j.errors ?? {});
        return setState("idle");
      }
      setState("failed");
    } catch {
      setState("failed");
    }
  };

  if (state === "sent") {
    return (
      <div role="status" className="card flex items-center gap-3 p-6 text-success-700">
        <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        <p className="font-semibold">{t("sent")}</p>
      </div>
    );
  }

  const field = (k: keyof ContactInput, type = "text", textarea = false) => {
    const err = errors[k];
    const common = {
      id: `cf-${k}`,
      name: k,
      value: values[k],
      "aria-invalid": err ? true : undefined,
      "aria-describedby": err ? `cf-${k}-err` : undefined,
      onChange: (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [k]: ev.target.value })),
      className: `w-full rounded-xl border bg-surface px-3.5 text-base outline-none focus:border-brand-500 ${err ? "border-danger-700" : "border-ink-200"}`,
    };
    return (
      <div className={textarea ? "sm:col-span-2" : ""}>
        <label htmlFor={`cf-${k}`} className="mb-1.5 block text-sm font-semibold text-ink-900">
          {t(k)}
          {k !== "phone" && <span className="text-danger-700"> *</span>}
        </label>
        {textarea ? (
          <textarea {...common} rows={6} className={`${common.className} py-3`} />
        ) : (
          <input {...common} type={type} autoComplete={k === "name" ? "name" : k === "email" ? "email" : k === "phone" ? "tel" : "off"} className={`${common.className} h-12`} />
        )}
        {err && (
          <p id={`cf-${k}-err`} className="mt-1 text-sm text-danger-700">
            {t(err)}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={onSubmit} noValidate className="card grid gap-5 p-6 sm:grid-cols-2">
      <Suspense fallback={null}>
        <SubjectFromUrl onSubject={setSubject} />
      </Suspense>
      {field("name")}
      {field("email", "email")}
      {field("phone", "tel")}
      {field("subject")}
      {field("message", "text", true)}
      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={state === "sending"} className="btn-primary w-full sm:w-auto">
          {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          {t("send")}
        </button>
        <p role="status" className="mt-3 min-h-5 text-sm text-danger-700">
          {state === "notConfigured" && t("notConfigured")}
          {state === "failed" && t("failed")}
          {state === "rate" && t("rate")}
        </p>
      </div>
    </form>
  );
}
