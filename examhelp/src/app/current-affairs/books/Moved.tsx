"use client";

import { useEffect } from "react";

/** Magazines moved to the main site's e-book page (owner, 2026-11-16). */
export function MovedToMainSite() {
  useEffect(() => {
    location.replace("/current-affairs-ebook.html");
  }, []);
  return (
    <div className="container-page py-16 text-center">
      <a href="/current-affairs-ebook.html" className="btn-primary">पत्रिकाएँ यहाँ पढ़ें / Read magazines here →</a>
    </div>
  );
}
