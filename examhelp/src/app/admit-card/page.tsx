import { SectionLanding } from "@/components/ui/SectionLanding";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MP Admit Card 2026 \u2014 MPESB & MPPSC Admit Cards",
  description: "Upcoming Madhya Pradesh exam admit cards with links to the official MPESB and MPPSC download pages.",
  path: "/admit-card",
});

export default async function Page() {
  const lang = await getLang();
  return (
    <SectionLanding
      lang={lang}
      path="/admit-card"
      title={tr(dict.nav.admitCard, lang)}
      subtitle={tr({ hi: "आगामी प्रवेश पत्र — आधिकारिक डाउनलोड लिंक सहित", en: "Upcoming admit cards \u2014 with official download links" }, lang)}
      message={tr(dict.comingSoon.admitCards, lang)}
      notifySubject="admit-card launch"
      categories={[
        
      ]}
      officialLinks={[
        { label: "MPESB \u2014 Admit Card", url: "https://esb.mp.gov.in/tacs/tacs_n.htm" },
        { label: "MPPSC", url: "https://mppsc.mp.gov.in/" }
      ]}
    />
  );
}
