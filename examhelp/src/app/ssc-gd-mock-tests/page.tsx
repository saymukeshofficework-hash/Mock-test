import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "SSC GD Mock Tests — 25 Bilingual Papers",
  description:
    "25 SSC GD practice papers (Test 1 free, the rest ₹99) with subject-wise details: Reasoning, General Knowledge, Elementary Mathematics and Hindi/English. 80 questions, 60 minutes.",
  path: "/ssc-gd-mock-tests",
});

export default function Page() {
  return <MockTestList series="sscgd" />;
}
