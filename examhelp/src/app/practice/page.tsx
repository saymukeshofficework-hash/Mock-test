import { SectionLanding } from "@/components/ui/SectionLanding";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MP Exam Practice Tests \u2014 Free Online Practice",
  description: "Online practice tests for Madhya Pradesh competitive exams with timer, question navigation, mark for review and detailed analysis. Launching soon.",
  path: "/practice",
});

export default async function Page() {
  const lang = await getLang();
  return (
    <SectionLanding
      lang={lang}
      path="/practice"
      title={tr(dict.nav.practice, lang)}
      subtitle={tr({ hi: "टाइमर, प्रश्न नेविगेशन, रिव्यू के लिए मार्क और विस्तृत विश्लेषण", en: "Timer, question navigation, mark for review and detailed analysis" }, lang)}
      message={tr(dict.comingSoon.practice, lang)}
      notifySubject="practice launch"
      categories={[
        
      ]}
      officialLinks={[
        
      ]}
    />
  );
}
