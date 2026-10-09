import { SectionLanding } from "@/components/ui/SectionLanding";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MP Previous Year Papers \u2014 MPESB & MPPSC Question Papers",
  description: "Previous year question papers for Madhya Pradesh exams with online practice. Filter by exam, year, subject and language.",
  path: "/previous-papers",
});

export default async function Page() {
  const lang = await getLang();
  return (
    <SectionLanding
      lang={lang}
      path="/previous-papers"
      title={tr(dict.nav.previousPapers, lang)}
      subtitle={tr({ hi: "परीक्षा, वर्ष, विषय और भाषा के अनुसार प्रश्नपत्र", en: "Question papers by exam, year, subject and language" }, lang)}
      message={tr(dict.comingSoon.previousPapers, lang)}
      notifySubject="previous-papers launch"
      categories={[
        
      ]}
      officialLinks={[
        { label: "MPESB \u2014 Old Question Papers", url: "https://esb.mp.gov.in/Old_Question_Papers/old_question_papers.htm" },
        { label: "MPESB \u2014 Question Objections / Response Sheet", url: "https://esb.mp.gov.in/" },
        { label: "MPPSC", url: "https://mppsc.mp.gov.in/" }
      ]}
    />
  );
}
