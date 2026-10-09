"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";

/** 500-style error boundary. Bilingual because it cannot read the language cookie on the server. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page flex flex-col items-center py-16 text-center sm:py-24">
      <p className="text-7xl font-extrabold text-brand-100 sm:text-8xl">500</p>
      <h1 className="mt-2 text-2xl font-bold text-brand-900">कुछ गलत हो गया · Something went wrong</h1>
      <p className="mt-2 max-w-md text-ink-500">कृपया पुनः प्रयास करें। · Please try again.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-navy">
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> पुनः प्रयास · Retry
        </button>
        <Link href="/" className="btn-outline">
          होम · Home
        </Link>
      </div>
    </div>
  );
}
