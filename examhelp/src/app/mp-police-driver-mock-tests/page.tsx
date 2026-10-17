import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MP Police Constable Driver Mock Test 2026 — 25 Full Tests (Hindi)",
  description:
    "MP पुलिस आरक्षक (चालक) 2026 के 25 फुल मॉक टेस्ट — MPESB पैटर्न: 100 प्रश्न, 120 मिनट, 3 खंड, ऋणात्मक अंकन नहीं। टेस्ट 1 फ्री, बाकी 24 टेस्ट ₹99। 25 full mock tests for MP Police Driver 2026 on the MPESB pattern.",
  path: "/mp-police-driver-mock-tests",
});

export default function Page() {
  return <MockTestList series="pcdr" />;
}
