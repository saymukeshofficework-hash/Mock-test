import type { GdCfg } from "@/components/landing/GdLanding";

/**
 * GD-style landing pages for test series whose exam date is officially announced.
 * Owner rule (26 Nov 2026): every series with an announced exam date gets one of these.
 *
 * To add a new exam: add one entry below (date + official source + theme), then make the
 * series page render `<ExamLanding id="<series>" />` (see src/app/ctet-paper-1-mock-tests/page.tsx).
 * Date must come from the official notice / calendar (never coaching sites). Mark proposed dates.
 * No "फ्री / Free" words here; price is shown only by the shared buy card (hidden in the app).
 */
export type Theme = "green" | "blue" | "red";

export type ExamLandingCfg = GdCfg & {
  theme: Theme;
  examHi: string; // exam name, Hindi
  examEn: string;
  dateLongHi: string; // full date line, e.g. "12 और 13 दिसंबर 2026"
  dateLongEn: string;
  proposed?: boolean; // official date is "प्रस्तावित" (proposed) only
  tentative?: boolean; // official notice not yet read by us; date from reports quoting it
  sourceHi: string; // official source, as printed on the page
  sourceUrl: string;
  label: string; // short name for the sticky bar
};

const CTET = {
  theme: "blue" as const,
  examHi: "CTET (22वाँ संस्करण)",
  examEn: "CTET (22nd edition)",
  examAt: "2026-12-12T00:00:00+05:30",
  dateHi: "12–13 दिसंबर",
  dateLongHi: "12 और 13 दिसंबर 2026",
  dateLongEn: "12 and 13 December 2026",
  sourceHi: "CBSE CTET सार्वजनिक सूचना: 22वें संस्करण की परीक्षा तिथियाँ (ctet.nic.in)",
  sourceUrl: "https://ctet.nic.in/",
  packHi: "CTET पेपर 1 + पेपर 2 के सभी 75 टेस्ट",
  packEn: "all 75 CTET Paper 1 + Paper 2 tests",
  label: "CTET",
};

const NET = {
  theme: "red" as const,
  examHi: "UGC NET दिसंबर 2026",
  examEn: "UGC NET December 2026",
  examAt: "2026-12-14T00:00:00+05:30",
  dateHi: "14 दिसंबर से (संभावित)",
  dateLongHi: "14 से 18 दिसंबर और 21 दिसंबर 2026",
  dateLongEn: "14–18 December and 21 December 2026",
  tentative: true,
  sourceHi: "NTA की विषयवार कार्यक्रम सूचना (19.11.2026) पर आधारित समाचार रिपोर्ट; पुष्टि ugcnet.nta.nic.in पर करें",
  sourceUrl: "https://ugcnet.nta.nic.in/",
  packHi: "पेपर 1 + अंग्रेज़ी पेपर 2 के सभी 50 टेस्ट",
  packEn: "all 50 Paper 1 + English Paper 2 tests",
  label: "UGC NET",
};

const MPPSC = {
  theme: "red" as const,
  examHi: "MPPSC राज्य सेवा प्रारंभिक परीक्षा 2027",
  examEn: "MPPSC State Service Prelims 2027",
  examAt: "2027-01-24T00:00:00+05:30",
  dateHi: "24 जनवरी (प्रस्तावित)",
  dateLongHi: "24 जनवरी 2027 (प्रस्तावित)",
  dateLongEn: "24 January 2027 (proposed)",
  proposed: true,
  sourceHi: "MPPSC प्रस्तावित परीक्षा कार्यक्रम 2027, दिनांक 20.11.2026 (mppsc.mp.gov.in)",
  sourceUrl: "https://mppsc.mp.gov.in/uploads/files/Exam_Calendar_2027_Dated_20_11_2026.pdf",
  label: "MPPSC",
};

export const EXAM_LANDINGS: Record<string, ExamLandingCfg> = {
  ctet1: { ...CTET, series: "ctet1", path: "/ctet-paper-1-mock-tests/" },
  ctet2ms: { ...CTET, series: "ctet2ms", path: "/ctet-paper-2-maths-science-mock-tests/" },
  ctet2sst: { ...CTET, series: "ctet2sst", path: "/ctet-paper-2-social-studies-mock-tests/" },
  netp1: { ...NET, series: "netp1", path: "/ugc-net-paper-1-mock-tests/" },
  neteng: { ...NET, series: "neteng", path: "/ugc-net-english-mock-tests/" },
  pcdr: {
    series: "pcdr",
    path: "/mp-police-driver-mock-tests/",
    theme: "red",
    examHi: "MP पुलिस आरक्षक (चालक) भर्ती परीक्षा 2026",
    examEn: "MP Police Constable (Driver) Recruitment Test 2026",
    examAt: "2027-01-04T00:00:00+05:30",
    dateHi: "4 जनवरी से",
    dateLongHi: "4 जनवरी 2027 से (प्रतिदिन दो पाली)",
    dateLongEn: "from 4 January 2027 (two shifts a day)",
    sourceHi: "MPESB आरक्षक (चालक) नियम पुस्तिका 2026, दिनांक 07.10.2026 (esb.mp.gov.in)",
    sourceUrl: "https://esb.mp.gov.in/Rulebooks/RB_2026/PCRT_Driver_2026_rulebook_07102026.pdf",
    label: "MP Driver",
  },
  nt: {
    series: "nt",
    path: "/mp-naib-tehsildar-mock-tests/",
    theme: "blue",
    examHi: "MP नायब तहसीलदार सीमित प्रतियोगिता परीक्षा",
    examEn: "MP Naib Tehsildar Limited Competitive Exam",
    examAt: "2027-01-10T00:00:00+05:30",
    dateHi: "10 जनवरी",
    dateLongHi: "10 जनवरी 2027",
    dateLongEn: "10 January 2027",
    sourceHi: "MPESB सूचना दिनांक 11.11.2026 और नायब तहसीलदार नियम पुस्तिका 2026 (esb.mp.gov.in)",
    sourceUrl: "https://esb.mp.gov.in/",
    label: "नायब तहसीलदार",
  },
  mppsc: { ...MPPSC, series: "mppsc", path: "/mppsc-prelims-mock-tests/" },
  mppsc2: { ...MPPSC, series: "mppsc2", path: "/mppsc-csat-mock-tests/" },
  uptet: {
    series: "uptet",
    path: "/uptet-mock-tests/",
    theme: "blue",
    examHi: "UPTET 2026 (शिक्षक पात्रता परीक्षा)",
    examEn: "UPTET 2026 (Teacher Eligibility Test)",
    examAt: "2027-02-26T00:00:00+05:30",
    dateHi: "26–27 फ़रवरी (संभावित)",
    dateLongHi: "26 और 27 फ़रवरी 2027",
    dateLongEn: "26 and 27 February 2027",
    tentative: true,
    sourceHi: "UPESSC विज्ञापन 10/2026 पर आधारित समाचार रिपोर्ट; पुष्टि upessc.up.gov.in पर करें",
    sourceUrl: "https://upessc.up.gov.in/",
    label: "UPTET",
  },
};
