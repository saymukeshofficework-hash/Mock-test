import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Panchayat Secretary Recruitment Mock Tests — 25 Free Tests",
  description: "25 free bilingual Panchayat Secretary practice tests. Each paper has 100 questions, 120 minutes, five sections with 20 questions each, and no negative marking.",
  path: "/panchayat-secretary-mock-tests",
});

export default function Page() {
  return <MockTestList series="panchayat" />;
}
