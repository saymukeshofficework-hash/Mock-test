import { Suspense } from "react";
import { DownloadClient } from "@/components/download/DownloadClient";
import { pageMeta } from "@/lib/seo";

export const metadata = {
  ...pageMeta({ title: "Download your notes", description: "Download the PDF notes you bought on TETTESTHUB.", path: "/download" }),
  robots: { index: false, follow: false },
};

export default function DownloadPage() {
  return (
    <div className="container-page max-w-xl py-12">
      <Suspense fallback={<div className="card p-6 text-center text-ink-500">…</div>}>
        <DownloadClient />
      </Suspense>
    </div>
  );
}
