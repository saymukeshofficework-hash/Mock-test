import type { Exam } from "@/types";

/**
 * Seed exam records.
 *
 * Every date below was checked on 30 Sep 2026 against the official source
 * named in `source`. Rules:
 *  - CONFIRMED  -> an official rulebook/notice states the exact date.
 *  - TENTATIVE  -> official document gives a date but marks it "संभावित"
 *                  (probable), or it was not re-confirmed after a change.
 *  - EXPECTED   -> only a month is known (official exam calendar).
 *  - TBA        -> nothing official yet.
 * Update these from the admin panel (Phase 7) — never edit components.
 */

const ESB = "https://esb.mp.gov.in/";
const ESB_RB = "https://esb.mp.gov.in/Rulebooks/RB_2026/";
const ESB_APPLY = "https://esb.mponline.gov.in/Portal/Examinations/Vyapam/examsList.aspx";
const ESB_CAL = "https://esb.mp.gov.in/Exams_Schedule/Exam_schedule_2026_060826.pdf";
const PSC = "https://mppsc.mp.gov.in/";
const PSC_CAL = "https://mppsc.mp.gov.in/uploads/calendar/Revised_Exam_Calendar_2026_Dated_15_05_2026.pdf";
const CHECKED = "2026-09-30";

const calNote = {
  hi: "MPESB के संभावित परीक्षा कैलेंडर (संशोधित 05.08.2026) के अनुसार केवल माह घोषित।",
  en: "Only the month is announced, per MPESB's expected exam calendar (revised 05.08.2026).",
};

export const exams: Exam[] = [
  {
    id: "mp-police-constable-gd-2026",
    slug: "mp-police-constable-2026",
    name: {
      hi: "आरक्षक (जी.डी.) भर्ती परीक्षा 2026",
      en: "MP Police Constable (G.D.) Recruitment Test 2026",
    },
    shortName: "Police Constable 2026",
    organization: "MPESB",
    category: "police",
    examType: "RECRUITMENT",
    mode: { hi: "ऑनलाइन (CBT)", en: "Online (CBT)" },
    posts: 7500,
    dates: {
      applicationStart: { date: "2026-09-22", status: "CONFIRMED" },
      applicationEnd: { date: "2026-10-06", status: "CONFIRMED" },
      correctionEnd: { date: "2026-10-11", status: "CONFIRMED" },
      exam: {
        date: "2026-11-19",
        status: "TENTATIVE",
        note: {
          hi: "नियमपुस्तिका में \"संभावित परीक्षा दिनांक — 19-11-2026 से प्रारंभ\" लिखा है।",
          en: "Rulebook lists this as the probable start date (\"संभावित\").",
        },
      },
    },
    officialUrl: ESB,
    applyUrl: ESB_APPLY,
    rulebookUrl: `${ESB_RB}PCRT_GD_2026_RuleBook_09092026.pdf`,
    notificationUrl: `${ESB_RB}PCRT_2026_Rulebook_Revised_Page_01_15092026.pdf`,
    featured: true,
    popular: true,
    source: { label: "MPESB Rulebook (revised page 1, 15.09.2026)", url: `${ESB_RB}PCRT_2026_Rulebook_Revised_Page_01_15092026.pdf`, checkedOn: CHECKED },
    testSeries: {
      href: "/mp-police-constable-gd-mock-tests/",
      title: { hi: "आरक्षक (जी.डी.) 2026 — 25 फुल मॉक टेस्ट", en: "Police Constable GD 2026 — 25 full mock tests" },
      sub: { hi: "MPESB पैटर्न: 100 प्रश्न · 120 मिनट · 3 खंड · टेस्ट 1 फ्री, बाकी 24 टेस्ट ₹199 में", en: "MPESB pattern: 100 Qs · 120 min · 3 sections · Test 1 free, other 24 for ₹199" },
      cta: { hi: "टेस्ट देखें", en: "View tests" },
    },
    updatedAt: CHECKED,
  },
  {
    id: "mp-subedar-steno-asi-2026",
    slug: "mp-subedar-steno-asi-2026",
    name: {
      hi: "सूबेदार (अनुसचिवीय) शीघ्रलेखक एवं सहायक उप निरीक्षक (अनुसचिवीय) भर्ती परीक्षा 2026",
      en: "MP Subedar (Stenographer) & ASI (Ministerial) Recruitment Test 2026",
    },
    shortName: "Subedar Steno & ASI 2026",
    organization: "MPESB",
    category: "police",
    examType: "RECRUITMENT",
    mode: { hi: "ऑनलाइन (CBT)", en: "Online (CBT)" },
    posts: 566,
    dates: {
      applicationStart: { date: "2026-09-24", status: "CONFIRMED" },
      applicationEnd: { date: "2026-10-08", status: "CONFIRMED" },
      correctionEnd: { date: "2026-10-13", status: "CONFIRMED" },
      exam: {
        date: "2026-11-03",
        status: "CONFIRMED",
        note: { hi: "प्रथम चरण — लिखित परीक्षा प्रारंभ", en: "Phase 1 written exam begins" },
      },
    },
    officialUrl: ESB,
    applyUrl: ESB_APPLY,
    rulebookUrl: `${ESB_RB}Steno_ASI_2026_Rulebook_17092026.pdf`,
    featured: true,
    popular: true,
    source: { label: "MPESB Rulebook (17.09.2026)", url: `${ESB_RB}Steno_ASI_2026_Rulebook_17092026.pdf`, checkedOn: CHECKED },
    testSeries: {
      href: "/mp-police-subedar-asi-mock-tests/",
      title: { hi: "सूबेदार / ASI 2026 — 25 फुल मॉक टेस्ट", en: "Subedar / ASI 2026 — 25 full mock tests" },
      sub: { hi: "MPESB पैटर्न: 100 प्रश्न · 120 मिनट · 3 खंड · टेस्ट 1 फ्री, बाकी 24 टेस्ट ₹199 में", en: "MPESB pattern: 100 Qs · 120 min · 3 sections · Test 1 free, other 24 for ₹199" },
      cta: { hi: "टेस्ट देखें", en: "View tests" },
    },
    updatedAt: CHECKED,
  },
  {
    id: "mp-nayab-tahsildar-2026",
    slug: "mp-nayab-tahsildar-2026",
    name: {
      hi: "नायब तहसीलदार विभागीय (सीमित प्रतियोगिता) भर्ती परीक्षा 2026",
      en: "MP Nayab Tahsildar Departmental Recruitment Test 2026",
    },
    shortName: "Nayab Tahsildar 2026",
    organization: "MPESB",
    category: "revenue",
    examType: "DEPARTMENTAL",
    mode: { hi: "ऑनलाइन (CBT)", en: "Online (CBT)" },
    posts: 73,
    description: {
      hi: "लिपिकवर्गीय सेवाओं तथा पटवारी/राजस्व निरीक्षक संवर्ग के कर्मचारियों के लिए सीमित प्रतियोगिता परीक्षा।",
      en: "Limited competitive exam for clerical staff and Patwari/Revenue Inspector cadre employees.",
    },
    dates: {
      applicationStart: { date: "2026-09-17", status: "CONFIRMED" },
      applicationEnd: { date: "2026-10-01", status: "CONFIRMED" },
      correctionEnd: { date: "2026-10-06", status: "CONFIRMED" },
      exam: {
        date: "2026-11-14",
        status: "TENTATIVE",
        note: { hi: "नियमपुस्तिका में संभावित दिनांक के रूप में दी गई है।", en: "Given as the probable date in the rulebook." },
      },
    },
    officialUrl: ESB,
    applyUrl: ESB_APPLY,
    rulebookUrl: `${ESB_RB}Nayab_Tehsildar_2026_Rule_Book_11092026.pdf`,
    featured: true,
    source: { label: "MPESB Rulebook (11.09.2026)", url: `${ESB_RB}Nayab_Tehsildar_2026_Rule_Book_11092026.pdf`, checkedOn: CHECKED },
    updatedAt: CHECKED,
  },
  {
    id: "mp-teacher-eligibility-test-2026",
    slug: "mp-tet-2026",
    name: {
      hi: "प्राथमिक एवं माध्यमिक कक्षाओं में अध्यापन कर रहे शिक्षकों के लिए पात्रता परीक्षा 2026",
      en: "MP Teacher Eligibility Test 2026 (for in-service Primary & Middle school teachers)",
    },
    shortName: "MP TET 2026",
    organization: "MPESB",
    category: "teacher",
    examType: "ELIGIBILITY",
    mode: { hi: "ऑनलाइन (CBT)", en: "Online (CBT)" },
    description: {
      hi: "माननीय सर्वोच्च न्यायालय के आदेश दिनांक 01.09.2025 (सिविल अपील 1385/2025, 1386/2025) के अनुपालन में सेवारत शिक्षकों हेतु।",
      en: "For serving teachers, in compliance with the Supreme Court order dated 01.09.2025 (Civil Appeals 1385/2025 & 1386/2025).",
    },
    dates: {
      applicationStart: { date: "2026-08-21", status: "CONFIRMED" },
      applicationEnd: {
        date: "2026-10-05",
        status: "CONFIRMED",
        note: { hi: "अंतिम तिथि बढ़ाई गई (पूर्व में 18.09.2026)।", en: "Last date extended (earlier 18.09.2026)." },
      },
      correctionEnd: { date: "2026-10-06", status: "CONFIRMED" },
      exam: {
        date: "2026-10-12",
        status: "TENTATIVE",
        note: {
          hi: "04.09.2026 की नियमपुस्तिका के अनुसार। आवेदन तिथि बढ़ने के बाद परीक्षा तिथि की पुनः पुष्टि नहीं हुई — आधिकारिक सूचना देखें।",
          en: "Per the rulebook of 04.09.2026. Not re-confirmed after the application extension — check the official notice.",
        },
      },
    },
    testSeries: {
      href: "/tests.html",
      title: { hi: "TET मॉक टेस्ट सीरीज़ — 25 फुल-लेंथ टेस्ट", en: "TET Mock Test Series — 25 full-length tests" },
      sub: {
        hi: "हर टेस्ट में 150 प्रश्न · 150 मिनट · हिंदी/English · टेस्ट 1 फ्री, बाकी 24 टेस्ट ₹199 में",
        en: "150 questions · 150 minutes each · Hindi/English · Test 1 free, other 24 for ₹199",
      },
      cta: { hi: "टेस्ट सीरीज़ देखें", en: "See test series" },
    },
    officialUrl: ESB,
    applyUrl: ESB_APPLY,
    rulebookUrl: `${ESB_RB}EligibilityTest2026_for_Teachers_2026_Revised_04092026.pdf`,
    featured: true,
    popular: true,
    source: { label: "MPESB Rulebook (revised 04.09.2026) & MPOnline form listing", url: `${ESB_RB}EligibilityTest2026_for_Teachers_2026_Revised_04092026.pdf`, checkedOn: CHECKED },
    updatedAt: CHECKED,
  },
  {
    id: "mp-group-3-2026",
    slug: "mp-group-3-2026",
    name: {
      hi: "समूह-03 उपयंत्री, मानचित्रकार, प्रयोगशाला तकनीशियन एवं अन्य समकक्ष पद संयुक्त भर्ती परीक्षा 2026 (द्वितीय)",
      en: "MP Group-3 Sub Engineer, Draughtsman, Lab Technician & Other Posts Combined Recruitment Test 2026 (II)",
    },
    shortName: "Group-3 2026",
    organization: "MPESB",
    category: "technical",
    examType: "RECRUITMENT",
    mode: { hi: "ऑनलाइन (CBT)", en: "Online (CBT)" },
    posts: 700,
    dates: {
      applicationStart: { date: "2026-08-29", status: "CONFIRMED" },
      applicationEnd: { date: "2026-09-12", status: "CONFIRMED" },
      correctionEnd: { date: "2026-09-17", status: "CONFIRMED" },
      exam: { date: "2026-10-07", status: "CONFIRMED" },
    },
    officialUrl: ESB,
    rulebookUrl: `${ESB_RB}Group03_2026_Updated_27082026.pdf`,
    featured: true,
    popular: true,
    source: { label: "MPESB Rulebook (27.08.2026)", url: `${ESB_RB}Group03_2026_Updated_27082026.pdf`, checkedOn: CHECKED },
    updatedAt: CHECKED,
  },
  {
    id: "mp-group-2-sg-4-2026",
    slug: "mp-group-2-sub-group-4-2026",
    name: {
      hi: "समूह-02 उपसमूह-04 (खण्ड पंचायत अधिकारी, संचालन समन्वय अधिकारी एवं अन्य) संयुक्त भर्ती परीक्षा 2026",
      en: "MP Group-2 Sub Group-4 Combined Recruitment Test 2026",
    },
    shortName: "Group-2 SG-4 2026",
    organization: "MPESB",
    category: "mpesb",
    examType: "RECRUITMENT",
    posts: 2299,
    dates: {
      exam: {
        status: "TBA",
        note: {
          hi: "MPESB ने प्रवेश पत्र एवं परीक्षा तिथि सूचना जारी की है — आधिकारिक वेबसाइट पर देखें।",
          en: "MPESB has released the admit card and exam-date notice — check the official website.",
        },
      },
    },
    officialUrl: ESB,
    rulebookUrl: `${ESB_RB}Group2_SG4_Patwari_rect_test_2026_Rulebook_04082026_v2.pdf`,
    featured: false,
    popular: true,
    source: { label: "MPESB website — Latest Updates", url: ESB, checkedOn: CHECKED },
    updatedAt: CHECKED,
  },
  {
    id: "mp-group-2-sg-1-2026",
    slug: "mp-group-2-sub-group-1-2026",
    name: {
      hi: "समूह-2 उपसमूह-1 कृषि विस्तार अधिकारी भर्ती परीक्षा 2026",
      en: "MP Group-2 Sub Group-1 Agriculture Extension Officer Recruitment Test 2026",
    },
    shortName: "Group-2 SG-1 2026",
    organization: "MPESB",
    category: "mpesb",
    examType: "RECRUITMENT",
    posts: 2784,
    dates: { exam: { month: "2026-09", status: "EXPECTED", note: calNote } },
    officialUrl: ESB,
    featured: false,
    source: { label: "MPESB Exam Calendar (revised 05.08.2026)", url: ESB_CAL, checkedOn: CHECKED },
    updatedAt: CHECKED,
  },
  {
    id: "mp-subedar-si-2026",
    slug: "mp-subedar-si-2026",
    name: {
      hi: "सूबेदार/उपनिरीक्षक संवर्ग भर्ती परीक्षा 2026",
      en: "MP Subedar & Sub-Inspector Recruitment Test 2026",
    },
    shortName: "Subedar/SI 2026",
    organization: "MPESB",
    category: "police",
    examType: "RECRUITMENT",
    posts: 507,
    dates: { exam: { month: "2026-10", status: "EXPECTED", note: { hi: "कैलेंडर में सितंबर/अक्टूबर 2026 संभावित।", en: "Calendar lists Sep/Oct 2026 as expected." } } },
    officialUrl: ESB,
    rulebookUrl: `${ESB_RB}SI_Rulebook-2026_updated_09092026.pdf`,
    featured: false,
    popular: true,
    source: { label: "MPESB Exam Calendar (revised 05.08.2026)", url: ESB_CAL, checkedOn: CHECKED },
    updatedAt: CHECKED,
  },
  {
    id: "mp-police-constable-driver-2026",
    slug: "mp-police-constable-driver-2026",
    name: { hi: "पुलिस आरक्षक (चालक) भर्ती परीक्षा 2026", en: "MP Police Constable (Driver) Recruitment Test 2026" },
    shortName: "Constable Driver 2026",
    organization: "MPESB",
    category: "police",
    examType: "RECRUITMENT",
    posts: 1000,
    dates: { exam: { month: "2026-11", status: "EXPECTED", note: calNote } },
    officialUrl: ESB,
    featured: false,
    source: { label: "MPESB Exam Calendar (revised 05.08.2026)", url: ESB_CAL, checkedOn: CHECKED },
    updatedAt: CHECKED,
  },
  {
    id: "mp-panchayat-sachiv-2026",
    slug: "mp-panchayat-sachiv-2026",
    name: { hi: "पंचायत सचिव एवं रोजगार सहायक भर्ती परीक्षा 2026", en: "MP Panchayat Sachiv & Rojgar Sahayak Recruitment Test 2026" },
    shortName: "Panchayat Sachiv 2026",
    organization: "MPESB",
    category: "mpesb",
    examType: "RECRUITMENT",
    posts: 2900,
    dates: { exam: { month: "2026-11", status: "EXPECTED", note: { hi: "कैलेंडर में नवंबर/दिसंबर 2026 संभावित।", en: "Calendar lists Nov/Dec 2026 as expected." } } },
    officialUrl: ESB,
    featured: false,
    source: { label: "MPESB Exam Calendar (revised 05.08.2026)", url: ESB_CAL, checkedOn: CHECKED },
    updatedAt: CHECKED,
  },
  {
    id: "mp-group-6-sg-1-2026",
    slug: "mp-group-6-sub-group-1-2026",
    name: { hi: "समूह-6 उपसमूह-1 भर्ती परीक्षा 2026", en: "MP Group-6 Sub Group-1 Recruitment Test 2026" },
    shortName: "Group-6 SG-1 2026",
    organization: "MPESB",
    category: "mpesb",
    examType: "RECRUITMENT",
    posts: 700,
    dates: { exam: { month: "2026-12", status: "EXPECTED", note: calNote } },
    officialUrl: ESB,
    featured: false,
    source: { label: "MPESB Exam Calendar (revised 05.08.2026)", url: ESB_CAL, checkedOn: CHECKED },
    updatedAt: CHECKED,
  },
  {
    id: "mphc-assistant-grade-3-2026",
    slug: "mp-high-court-assistant-grade-3-2026",
    name: {
      hi: "म.प्र. हाई कोर्ट — जिला न्यायालयों में सहायक ग्रेड-3 सीधी भर्ती 2026",
      en: "MP High Court — Assistant Grade-3 Direct Recruitment 2026 (District Courts)",
    },
    shortName: "High Court AG-3 2026",
    organization: "MPHC",
    category: "court",
    examType: "RECRUITMENT",
    mode: { hi: "ऑनलाइन प्रारंभिक परीक्षा", en: "Online preliminary exam" },
    posts: 1174,
    description: {
      hi: "मध्यप्रदेश राज्य के जिला एवं सत्र न्यायालयों की स्थापनाओं पर सहायक ग्रेड-III के रिक्त पदों की सीधी भर्ती (विज्ञापन क्रमांक 614/परीक्षा/2026, दिनांक 14.08.2026)।",
      en: "Direct recruitment to Assistant Grade-III posts in District & Sessions Court establishments of Madhya Pradesh (Advt. No. 614/Exam/2026 dated 14.08.2026).",
    },
    dates: {
      applicationStart: { date: "2026-08-17", status: "CONFIRMED" },
      applicationEnd: {
        date: "2026-09-30",
        status: "CONFIRMED",
        note: { hi: "शाम 5 बजे तक। अंतिम तिथि बढ़ाई गई (पूर्व में 15.09.2026)।", en: "Till 5 PM. Last date extended (earlier 15.09.2026)." },
      },
      correctionEnd: {
        date: "2026-10-08",
        status: "CONFIRMED",
        note: { hi: "त्रुटि सुधार: 06.10.2026 दोपहर 12 बजे से 08.10.2026 शाम 5 बजे तक।", en: "Corrections: 06.10.2026 12 PM to 08.10.2026 5 PM." },
      },
      exam: {
        status: "TBA",
        note: { hi: "ऑनलाइन प्रारंभिक परीक्षा की तिथि बाद में अधिसूचित की जाएगी (विज्ञापन के अनुसार)।", en: "Online preliminary exam date will be notified later (per the advertisement)." },
      },
    },
    details: {
      selectionProcess: {
        hi: "चरण 1: ऑनलाइन प्रारंभिक परीक्षा (केवल छँटनी हेतु; अंक अंतिम परिणाम में नहीं जुड़ते)। प्रत्येक श्रेणी में प्रति पद लगभग 5 अभ्यर्थी (1:5) चरण 2 के लिए चयनित होंगे। चरण 2: हिंदी टाइपिंग कौशल परीक्षा (50 अंक)।",
        en: "Stage 1: Online preliminary exam (screening only; marks not counted in the final result). About 5 candidates per post in each category (1:5) go to Stage 2. Stage 2: Hindi typing skill test (50 marks).",
      },
      pattern: {
        hi: "प्रारंभिक परीक्षा: 100 बहुविकल्पीय प्रश्न, 100 अंक, 120 मिनट — सामान्य ज्ञान + सामान्य अध्ययन (म.प्र. सहित) 20, गणित + तार्किक क्षमता 20, सामान्य हिंदी 20, अंग्रेज़ी ज्ञान 20, कंप्यूटर ज्ञान 20। टाइपिंग परीक्षा: लगभग 350 शब्द, 10 मिनट, रेमिंगटन गेल कीबोर्ड।",
        en: "Prelims: 100 MCQs, 100 marks, 120 minutes — G.K. + G.S. (incl. M.P.) 20, Maths + Logical Reasoning 20, General Hindi 20, English 20, Computer 20. Typing test: about 350 words, 10 minutes, Remington Gail keyboard.",
      },
    },
    officialUrl: "https://mphc.gov.in/",
    notificationUrl: "https://mphc.gov.in/storage/PDF/web_pdf/ME/Notification%20AG-III%20date%20extension%2015.09.2026.pdf",
    rulebookUrl: "https://mphc.gov.in/storage/PDF/web_pdf/ME/Advertisement%20AG-III%20District%20Court-2026.pdf",
    featured: true,
    popular: true,
    source: {
      label: "MP High Court — Advertisement (14.08.2026) & date-extension notice (15.09.2026)",
      url: "https://mphc.gov.in/storage/PDF/web_pdf/ME/Advertisement%20AG-III%20District%20Court-2026.pdf",
      checkedOn: "2026-10-01",
    },
    testSeries: {
      href: "/mp-high-court-assistant-grade-3-mock-tests/",
      title: { hi: "हाई कोर्ट सहायक ग्रेड-III — 25 फुल मॉक टेस्ट", en: "High Court Assistant Grade-III — 25 full mock tests" },
      sub: { hi: "आधिकारिक पैटर्न: 100 प्रश्न · 120 मिनट · 5 खंड · टेस्ट 1 फ्री, बाकी 24 टेस्ट ₹199 में", en: "Official pattern: 100 Qs · 120 min · 5 sections · Test 1 free, other 24 for ₹199" },
      cta: { hi: "टेस्ट देखें", en: "View tests" },
    },
    updatedAt: "2026-10-01",
  },
  {
    id: "mppsc-state-service-2026",
    slug: "mppsc-state-service-2026",
    name: { hi: "राज्य सेवा परीक्षा 2026 (MPPSC)", en: "MPPSC State Service Examination 2026" },
    shortName: "MPPSC SSE 2026",
    organization: "MPPSC",
    category: "mppsc",
    examType: "STATE_SERVICE",
    description: {
      hi: "प्रारंभिक परीक्षा 26 अप्रैल 2026 को निर्धारित तिथि पर सम्पन्न। मुख्य परीक्षा की तिथि प्रस्तावित कैलेंडर के अनुसार।",
      en: "Preliminary exam held as scheduled on 26 April 2026. Main exam date is per the proposed calendar.",
    },
    dates: {
      exam: {
        date: "2026-09-07",
        endDate: "2026-09-12",
        status: "TENTATIVE",
        note: {
          hi: "मुख्य परीक्षा — प्रस्तावित (संशोधित) परीक्षा कार्यक्रम दिनांक 15.05.2026 के अनुसार।",
          en: "Main exam — per the proposed (revised) exam calendar dated 15.05.2026.",
        },
      },
    },
    officialUrl: PSC,
    featured: true,
    popular: true,
    source: { label: "MPPSC Proposed Exam Calendar 2026 (15.05.2026)", url: PSC_CAL, checkedOn: CHECKED },
    updatedAt: CHECKED,
  },
  {
    id: "mppsc-state-forest-service-2026",
    slug: "mppsc-state-forest-service-2026",
    name: { hi: "राज्य वन सेवा परीक्षा 2026 (MPPSC)", en: "MPPSC State Forest Service Examination 2026" },
    shortName: "MPPSC SFS 2026",
    organization: "MPPSC",
    category: "mppsc",
    examType: "STATE_SERVICE",
    description: {
      hi: "प्रारंभिक परीक्षा 26 अप्रैल 2026 को सम्पन्न। मुख्य परीक्षा की प्रावधिक उत्तर कुंजी 29.09.2026 को जारी।",
      en: "Preliminary held on 26 April 2026. Provisional answer key for the Main exam released on 29.09.2026.",
    },
    dates: {
      exam: { date: "2026-09-27", status: "COMPLETED", note: { hi: "मुख्य परीक्षा", en: "Main exam" } },
      answerKey: { date: "2026-09-29", status: "CONFIRMED", note: { hi: "प्रावधिक उत्तर कुंजी", en: "Provisional answer key" } },
    },
    officialUrl: PSC,
    notificationUrl: "https://mppsc.mp.gov.in/uploads/files/Provisional_Answer_Key_SFS_Main_Exam_2026_Dated_29_09_2026.pdf",
    featured: false,
    popular: true,
    source: { label: "MPPSC website — Provisional Answer Key (29.09.2026)", url: PSC, checkedOn: CHECKED },
    updatedAt: CHECKED,
  },
];
