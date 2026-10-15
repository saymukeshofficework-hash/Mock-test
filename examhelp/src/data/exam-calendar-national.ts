import type { Exam } from "@/types";

const checkedOn = "2026-10-15";
const official = "https://rrb.indianrailways.gov.in/";
const apply = "https://rrbapply.gov.in/#/auth/landing";

export const nationalExamCalendarEntries: Exam[] = [
  {
    id: "rrb-ntpc-graduate-2026", slug: "rrb-ntpc-graduate-2026",
    name: { hi: "रेलवे NTPC स्नातक स्तरीय भर्ती 2026 (CEN 06/2026)", en: "RRB NTPC Graduate Recruitment 2026 (CEN 06/2026)" },
    shortName: "RRB NTPC Graduate 2026", organization: "OTHER", category: "other", examType: "RECRUITMENT",
    mode: { hi: "कंप्यूटर आधारित परीक्षा (CBT)", en: "Computer-Based Test (CBT)" }, posts: 3548,
    dates: {
      applicationStart: { date: "2026-10-08", status: "CONFIRMED" },
      applicationEnd: { date: "2026-11-06", status: "CONFIRMED", note: { hi: "अंतिम तिथि; पोर्टल के निर्देश जाँचें।", en: "Application deadline; check the official portal for instructions." } },
      exam: { status: "TBA", note: { hi: "CBT की सटीक तिथि अभी घोषित नहीं।", en: "Exact CBT date not announced." } },
    },
    officialUrl: official, notificationUrl: official, rulebookUrl: official, applyUrl: apply,
    featured: false, popular: true,
    source: { label: "RRB official portal — CEN 06/2026 (reviewed 15.10.2026)", url: official, checkedOn },
    updatedAt: checkedOn,
  },
  {
    id: "rrb-ntpc-ug-2026", slug: "rrb-ntpc-undergraduate-2026",
    name: { hi: "रेलवे NTPC 12वीं स्तर भर्ती 2026 (CEN 07/2026)", en: "RRB NTPC Undergraduate Recruitment 2026 (CEN 07/2026)" },
    shortName: "RRB NTPC Undergraduate 2026", organization: "OTHER", category: "other", examType: "RECRUITMENT",
    mode: { hi: "कंप्यूटर आधारित परीक्षा (CBT)", en: "Computer-Based Test (CBT)" }, posts: 1688,
    dates: {
      applicationStart: { date: "2026-10-15", status: "CONFIRMED" },
      applicationEnd: { date: "2026-11-13", status: "CONFIRMED", note: { hi: "अंतिम तिथि; पोर्टल के निर्देश जाँचें।", en: "Application deadline; check the official portal for instructions." } },
      exam: { status: "TBA", note: { hi: "CBT की सटीक तिथि अभी घोषित नहीं।", en: "Exact CBT date not announced." } },
    },
    officialUrl: official, notificationUrl: official, rulebookUrl: official, applyUrl: apply,
    featured: false, popular: true,
    source: { label: "RRB official portal — CEN 07/2026 (reviewed 15.10.2026)", url: official, checkedOn },
    updatedAt: checkedOn,
  },
];
