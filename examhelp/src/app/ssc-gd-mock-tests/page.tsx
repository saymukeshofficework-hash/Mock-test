import { SscGdCatalogue } from "@/components/ssc-gd/SscGdCatalogue";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "SSC GD Mock Tests — 25 Free Bilingual Papers",
  description:
    "25 free SSC GD practice papers with subject-wise details: Reasoning, General Knowledge, Elementary Mathematics and Hindi/English. 80 questions, 60 minutes.",
  path: "/ssc-gd-mock-tests",
});

export default function Page() {
  return <SscGdCatalogue />;
}
