import type { ExamNotification } from "@/types";

const CHECKED = "2026-09-30";
const ESB = "https://esb.mp.gov.in/";
const ESB_APPLY = "https://esb.mponline.gov.in/Portal/Examinations/Vyapam/examsList.aspx";

/** Only notices actually seen on the official websites. */
export const notifications: ExamNotification[] = [
  {
    id: "n-mphc-ag3-ews",
    type: "IMPORTANT_NOTICE",
    title: {
      hi: "सहायक ग्रेड-3 भर्ती 2026 — EWS वर्ग के पुरुष अभ्यर्थियों को 5 वर्ष आयु छूट (45 वर्ष तक) संबंधी शुद्धिपत्र",
      en: "Assistant Grade-3 Recruitment 2026 — corrigendum: 5-year age relaxation (up to 45) for male EWS candidates",
    },
    organization: "MPHC",
    examSlug: "mp-high-court-assistant-grade-3-2026",
    publishedOn: "2026-09-18",
    officialUrl: "https://mphc.gov.in/storage/PDF/web_pdf/ME/Corrigendum%20652%20AG-III%2018.09.2026.pdf",
    source: { label: "MP High Court", url: "https://mphc.gov.in/", checkedOn: "2026-10-01" },
  },
  {
    id: "n-mphc-ag3-extension",
    type: "DATE_CHANGE",
    title: {
      hi: "सहायक ग्रेड-3 भर्ती 2026 — आवेदन की अंतिम तिथि 30.09.2026 तक बढ़ी",
      en: "Assistant Grade-3 Recruitment 2026 — last date to apply extended to 30.09.2026",
    },
    organization: "MPHC",
    examSlug: "mp-high-court-assistant-grade-3-2026",
    publishedOn: "2026-09-15",
    officialUrl: "https://mphc.gov.in/storage/PDF/web_pdf/ME/Notification%20AG-III%20date%20extension%2015.09.2026.pdf",
    source: { label: "MP High Court", url: "https://mphc.gov.in/", checkedOn: "2026-10-01" },
  },
  {
    id: "n-mphc-ag3-advt",
    type: "NEW_RECRUITMENT",
    title: {
      hi: "जिला न्यायालयों में सहायक ग्रेड-3 सीधी भर्ती 2026 — विज्ञापन जारी",
      en: "Assistant Grade-3 Direct Recruitment 2026 for District Courts — advertisement released",
    },
    organization: "MPHC",
    examSlug: "mp-high-court-assistant-grade-3-2026",
    publishedOn: "2026-08-14",
    officialUrl: "https://mphc.gov.in/storage/PDF/web_pdf/ME/Advertisement%20AG-III%20District%20Court-2026.pdf",
    source: { label: "MP High Court", url: "https://mphc.gov.in/", checkedOn: "2026-10-01" },
  },
  {
    id: "n-psc-sfs-main-key",
    type: "ANSWER_KEY",
    title: {
      hi: "राज्य वन सेवा मुख्य परीक्षा 2026 — प्रावधिक उत्तर कुंजी जारी",
      en: "State Forest Service Main Exam 2026 — provisional answer key released",
    },
    organization: "MPPSC",
    examSlug: "mppsc-state-forest-service-2026",
    publishedOn: "2026-09-29",
    officialUrl: "https://mppsc.mp.gov.in/uploads/files/Provisional_Answer_Key_SFS_Main_Exam_2026_Dated_29_09_2026.pdf",
    source: { label: "MPPSC", url: "https://mppsc.mp.gov.in/", checkedOn: CHECKED },
  },
  {
    id: "n-psc-ap-english-result",
    type: "RESULT",
    title: {
      hi: "सहायक प्राध्यापक (अंग्रेजी) परीक्षा 2025 — लिखित परीक्षा परिणाम",
      en: "Assistant Professor (English) Exam 2025 — written exam result",
    },
    organization: "MPPSC",
    publishedOn: "2026-09-28",
    officialUrl: "https://mppsc.mp.gov.in/uploads/files/Written_Exam_Result_Assistant_Professor_English_Exam_2025_Dated_28_09_2026.pdf",
    source: { label: "MPPSC", url: "https://mppsc.mp.gov.in/", checkedOn: CHECKED },
  },
  {
    id: "n-esb-asi-open",
    type: "APPLICATION_OPEN",
    title: {
      hi: "सूबेदार (शीघ्रलेखक) एवं ASI भर्ती परीक्षा 2026 — ऑनलाइन आवेदन 24.09.2026 से",
      en: "Subedar (Steno) & ASI Recruitment Test 2026 — online applications from 24.09.2026",
    },
    organization: "MPESB",
    examSlug: "mp-subedar-steno-asi-2026",
    publishedOn: "2026-09-24",
    officialUrl: ESB_APPLY,
    source: { label: "MPESB", url: ESB, checkedOn: CHECKED },
  },
  {
    id: "n-esb-constable-open",
    type: "APPLICATION_OPEN",
    title: {
      hi: "पुलिस आरक्षक (जी.डी.) भर्ती परीक्षा 2026 — ऑनलाइन आवेदन 22.09.2026 से",
      en: "Police Constable (G.D.) Recruitment Test 2026 — online applications from 22.09.2026",
    },
    organization: "MPESB",
    examSlug: "mp-police-constable-2026",
    publishedOn: "2026-09-22",
    officialUrl: ESB_APPLY,
    source: { label: "MPESB", url: ESB, checkedOn: CHECKED },
  },
  {
    id: "n-esb-nt-open",
    type: "APPLICATION_OPEN",
    title: {
      hi: "नायब तहसीलदार विभागीय भर्ती परीक्षा 2026 — ऑनलाइन आवेदन 17.09.2026 से",
      en: "Nayab Tahsildar Departmental Test 2026 — online applications from 17.09.2026",
    },
    organization: "MPESB",
    examSlug: "mp-nayab-tahsildar-2026",
    publishedOn: "2026-09-17",
    officialUrl: ESB_APPLY,
    source: { label: "MPESB", url: ESB, checkedOn: CHECKED },
  },
  {
    id: "n-esb-tet-extension",
    type: "DATE_CHANGE",
    title: {
      hi: "शिक्षक पात्रता परीक्षा 2026 — आवेदन की अंतिम तिथि 05.10.2026 तक बढ़ाई गई",
      en: "Teacher Eligibility Test 2026 — last date to apply extended to 05.10.2026",
    },
    organization: "MPESB",
    examSlug: "mp-tet-2026",
    officialUrl: ESB_APPLY,
    source: { label: "MPESB / MPOnline", url: ESB_APPLY, checkedOn: CHECKED },
  },
  {
    id: "n-esb-g2sg4-admit",
    type: "ADMIT_CARD",
    title: {
      hi: "समूह-2 उपसमूह-4 भर्ती परीक्षा 2026 — प्रवेश पत्र एवं परीक्षा तिथि सूचना",
      en: "Group-2 Sub Group-4 Recruitment Test 2026 — admit card & exam-date notice",
    },
    organization: "MPESB",
    examSlug: "mp-group-2-sub-group-4-2026",
    officialUrl: ESB,
    source: { label: "MPESB", url: ESB, checkedOn: CHECKED },
  },
];
