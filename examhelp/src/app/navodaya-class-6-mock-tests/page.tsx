import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Navodaya (JNVST) Class 6 Mock Test 2027 — 15 Full Tests (Hindi/English)",
  description:
    "नवोदय विद्यालय (JNVST) कक्षा 6 के 15 फुल मॉक टेस्ट — नया पैटर्न: मानसिक योग्यता, EVS, अंकगणित, भाषा · 80 प्रश्न, 100 अंक, 2 घंटे। टेस्ट 1 फ्री, बाकी 14 टेस्ट ₹99। 15 full JNVST Class 6 mock tests in Hindi/English.",
  path: "/navodaya-class-6-mock-tests",
});

export default function Page() {
  return <MockTestList series="jnv6" />;
}
