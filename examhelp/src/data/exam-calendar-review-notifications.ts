import type { ExamNotification } from "@/types";

const checkedOn = "2026-10-15";
const dashboard = "https://esb.mp.gov.in/student_dashboard.htm";
const home = "https://esb.mp.gov.in/home_n.html";
const rules = "https://esb.mp.gov.in/rulebooks/rule_books.htm";
const rrb = "https://rrb.indianrailways.gov.in/";
const apply = "https://rrbapply.gov.in/#/auth/landing";

export const examCalendarReviewNotifications: ExamNotification[] = [
  {
    id: "n-esb-group3-reopen-postponed", type: "DATE_CHANGE",
    title: {
      hi: "समूह-03 उपयंत्री भर्ती 2026 — आवेदन 13–27 अक्टूबर तक फिर खुले; परीक्षा दिसंबर/जनवरी तक स्थगित",
      en: "Group-3 Sub Engineer 2026 — applications reopened 13–27 October; exam postponed to December/January",
    },
    organization: "MPESB", examSlug: "mp-group-3-2026", publishedOn: "2026-10-13",
    officialUrl: dashboard,
    source: { label: "MPESB Student Dashboard / Latest Updates", url: dashboard, checkedOn },
  },
  {
    id: "n-esb-driver-open", type: "APPLICATION_OPEN",
    title: {
      hi: "पुलिस आरक्षक (चालक) भर्ती परीक्षा 2026 — आवेदन 15 अक्टूबर से शुरू",
      en: "Police Constable (Driver) Recruitment 2026 — applications open from 15 October",
    },
    organization: "MPESB", examSlug: "mp-police-constable-driver-2026", officialUrl: home,
    source: { label: "MPESB Latest Updates (reviewed 15.10.2026)", url: home, checkedOn },
  },
  {
    id: "n-esb-tet-exam-start", type: "IMPORTANT_NOTICE",
    title: {
      hi: "सेवारत शिक्षकों की पात्रता परीक्षा 2026 — आधिकारिक डैशबोर्ड पर परीक्षा 12 अक्टूबर से प्रारंभ",
      en: "In-service Teacher Eligibility Test 2026 — official dashboard lists exam start from 12 October",
    },
    organization: "MPESB", examSlug: "mp-tet-2026", officialUrl: dashboard,
    source: { label: "MPESB Student Dashboard (reviewed 15.10.2026)", url: dashboard, checkedOn },
  },
  {
    id: "n-rrb-ntpc-graduate-open", type: "APPLICATION_OPEN",
    title: {
      hi: "RRB NTPC स्नातक भर्ती 2026 (CEN 06/2026) — आवेदन की अंतिम तिथि 6 नवंबर",
      en: "RRB NTPC Graduate 2026 (CEN 06/2026) — application deadline 6 November",
    },
    organization: "OTHER", examSlug: "rrb-ntpc-graduate-2026", officialUrl: apply,
    source: { label: "RRB official portal — CEN 06/2026", url: rrb, checkedOn },
  },
  {
    id: "n-rrb-ntpc-ug-open", type: "APPLICATION_OPEN",
    title: {
      hi: "RRB NTPC 12वीं स्तर भर्ती 2026 (CEN 07/2026) — आवेदन 15 अक्टूबर से; अंतिम तिथि 13 नवंबर",
      en: "RRB NTPC Undergraduate 2026 (CEN 07/2026) — applications open 15 October; deadline 13 November",
    },
    organization: "OTHER", examSlug: "rrb-ntpc-undergraduate-2026", officialUrl: apply,
    source: { label: "RRB official portal — CEN 07/2026", url: rrb, checkedOn },
  },
];
