import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "CTET Paper 1 Mock Test — 25 Full Tests (Classes 1–5)",
  description:
    "CTET पेपर 1 (कक्षा 1–5) के 25 मॉक टेस्ट: बाल विकास, हिंदी, अंग्रेज़ी, गणित, पर्यावरण अध्ययन, व्याख्या सहित। 25 CTET Paper 1 practice tests with explanations. 150 questions, 150 minutes.",
  path: "/ctet-paper-1-mock-tests",
});

// CTET Paper 1 (Classes 1–5), series ctet1, added 2026-11-25.
export default function Page() {
  return <MockTestList series="ctet1" />;
}
