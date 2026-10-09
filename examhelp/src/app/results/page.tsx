import { SectionLanding } from "@/components/ui/SectionLanding";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MP Exam Results 2026 \u2014 MPESB, MPPSC, TET, Police Results",
  description: "Latest Madhya Pradesh exam results with links to the official MPESB and MPPSC result pages.",
  path: "/results",
});

export default async function Page() {
  const lang = await getLang();
  return (
    <SectionLanding
      lang={lang}
      path="/results"
      title={tr(dict.nav.results, lang)}
      subtitle={tr({ hi: "MPPSC, MPESB, TET, पुलिस एवं शिक्षक परीक्षा परिणाम", en: "MPPSC, MPESB, TET, Police and Teacher results" }, lang)}
      message={tr(dict.comingSoon.results, lang)}
      notifySubject="results launch"
      categories={[
        { hi: "MPPSC परिणाम", en: "MPPSC Results" },
        { hi: "MPESB परिणाम", en: "MPESB Results" },
        { hi: "TET परिणाम", en: "TET Results" },
        { hi: "पुलिस परिणाम", en: "Police Results" },
        { hi: "शिक्षक परिणाम", en: "Teacher Results" },
        { hi: "अन्य परिणाम", en: "Other Results" }
      ]}
      officialLinks={[
        { label: "MPESB \u2014 Results", url: "https://esb.mp.gov.in/results/results_n.htm" },
        { label: "MPPSC \u2014 Results", url: "https://mppsc.mp.gov.in/" }
      ]}
    />
  );
}
