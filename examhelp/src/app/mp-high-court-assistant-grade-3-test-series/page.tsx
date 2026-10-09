import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MP High Court Assistant Grade-3 Mock Test 2026 — 25 Full Tests (Hindi & English)",
  description:
    "MP हाई कोर्ट सहायक ग्रेड-3 के 25 फुल मॉक टेस्ट — आधिकारिक पैटर्न: 100 प्रश्न, 120 मिनट, 5 खंड। टेस्ट 1 फ्री, बाकी ₹199। 20 full mock tests on the official pattern, in Hindi and English.",
  path: "/mp-high-court-assistant-grade-3-test-series",
});

export default function Page() {
  return <MockTestList series="ag3" />;
}
