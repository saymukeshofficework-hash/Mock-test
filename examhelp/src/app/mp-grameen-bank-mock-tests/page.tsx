import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Madhya Pradesh Gramin Bank Mock Tests — 25 Tests, 80 Questions",
  description:
    "मध्य प्रदेश ग्रामीण बैंक भर्ती की तैयारी के लिए 25 द्विभाषी अभ्यास मॉक टेस्ट — प्रत्येक में 80 प्रश्न, 45 मिनट, रीजनिंग और संख्यात्मक योग्यता। टेस्ट 1 फ्री।",
  path: "/mp-grameen-bank-mock-tests",
});

export default function Page() {
  return <MockTestList series="mpgrb" />;
}
