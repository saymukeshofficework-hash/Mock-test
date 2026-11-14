import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Navodaya (JNVST) Class 6 Mock Test 2027 — 15 Full Tests (Hindi/English)",
  description:
    "नवोदय विद्यालय (JNVST) कक्षा 6 के 15 फुल मॉक टेस्ट — प्रवेश परीक्षा पैटर्न: मानसिक योग्यता 40, अंकगणित 20, भाषा 20 · 80 प्रश्न, 100 अंक, 2 घंटे। टेस्ट 1 फ्री, बाकी 14 टेस्ट ₹99। 15 full JNVST Class 6 mock tests in Hindi/English.",
  path: "/navodaya-class-6-mock-tests",
});

export default function Page() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return (
    <>
      <div className="container-page pt-6 sm:pt-8">
        <div className="relative overflow-hidden rounded-2xl shadow-md">
          <img
            src={`${base}/mock-tests/jnv6/hero.webp`}
            alt="नवोदय की तैयारी करते खुश बच्चे · Happy students preparing for Navodaya"
            width={1200}
            height={720}
            fetchPriority="high"
            className="block h-48 w-full object-cover object-top sm:h-72"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10 text-white sm:px-6 sm:pb-5">
            <p className="text-lg font-extrabold sm:text-2xl">नवोदय में चयन, अभ्यास से आसान! 🎯</p>
            <p className="text-sm font-medium opacity-90 sm:text-base">Practice daily, crack JNVST Class 6</p>
          </div>
        </div>
      </div>
      <MockTestList series="jnv6" />
    </>
  );
}
