import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MPESB Group-4 Assistant Grade-3 Mock Test — 25 Tests (Hindi/English)",
  description:
    "MPESB ग्रुप-4 सहायक ग्रेड-3 के 25 मॉक टेस्ट — 100 प्रश्न, 120 मिनट, 6 विषय, हिंदी/English। टेस्ट 1 फ्री, बाकी 24 टेस्ट ₹99। 25 bilingual mock tests for MPESB Group-4 Assistant Grade-3.",
  path: "/group4-assistant-grade-3-mock-tests",
});

export default function Page() {
  return <MockTestList series="group4" />;
}
