import Link from "next/link";
import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MPPSC Prelims Mock Test 2027 — 25 Full Tests (Hindi/English)",
  description:
    "MPPSC राज्य सेवा प्रारंभिक परीक्षा (सामान्य अध्ययन) के 25 मॉक टेस्ट — हर टेस्ट 100 प्रश्न, 10 इकाइयाँ, म.प्र. इतिहास, भूगोल, जनजातियाँ, हिंदी/English व्याख्या सहित। टेस्ट 1 फ्री, बाकी 24 टेस्ट ₹99 में। 25 mock tests for MPPSC State Service Prelims General Studies.",
  path: "/mppsc-prelims-mock-tests",
});

// Paper 1 (General Studies) and Paper 2 (CSAT, series mppsc2) are both live (owner, 2026-11-15).
export default function Page() {
  return (
    <>
      <div className="mx-auto mt-4 w-full max-w-5xl px-4">
        <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="MPPSC Prelims papers">
          <a href="#tests" role="tab" aria-selected="true" className="card border-2 border-brand-700 p-3 text-center">
            <span className="block text-sm font-extrabold text-brand-900">प्रश्नपत्र-1 / Paper 1</span>
            <span className="block text-xs text-ink-600">सामान्य अध्ययन · 25 टेस्ट / General Studies · 25 tests</span>
          </a>
          <Link href="/mppsc-csat-mock-tests/" role="tab" aria-selected="false" className="card p-3 text-center hover:shadow-md">
            <span className="block text-sm font-extrabold text-ink-700">प्रश्नपत्र-2 / Paper 2</span>
            <span className="block text-xs text-ink-600">सामान्य अभिरुचि (CSAT) · 25 टेस्ट / General Aptitude · 25 tests</span>
          </Link>
        </div>
      </div>
      <div id="tests">
        <MockTestList series="mppsc" />
      </div>
    </>
  );
}
