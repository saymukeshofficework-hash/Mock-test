import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MP Mahila Supervisor (Paryavekshak) Mock Test — 25 Full Tests (Hindi/English)",
  description:
    "MP महिला पर्यवेक्षक के 25 फुल मॉक टेस्ट — MPESB पैटर्न, हर टेस्ट 200 प्रश्न · 180 मिनट, हिंदी/English में व्याख्या सहित। टेस्ट 1 फ्री, बाकी 24 टेस्ट ₹99 में। 25 full mock tests for MP Mahila Supervisor: 200 questions each, Test 1 free, the rest ₹99.",
  path: "/mp-mahila-supervisor-mock-tests",
});

export default function Page() {
  return <MockTestList series="msup" />;
}
