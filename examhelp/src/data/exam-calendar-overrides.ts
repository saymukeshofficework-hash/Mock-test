import type { Exam } from "@/types";

const checkedOn = "2026-10-15";
const dashboard = "https://esb.mp.gov.in/student_dashboard.htm";
const rules = "https://esb.mp.gov.in/rulebooks/rule_books.htm";
const source = (label: string, url = dashboard) => ({ label, url, checkedOn });

export const examCalendarOverrides: Record<string, Partial<Exam>> = {
  "mp-teacher-eligibility-test-2026": {
    dates: { exam: { date: "2026-10-12", status: "CONFIRMED", note: {
      hi: "MPESB Student Dashboard में परीक्षा 12.10.2026 से प्रारंभ दिखाई गई है; नवीन सूचना/प्रवेश पत्र पोर्टल पर देखें।",
      en: "The official dashboard lists the exam as starting 12 October 2026; check it for latest notices and admit-card instructions."
    } } },
    notificationUrl: dashboard, rulebookUrl: dashboard,
    source: source("MPESB Student Dashboard (reviewed 15.10.2026)"), updatedAt: checkedOn,
  },
  "mp-group-3-2026": {
    dates: {
      applicationStart: { date: "2026-10-13", status: "CONFIRMED", note: { hi: "आवेदन पुनः खुले।", en: "Applications reopened." } },
      applicationEnd: { date: "2026-10-27", status: "CONFIRMED", note: { hi: "पुनः खुले आवेदन की अंतिम तिथि।", en: "Closing date for the reopened window." } },
      correctionEnd: { date: "2026-10-28", status: "CONFIRMED" },
      exam: { month: "2026-12", status: "EXPECTED", note: {
        hi: "13.10.2026 की MPESB सूचना: परीक्षा दिसंबर 2026/जनवरी 2027 तक स्थगित; सटीक तिथि घोषित नहीं।",
        en: "MPESB's 13 October notice postpones the exam to December 2026/January 2027; exact date not announced."
      } },
    },
    notificationUrl: dashboard, rulebookUrl: dashboard,
    source: source("MPESB reopening/postponement notice (15.10.2026)"), updatedAt: checkedOn,
  },
  "mp-group-2-sg-4-2026": {
    dates: { exam: { date: "2026-09-23", endDate: "2026-10-05", status: "COMPLETED", note: {
      hi: "आधिकारिक डैशबोर्ड के अनुसार परीक्षा 23.09–05.10.2026 तक हुई। नवीनतम अपडेट में प्रश्न/उत्तर आपत्ति लिंक है; समय-सीमा पोर्टल पर जाँचें।",
      en: "The official dashboard lists the exam for 23 Sep–5 Oct. Latest updates list an objection link; check the portal for its deadline."
    } } },
    notificationUrl: dashboard, rulebookUrl: dashboard,
    source: source("MPESB Student Dashboard / latest updates (15.10.2026)"), updatedAt: checkedOn,
  },
  "mp-subedar-si-2026": {
    dates: { exam: { date: "2026-10-28", status: "CONFIRMED", note: {
      hi: "MPESB Student Dashboard में परीक्षा 28.10.2026 से प्रारंभ दर्शाई गई है।",
      en: "The MPESB Student Dashboard lists the exam as starting 28 October 2026."
    } } },
    notificationUrl: dashboard, rulebookUrl: dashboard,
    source: source("MPESB Student Dashboard — exam start 28.10.2026"), updatedAt: checkedOn,
  },
  "mp-police-constable-driver-2026": {
    dates: {
      applicationStart: { date: "2026-10-15", status: "CONFIRMED", note: {
        hi: "MPESB ने आवेदन प्रारंभ तिथि 15.10.2026 बताई; समीक्षा के समय अंतिम तिथि स्पष्ट नहीं थी।",
        en: "MPESB lists 15 October as the opening date; a closing date was not clear in the listing reviewed."
      } },
      exam: { month: "2026-11", status: "EXPECTED", note: {
        hi: "संशोधित संभावित कैलेंडर में नवंबर 2026; सटीक तिथि घोषित नहीं।",
        en: "November 2026 per the tentative calendar; exact date not announced."
      } },
    },
    notificationUrl: rules, rulebookUrl: rules,
    source: source("MPESB latest updates & rulebook index (15.10.2026)", rules), updatedAt: checkedOn,
  },
};
