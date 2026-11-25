import Link from "next/link";
import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "UGC NET Paper 1 Mock Test 2026 — 25 Full Tests (Hindi/English)",
  description:
    "UGC NET पेपर 1 (शिक्षण एवं शोध अभिवृत्ति) के 25 मॉक टेस्ट — हर टेस्ट 50 प्रश्न, 60 मिनट: शिक्षण, शोध, बोधगम्यता, संप्रेषण, तर्क, आँकड़े, ICT, पर्यावरण, उच्च शिक्षा, व्याख्या सहित। 25 UGC NET Paper 1 mock tests in Hindi and English with explanations.",
  path: "/ugc-net-paper-1-mock-tests",
});

// UGC NET: Paper 1 (series netp1) and English Paper 2 (series neteng), added 2026-11-25.
export default function Page() {
  return (
    <>
      <div className="mx-auto mt-4 w-full max-w-5xl px-4">
        <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="UGC NET papers">
          <a href="#tests" role="tab" aria-selected="true" className="card border-2 border-brand-700 p-3 text-center">
            <span className="block text-sm font-extrabold text-brand-900">पेपर 1 / Paper 1</span>
            <span className="block text-xs text-ink-600">शिक्षण एवं शोध अभिवृत्ति · 25 टेस्ट / Teaching & Research Aptitude · 25 tests</span>
          </a>
          <Link href="/ugc-net-english-mock-tests/" role="tab" aria-selected="false" className="card p-3 text-center hover:shadow-md">
            <span className="block text-sm font-extrabold text-ink-700">पेपर 2 / Paper 2</span>
            <span className="block text-xs text-ink-600">अंग्रेज़ी · 25 टेस्ट / English · 25 tests</span>
          </Link>
        </div>
      </div>
      <div id="tests">
        <MockTestList series="netp1" />
      </div>
    </>
  );
}
