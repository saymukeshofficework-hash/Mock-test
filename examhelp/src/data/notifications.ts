import type { ExamNotification } from "@/types";

const CHECKED = "2026-10-26";
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

  {
    id: "n-esb-si-exam-date-2026",
    type: "IMPORTANT_NOTICE",
    title: {
      hi: "सूबेदार/उपनिरीक्षक भर्ती परीक्षा 2026 — परीक्षा 28.10.2026 से प्रारंभ",
      en: "Subedar/Sub-Inspector Recruitment Test 2026 — examination starts 28 Oct 2026",
    },
    organization: "MPESB",
    examSlug: "mp-subedar-si-2026",
    officialUrl: "https://esb.mp.gov.in/student_dashboard.htm",
    source: { label: "MPESB official student dashboard", url: "https://esb.mp.gov.in/student_dashboard.htm", checkedOn: CHECKED },
  },
  {
    id: "n-esb-group3-last-date-2026",
    type: "LAST_DATE",
    title: {
      hi: "MPESB समूह-3 भर्ती परीक्षा 2026 — पुनः आवेदन की अंतिम तिथि 27.10.2026; सुधार 28.10.2026 तक",
      en: "MPESB Group-3 Recruitment Test 2026 — reopened application deadline 27 Oct; corrections through 28 Oct",
    },
    organization: "MPESB",
    examSlug: "mp-group-3-2026",
    officialUrl: ESB_APPLY,
    source: { label: "MPESB Student Dashboard / MPOnline application listing", url: "https://esb.mp.gov.in/student_dashboard.htm", checkedOn: CHECKED },
  },
  {
    id: "n-esb-driver-last-date-2026",
    type: "LAST_DATE",
    title: {
      hi: "पुलिस आरक्षक (चालक) भर्ती परीक्षा 2026 — ऑनलाइन आवेदन की अंतिम तिथि 29.10.2026",
      en: "Police Constable (Driver) Recruitment Test 2026 — online application deadline 29 Oct 2026",
    },
    organization: "MPESB",
    examSlug: "mp-police-constable-driver-2026",
    officialUrl: ESB_APPLY,
    source: { label: "MPESB official rulebook and application listing", url: "https://esb.mp.gov.in/student_dashboard.htm", checkedOn: CHECKED },
  },
  {
    id: "n-mppsc-nov22-exam-notice",
    type: "IMPORTANT_NOTICE",
    title: {
      hi: "MPPSC वैज्ञानिक अधिकारी (भौतिकी/रसायन/जीव विज्ञान) एवं सहायक संचालक कृषि परीक्षा — 22.11.2026; प्रवेश-पत्र 12.11.2026 से",
      en: "MPPSC Scientific Officer (Physics/Chemistry/Biology) and Assistant Director Agriculture exams — 22 Nov 2026; admit cards from 12 Nov",
    },
    organization: "MPPSC",
    publishedOn: "2026-10-15",
    officialUrl: "https://mppsc.mp.gov.in/uploads/advertisement/Corrigendum_03_05_06_07_and_35_2025_Dated_15_10_2026.pdf",
    source: { label: "MPPSC official notice dated 15.10.2026", url: "https://mppsc.mp.gov.in/", checkedOn: CHECKED },
  },
  {
    id: "n-ibps-so-main-call-letter-2026",
    type: "ADMIT_CARD",
    title: {
      hi: "IBPS Specialist Officers XVI — मुख्य परीक्षा का कॉल लेटर जारी (22.10.2026)",
      en: "IBPS Specialist Officers XVI — Main Examination call letter released (22 Oct 2026)",
    },
    organization: "OTHER",
    publishedOn: "2026-10-22",
    officialUrl: "https://www.ibps.in/index.php/crp-updates/",
    source: { label: "IBPS CRP Updates", url: "https://www.ibps.in/index.php/crp-updates/", checkedOn: CHECKED },
  },
  {
    id: "n-ibps-so-prelims-scores-2026",
    type: "RESULT",
    title: {
      hi: "IBPS Specialist Officers XVI — प्रारंभिक परीक्षा के स्कोर उपलब्ध (22.10.2026)",
      en: "IBPS Specialist Officers XVI — preliminary examination scores available (22 Oct 2026)",
    },
    organization: "OTHER",
    publishedOn: "2026-10-22",
    officialUrl: "https://www.ibps.in/index.php/crp-updates/",
    source: { label: "IBPS CRP Updates", url: "https://www.ibps.in/index.php/crp-updates/", checkedOn: CHECKED },
  },
  {
    id: "n-ssc-je-city-admit-2026",
    type: "ADMIT_CARD",
    title: {
      hi: "SSC जूनियर इंजीनियर परीक्षा 2026 — परीक्षा शहर एवं प्रवेश-पत्र संबंधी सूचना जारी (23.10.2026)",
      en: "SSC Junior Engineer Examination 2026 — exam-city and admission-certificate notice published (23 Oct 2026)",
    },
    organization: "OTHER",
    publishedOn: "2026-10-23",
    officialUrl: "https://ssc.gov.in/",
    source: { label: "Staff Selection Commission — Notice Board", url: "https://ssc.gov.in/", checkedOn: CHECKED },
  },

];
