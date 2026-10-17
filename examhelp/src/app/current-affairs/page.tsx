import { CurrentAffairsClient } from "@/components/ca/CurrentAffairsClient";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Daily Current Affairs — MP, India & World | Free Daily Quiz",
  description:
    "दैनिक करेंट अफेयर्स — मध्यप्रदेश, राष्ट्रीय व अंतरराष्ट्रीय। हर दिन 10–15 मुफ्त MCQ, सही उत्तर, व्याख्या और PDF डाउनलोड।",
  path: "/current-affairs",
});

export default function Page() {
  return <CurrentAffairsClient />;
}
