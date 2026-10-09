import { CurrentAffairsClient } from "@/components/ca/CurrentAffairsClient";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Daily Current Affairs 2026 — MP, India & World (PDF) | ₹49 for 30 days",
  description:
    "दैनिक करेंट अफेयर्स — मध्यप्रदेश, राष्ट्रीय व अंतरराष्ट्रीय। परीक्षा-उपयोगी तथ्य, एक-पंक्ति तथ्य, रोज़ का क्विज़ और PDF डाउनलोड — 30 दिन का पास सिर्फ़ ₹49।",
  path: "/current-affairs",
});

export default function Page() {
  return <CurrentAffairsClient />;
}
