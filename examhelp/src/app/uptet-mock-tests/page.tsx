import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "UPTET 2026 Mock Test — 25 Full Tests (Paper 1 + Paper 2)",
  description:
    "UPTET 2026 के 25 मॉक टेस्ट (पेपर 1 कक्षा 1–5 और पेपर 2 कक्षा 6–8): बाल विकास, हिंदी, अंग्रेज़ी, गणित, EVS/विज्ञान/सामाजिक अध्ययन, व्याख्या सहित। 25 UPTET practice tests with explanations. 150 questions, 150 minutes.",
  path: "/uptet-mock-tests",
});

// UPTET 2026 (UPESSC adv 10/2026), series uptet, added 2026-11-25.
export default function Page() {
  return <MockTestList series="uptet" />;
}
