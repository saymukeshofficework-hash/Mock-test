import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MP Police SI / Subedar Mock Test 2026 — 25 Full Tests (Hindi/English)",
  description:
    "MP पुलिस SI / सूबेदार 2026 के 25 फुल मॉक टेस्ट — 15 प्रारंभिक + 10 मुख्य परीक्षा, हर टेस्ट 100 प्रश्न, हिंदी/English में व्याख्या सहित। सभी 25 टेस्ट फ्री। 25 free full mock tests for MP Police SI/Subedar 2026.",
  path: "/mp-police-si-mock-tests",
});

export default function Page() {
  return <MockTestList series="mpsi" />;
}
