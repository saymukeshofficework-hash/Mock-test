import { ExamLanding } from "@/components/landing/ExamLanding";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "CTET Paper 2 Maths-Science Mock Test — 25 Full Tests (Classes 6–8)",
  description:
    "CTET पेपर 2 गणित-विज्ञान (कक्षा 6–8) के 25 मॉक टेस्ट: बाल विकास, हिंदी, अंग्रेज़ी, गणित, विज्ञान, व्याख्या सहित। 25 CTET Paper 2 Maths-Science practice tests with explanations. 150 questions, 150 minutes.",
  path: "/ctet-paper-2-maths-science-mock-tests",
});

// CTET Paper 2 (Classes 6–8), series ctet2ms, added 2026-11-25. Same ₹99 order as Paper 1 (product ctet-tests).
export default function Page() {
  return <ExamLanding id="ctet2ms" />;
}
