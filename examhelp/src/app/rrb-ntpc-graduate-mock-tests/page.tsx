import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "RRB NTPC Graduate Level (CEN 06/2025) Mock Test — 25 Full CBT-1 Tests",
  description:
    "RRB NTPC Graduate Level (CEN 06/2025) के 25 फुल CBT-1 मॉक टेस्ट — 100 प्रश्न, 90 मिनट, 3 खंड, ⅓ नेगेटिव मार्किंग। टेस्ट 1 फ्री।",
  path: "/rrb-ntpc-graduate-mock-tests",
});

export default function Page() {
  return <MockTestList series="rrbg" />;
}
