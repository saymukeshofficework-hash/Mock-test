import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "RRB Station Master Mock Tests — 25 Free Bilingual Practice Papers",
  description:
    "RRB Station Master recruitment preparation: 25 free bilingual mock tests with 100 questions each, science & math, data interpretation, logical capability and reasoning practice.",
  path: "/rrb-station-master-mock-tests",
});

export default function Page() {
  return <MockTestList series="rrbsm" />;
}
