import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MP Naib Tehsildar Mock Test 2027 — 25 Full Tests (Hindi/English)",
  description:
    "MP नायब तहसीलदार सीमित प्रतियोगिता परीक्षा के 25 फुल मॉक टेस्ट — हर टेस्ट 200 प्रश्न (प्रश्नपत्र I + II), भू-राजस्व संहिता 1959, RBC, सेवा नियम, हिंदी/English व्याख्या सहित। सभी 25 टेस्ट फ्री। 25 free full mock tests for MP Naib Tehsildar limited exam.",
  path: "/mp-naib-tehsildar-mock-tests",
});

export default function Page() {
  return <MockTestList series="nt" />;
}
