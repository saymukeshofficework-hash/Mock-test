"use client";

import { useEffect, useState } from "react";
import { LogIn, PlayCircle } from "lucide-react";

const SHOTS = [
  { file: "hc-question.jpg", hi: "", en: "" },
  { file: "hc-result.jpg", hi: "तुरंत रिज़ल्ट और विषयवार विश्लेषण", en: "Instant result with section-wise analysis" },
  { file: "hc-solution.jpg", hi: "हर प्रश्न का सही उत्तर व्याख्या सहित", en: "Correct answer with explanation for every question" },
];

/** Instagram-ad landing hero: shows Login / Register until the visitor is logged in. */
export function AdLoginHero({ children }: { children?: React.ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginHref, setLoginHref] = useState("/login.html");
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const freeTest = `${base}/mock-tests/ag3/test.html?t=01&lang=hi`;
  useEffect(() => {
    // after login the visitor lands straight on the free test
    setLoginHref(`/login.html?next=${encodeURIComponent(freeTest)}`);
    try {
      setLoggedIn(!!localStorage.getItem("sb-ovaubhekxjtkodkhsybg-auth-token"));
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <>
    <section className="container-page pt-6">
      <div className="card border-brand-200 bg-brand-50 p-5 text-center sm:p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-accent-700">MP High Court Assistant Grade-3</p>
        <h2 className="mt-1 text-xl font-extrabold text-brand-900 sm:text-2xl">
          पहला मॉक टेस्ट फ्री — अभी दें
          <span className="block text-base font-semibold text-ink-700 sm:text-lg">First mock test is free — take it now</span>
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-ink-600">
          {loggedIn
            ? "आप लॉगिन हैं। फ्री टेस्ट शुरू करें, बाकी 24 टेस्ट ₹99 में अनलॉक करें। / You are logged in. Start the free test, unlock the other 24 for ₹99."
            : "टेस्ट देने के लिए पहले लॉगिन या रजिस्टर करें (1 मिनट)। / Log in or register first to take the test (1 minute)."}
        </p>
        <div className="mx-auto mt-4 flex max-w-md flex-col gap-2 sm:flex-row">
          {loggedIn ? (
            <a href={freeTest} className="btn-primary w-full">
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
              फ्री टेस्ट शुरू करें / Start free test
            </a>
          ) : (
            <>
              <a href={loginHref} className="btn-primary w-full">
                <LogIn className="h-4 w-4" aria-hidden="true" />
                लॉगिन / Login
              </a>
              <a href={loginHref} className="inline-flex w-full items-center justify-center rounded-lg bg-white px-3 py-2 text-sm font-bold text-brand-700 ring-1 ring-brand-300">
                नया रजिस्टर / Register
              </a>
            </>
          )}
        </div>
      </div>

      {loggedIn ? null : (
        <div className="card mx-auto mt-4 max-w-md p-4 text-center">
          <h3 className="font-bold text-ink-900">
            मॉक टेस्ट 1 / Mock Test 1
            <span className="ml-2 rounded-full bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-700">फ्री / Free</span>
          </h3>
          <p className="mt-1 text-xs text-ink-500">100 प्रश्न · 120 मिनट / 100 Qs · 120 min</p>
          <a href={loginHref} className="btn-primary mt-3 w-full">
            <PlayCircle className="h-4 w-4" aria-hidden="true" />
            लॉगिन करके शुरू करें / Log in to start
          </a>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-center text-lg font-extrabold text-brand-900 sm:text-xl">
          टेस्ट ऐसा दिखता है
          <span className="block text-sm font-semibold text-ink-700">This is how the test looks</span>
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {SHOTS.map((s) => (
            <figure key={s.file} className="card overflow-hidden p-2 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${base}/ad-shots/${s.file}`} alt={s.hi || "Mock test screen"} loading="lazy" className="mx-auto w-full rounded-lg" />
              {s.hi ? (
                <figcaption className="mt-2 text-sm font-semibold text-ink-800">
                  {s.hi}
                  <span className="block text-xs font-normal text-ink-600">{s.en}</span>
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
    {/* Test list only after login: a visitor from the ad sees login/register and screenshots only */}
    {loggedIn ? children : null}
    </>
  );
}
