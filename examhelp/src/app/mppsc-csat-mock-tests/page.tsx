import Link from "next/link";
import { ExamLanding } from "@/components/landing/ExamLanding";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MPPSC Prelims CSAT Mock Test 2027 — 25 Full Tests (Paper 2, Hindi/English)",
  description:
    "MPPSC राज्य सेवा प्रारंभिक परीक्षा प्रश्नपत्र-2 (सामान्य अभिरुचि परीक्षण, CSAT) के 25 मॉक टेस्ट — हर टेस्ट 100 प्रश्न: बोधगम्यता, तर्कशक्ति, निर्णय क्षमता, संख्यात्मकता, आँकड़ों का निर्वचन, हिंदी बोधगम्यता, हल सहित। 25 CSAT mock tests for MPPSC Prelims Paper 2.",
  path: "/mppsc-csat-mock-tests",
});

// Paper 2 (General Aptitude / CSAT), series mppsc2; Paper 1 lives at /mppsc-prelims-mock-tests (owner, 2026-11-15).
export default function Page() {
  return (
    <ExamLanding
      id="mppsc2"
      tabs={
        <div className="mx-auto mt-4 w-full max-w-5xl px-4">
          <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="MPPSC Prelims papers">
            <Link href="/mppsc-prelims-mock-tests/" role="tab" aria-selected="false" className="card p-3 text-center hover:shadow-md">
              <span className="block text-sm font-extrabold text-ink-700">प्रश्नपत्र-1 / Paper 1</span>
              <span className="block text-xs text-ink-600">सामान्य अध्ययन · 25 टेस्ट / General Studies · 25 tests</span>
            </Link>
            <a href="#tests" role="tab" aria-selected="true" className="card border-2 border-brand-700 p-3 text-center">
              <span className="block text-sm font-extrabold text-brand-900">प्रश्नपत्र-2 / Paper 2</span>
              <span className="block text-xs text-ink-600">सामान्य अभिरुचि (CSAT) · 25 टेस्ट / General Aptitude · 25 tests</span>
            </a>
          </div>
        </div>
      }
    />
  );
}
