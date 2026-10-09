import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MP TET 2026 Mock Test — 25 Full Tests (Hindi & English)",
  description:
    "MP TET 2026 के 25 फुल मॉक टेस्ट — 150 प्रश्न, 150 मिनट, 5 खंड, ऋणात्मक अंकन नहीं। टेस्ट 1 फ्री, बाकी ₹199। 25 full TET mock tests in Hindi and English.",
  path: "/tet-mock-tests",
});

export default function Page() {
  return <MockTestList series="tet" />;
}
