import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MPPSC Prelims Mock Test 2027 — 25 Full Tests (Hindi/English)",
  description:
    "MPPSC राज्य सेवा प्रारंभिक परीक्षा (सामान्य अध्ययन) के 25 मॉक टेस्ट — हर टेस्ट 100 प्रश्न, 10 इकाइयाँ, म.प्र. इतिहास, भूगोल, जनजातियाँ, हिंदी/English व्याख्या सहित। अभी सभी टेस्ट फ्री। 25 mock tests for MPPSC State Service Prelims General Studies.",
  path: "/mppsc-prelims-mock-tests",
});

export default function Page() {
  return <MockTestList series="mppsc" />;
}
