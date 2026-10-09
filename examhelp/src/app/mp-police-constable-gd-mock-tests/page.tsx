import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MP Police Constable GD Mock Test 2026 — 25 Full Tests (Hindi & English)",
  description:
    "MP पुलिस आरक्षक (जी.डी.) 2026 के 25 फुल मॉक टेस्ट — MPESB पैटर्न: 100 प्रश्न, 120 मिनट, 3 खंड, ऋणात्मक अंकन नहीं। टेस्ट 1 फ्री। 25 full mock tests on the MPESB pattern in Hindi and English.",
  path: "/mp-police-constable-gd-mock-tests",
});

export default function Page() {
  return <MockTestList series="pcgd" />;
}
