import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "CTET Paper 2 Social Studies Mock Test — 25 Full Tests (Classes 6–8)",
  description:
    "CTET पेपर 2 सामाजिक अध्ययन (कक्षा 6–8) के 25 मॉक टेस्ट: बाल विकास, हिंदी, अंग्रेज़ी, इतिहास, भूगोल, राजनीति विज्ञान, व्याख्या सहित। 25 CTET Paper 2 Social Studies practice tests with explanations. 150 questions, 150 minutes.",
  path: "/ctet-paper-2-social-studies-mock-tests",
});

// CTET Paper 2 (Classes 6–8), series ctet2sst, added 2026-11-25. Same ₹99 order as Paper 1 (product ctet-tests).
export default function Page() {
  return <MockTestList series="ctet2sst" />;
}
