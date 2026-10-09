"use client";
import { useEffect } from "react";
/** The site home is the login page (it shows the student's courses after login). */
export function ToLogin() {
  useEffect(() => {
    location.replace("/login.html");
  }, []);
  return <p className="p-8 text-center text-ink-500"><a href="/login.html">लॉगिन पेज खोला जा रहा है…</a></p>;
}
