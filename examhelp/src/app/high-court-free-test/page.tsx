import { AdLoginHero } from "@/components/landing/AdLoginHero";
import { MockTestList } from "@/components/mock/MockTestList";
import { pageMeta } from "@/lib/seo";

// Landing page for Instagram ads. Same content as the High Court mock test page,
// plus a Login / Register hero. Kept out of Google so it does not compete with the main page.
export const metadata = {
  ...pageMeta({
    title: "MP High Court Assistant Grade-3 — फ्री मॉक टेस्ट | Free Mock Test",
    description:
      "MP हाई कोर्ट सहायक ग्रेड-3: पहला मॉक टेस्ट फ्री, लॉगिन करें और अभी दें। 25 full mock tests on the official pattern, Hindi & English.",
    path: "/mp-high-court-assistant-grade-3-mock-tests",
  }),
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <AdLoginHero>
      <MockTestList />
    </AdLoginHero>
  );
}
