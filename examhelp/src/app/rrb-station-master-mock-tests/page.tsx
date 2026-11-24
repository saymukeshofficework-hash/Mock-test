import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "RRB Station Master Mock Tests — 25 Bilingual Practice Papers",
  description:
    "RRB Station Master recruitment preparation: 25 bilingual mock tests with 100 questions each (Test 1 free, the rest ₹99), science & math, data interpretation, logical capability and reasoning practice.",
  path: "/rrb-station-master-mock-tests",
});

export default function Page() {
  return <MockTestList series="rrbsm" />;
}
