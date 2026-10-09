"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="hi">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem 1rem", textAlign: "center", color: "#111827" }}>
        <h1>कुछ गलत हो गया · Something went wrong</h1>
        <button type="button" onClick={reset} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 12, background: "#163377", color: "#fff", border: 0 }}>
          पुनः प्रयास · Retry
        </button>
      </body>
    </html>
  );
}
