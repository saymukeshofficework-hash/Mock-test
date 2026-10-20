/** Full-length mock test series. Engine per series: public/mock-tests/<id>/test.html.
 *  Free tests are public (public/mock-tests/<id>/tests/NN.json).
 *  Paid tests live in the private Supabase bucket "tests" at <id>/NN.json and are served by the
 *  notes-checkout function only for a paid token of that series' product. */
type Bi = { hi: string; en: string };
export type MockSeries = {
  id: string;
  total: number;
  /** Free tests whose public JSON is published. */
  free: number[];
  product: string;
  price: number;
  enginePath: string;
  scorePrefix: string;
  listPath: string;
  title: Bi;
  sub: Bi;
  rows: { hi: string[][]; en: string[][] };
  totalLine: Bi;
  neg: Bi;
  unlockTitle: Bi;
  unlockSub: Bi;
  unlockBtn: Bi;
  links: { href: string; label: Bi; tone: "brand" | "accent" }[];
  /** Per-test meta line, e.g. "100 Qs · 120 min" (default is the police pattern). */
  meta?: Bi;
  /** Series whose tests live on the main site: start link for test n (path from the site root, not under /examhelp). */
  testHref?: (n: number) => string;
  /** Series sold on the main site: unlock link used instead of the in-page payment button (site-root path). */
  unlockHref?: string;
  /** Every test opens from the list; access is enforced by the engine page (free test, or login + purchase). */
  openAll?: boolean;
};

const POLICE_ROWS = {
  hi: [
    ["सामान्य ज्ञान एवं तार्किक ज्ञान", "40", "हिंदी/English"],
    ["बौद्धिक क्षमता एवं मानसिक अभिरुचि", "30", "हिंदी/English"],
    ["विज्ञान एवं सरल अंकगणित", "30", "हिंदी/English"],
  ],
  en: [
    ["General Knowledge & Logical Knowledge", "40", "Hindi/English"],
    ["Intellectual Ability & Mental Aptitude", "30", "Hindi/English"],
    ["Science & Simple Arithmetic", "30", "Hindi/English"],
  ],
};
const POLICE_TOTAL: Bi = { hi: "कुल 100 प्रश्न · 100 अंक · 120 मिनट · प्रत्येक प्रश्न 1 अंक", en: "Total 100 questions · 100 marks · 120 minutes · 1 mark each" };
const POLICE_NEG: Bi = { hi: "MPESB नियम पुस्तिका 2026 के अनुसार ऋणात्मक अंकन नहीं है।", en: "As per the MPESB rule book 2026, there is no negative marking." };

export const MOCK_SERIES: Record<string, MockSeries> = {
  ag3: {
    id: "ag3",
    total: 25,
    free: [1],
    product: "ag3-tests",
    price: 99,
    enginePath: "/mock-tests/ag3/test.html",
    scorePrefix: "testhub_ag3_mock_",
    listPath: "/mp-high-court-assistant-grade-3-mock-tests",
    title: { hi: "MP हाई कोर्ट सहायक ग्रेड-III — 25 फुल मॉक टेस्ट", en: "MP High Court Assistant Grade-III — 25 Full Mock Tests" },
    sub: {
      hi: "आधिकारिक पैटर्न (विज्ञापन 614/परीक्षा/2026) पर: 100 प्रश्न, 120 मिनट, 5 खंड। हर प्रश्न हिंदी/English में, व्याख्या सहित।",
      en: "On the official pattern (advt. 614/Exam/2026): 100 questions, 120 minutes, 5 sections. Every question in Hindi/English with an explanation.",
    },
    rows: {
      hi: [
        ["सामान्य ज्ञान + सामान्य अध्ययन (म.प्र. सहित)", "20", "हिंदी/English"],
        ["गणित + तार्किक क्षमता", "20", "हिंदी/English"],
        ["सामान्य हिंदी", "20", "हिंदी"],
        ["अंग्रेज़ी ज्ञान", "20", "English"],
        ["कंप्यूटर ज्ञान", "20", "English"],
      ],
      en: [
        ["GK + GS (incl. M.P.)", "20", "Hindi/English"],
        ["Maths + Logical Reasoning", "20", "Hindi/English"],
        ["General Hindi", "20", "Hindi"],
        ["English", "20", "English"],
        ["Computer Knowledge", "20", "English"],
      ],
    },
    totalLine: { hi: "कुल 100 प्रश्न · 100 अंक · 120 मिनट · प्रत्येक प्रश्न 1 अंक", en: "Total 100 questions · 100 marks · 120 minutes · 1 mark each" },
    neg: {
      hi: "आधिकारिक विज्ञापन में ऋणात्मक अंकन का उल्लेख नहीं है, इसलिए इन टेस्ट में अंक नहीं कटते।",
      en: "The official advertisement does not mention negative marking, so none is applied in these tests.",
    },
    unlockTitle: { hi: "पूरी टेस्ट सीरीज़ — 25 फुल मॉक टेस्ट", en: "Full test series — 25 full mock tests" },
    unlockSub: {
      hi: "टेस्ट 1 फ्री है। बाकी 24 टेस्ट एक बार ₹99 देकर अनलॉक करें — इसी डिवाइस पर तुरंत खुल जाएंगे।",
      en: "Test 1 is free. Unlock the other 24 tests once for ₹99 — they open instantly on this device.",
    },
    unlockBtn: { hi: "सभी टेस्ट अनलॉक करें", en: "Unlock all tests" },
    links: [
      { href: "/exams/mp-high-court-assistant-grade-3-2026/", label: { hi: "परीक्षा की पूरी जानकारी →", en: "Full exam details →" }, tone: "brand" },
    ],
  },
  pcgd: {
    id: "pcgd",
    total: 25,
    free: [1],
    product: "pcgd-tests",
    price: 99,
    enginePath: "/mock-tests/pcgd/test.html",
    scorePrefix: "testhub_pcgd_mock_",
    listPath: "/mp-police-constable-gd-mock-tests",
    title: { hi: "MP पुलिस आरक्षक (जी.डी.) 2026 — 25 फुल मॉक टेस्ट", en: "MP Police Constable (GD) 2026 — 25 Full Mock Tests" },
    sub: {
      hi: "MPESB नियम पुस्तिका 2026 के पैटर्न पर: 100 प्रश्न, 120 मिनट, 3 खंड। हर प्रश्न हिंदी/English में, व्याख्या सहित। किसी भी टेस्ट में प्रश्न दोहराए नहीं गए।",
      en: "On the MPESB rule book 2026 pattern: 100 questions, 120 minutes, 3 sections. Every question in Hindi/English with an explanation. No question repeats across tests.",
    },
    rows: POLICE_ROWS,
    totalLine: POLICE_TOTAL,
    neg: POLICE_NEG,
    unlockTitle: { hi: "पूरी टेस्ट सीरीज़ — 25 फुल मॉक टेस्ट", en: "Full test series — 25 full mock tests" },
    unlockSub: {
      hi: "टेस्ट 1 फ्री है। बाकी 24 टेस्ट एक बार ₹99 देकर अनलॉक करें — इसी डिवाइस पर तुरंत खुल जाएंगे।",
      en: "Test 1 is free. Unlock the other 24 tests once for ₹99 — they open instantly on this device.",
    },
    unlockBtn: { hi: "सभी टेस्ट अनलॉक करें", en: "Unlock all tests" },
    links: [{ href: "/exams/mp-police-constable-2026/", label: { hi: "परीक्षा की पूरी जानकारी →", en: "Full exam details →" }, tone: "brand" }],
  },
  pcdr: {
    id: "pcdr",
    total: 25,
    free: [1],
    product: "pcdr-tests",
    price: 99,
    enginePath: "/mock-tests/pcdr/test.html",
    scorePrefix: "testhub_pcdr_mock_",
    listPath: "/mp-police-driver-mock-tests",
    title: { hi: "MP पुलिस आरक्षक (चालक) 2026 — 25 फुल मॉक टेस्ट", en: "MP Police Constable (Driver) 2026 — 25 Full Mock Tests" },
    sub: {
      hi: "MPESB PCRT चालक नियम पुस्तिका 2026 के पैटर्न पर: 100 प्रश्न, 120 मिनट, 3 खंड, ऋणात्मक अंकन नहीं। मोटर वाहन अधिनियम, सड़क संकेत, सुरक्षित ड्राइविंग और वाहन यांत्रिकी सहित। हर प्रश्न व्याख्या सहित (प्रश्न हिंदी में)।",
      en: "On the MPESB PCRT Driver rule book 2026 pattern: 100 questions, 120 minutes, 3 sections, no negative marking. Includes the Motor Vehicles Act, road signs, safe driving and vehicle mechanics. Every question has an explanation (questions are in Hindi).",
    },
    rows: {
      hi: POLICE_ROWS.hi.map((r) => [r[0], r[1], "हिंदी"]),
      en: POLICE_ROWS.en.map((r) => [r[0], r[1], "Hindi"]),
    },
    totalLine: POLICE_TOTAL,
    neg: POLICE_NEG,
    unlockTitle: { hi: "पूरी टेस्ट सीरीज़ — 25 फुल मॉक टेस्ट", en: "Full test series — 25 full mock tests" },
    unlockSub: {
      hi: "टेस्ट 1 फ्री है। बाकी 24 टेस्ट एक बार ₹99 देकर अनलॉक करें — इसी डिवाइस पर तुरंत खुल जाएंगे।",
      en: "Test 1 is free. Unlock the other 24 tests once for ₹99 — they open instantly on this device.",
    },
    unlockBtn: { hi: "सभी टेस्ट अनलॉक करें", en: "Unlock all tests" },
    links: [{ href: "/exams/mp-police-constable-driver-2026/", label: { hi: "परीक्षा की पूरी जानकारी →", en: "Full exam details →" }, tone: "brand" }],
  },
  mpsi: {
    id: "mpsi",
    total: 25,
    free: [1],
    product: "mpsi-tests",
    price: 99,
    enginePath: "/mock-tests/mpsi/test.html",
    scorePrefix: "testhub_mpsi_mock_",
    listPath: "/mp-police-si-mock-tests",
    title: { hi: "MP पुलिस SI / सूबेदार 2026 — 25 फुल मॉक टेस्ट", en: "MP Police SI / Subedar 2026 — 25 Full Mock Tests" },
    sub: {
      hi: "MPESB SI/सूबेदार 2026 पाठ्यक्रम पर: 15 प्रारंभिक + 10 मुख्य परीक्षा टेस्ट, हर टेस्ट 100 प्रश्न, 120 मिनट। हर प्रश्न हिंदी/English में, व्याख्या सहित। दोहराए गए प्रश्न हटाए गए हैं।",
      en: "On the MPESB SI/Subedar 2026 syllabus: 15 prelims + 10 mains tests, 100 questions and 120 minutes each. Every question in Hindi/English with an explanation. Repeated questions have been removed.",
    },
    rows: {
      hi: [
        ["प्रारंभिक (टेस्ट 1–15): हिंदी, अंग्रेज़ी, विश्लेषण, इतिहास, भूगोल, विज्ञान, संविधान, कंप्यूटर, तर्कशक्ति, समसामयिकी", "100", "हिंदी/English"],
        ["मुख्य प्रश्नपत्र-I (टेस्ट 16–20): इतिहास, भारतीय समाज, शासन, संविधान, BNS/BNSS/BSA", "100", "हिंदी/English"],
        ["मुख्य प्रश्नपत्र-II (टेस्ट 21–25): समसामयिकी, विज्ञान-प्रौद्योगिकी, अर्थव्यवस्था, पर्यावरण, तर्कशक्ति, गणित", "100", "हिंदी/English"],
      ],
      en: [
        ["Prelims (Tests 1–15): Hindi, English, Analytical, History, Geography, Science, Polity, Computer, Reasoning, Current Affairs", "100", "Hindi/English"],
        ["Mains Paper I (Tests 16–20): History, Indian Society, Governance, Constitution, BNS/BNSS/BSA", "100", "Hindi/English"],
        ["Mains Paper II (Tests 21–25): Current Affairs, Science-Tech, Economy, Environment, Reasoning, Maths", "100", "Hindi/English"],
      ],
    },
    totalLine: { hi: "हर टेस्ट 100 प्रश्न · 120 मिनट · प्रारंभिक 100 अंक, मुख्य 300 अंक", en: "Each test 100 questions · 120 minutes · Prelims 100 marks, Mains 300 marks" },
    neg: { hi: "प्रारंभिक टेस्ट: प्रत्येक प्रश्न 1 अंक, ऋणात्मक अंकन नहीं। मुख्य टेस्ट: सही +3, गलत −1।", en: "Prelims tests: 1 mark each, no negative marking. Mains tests: +3 correct, −1 wrong." },
    unlockTitle: { hi: "पूरी टेस्ट सीरीज़ — 25 फुल मॉक टेस्ट", en: "Full test series — 25 full mock tests" },
    unlockSub: {
      hi: "टेस्ट 1 फ्री है। बाकी 24 टेस्ट एक बार ₹99 देकर अनलॉक करें — इसी डिवाइस पर तुरंत खुल जाएंगे।",
      en: "Test 1 is free. Unlock the other 24 tests once for ₹99 — they open instantly on this device.",
    },
    unlockBtn: { hi: "सभी टेस्ट अनलॉक करें", en: "Unlock all tests" },
    links: [{ href: "/exams/mp-subedar-si-2026/", label: { hi: "परीक्षा की पूरी जानकारी →", en: "Full exam details →" }, tone: "brand" }],
  },
  tet: {
    id: "tet",
    total: 25,
    free: [1],
    product: "tet-tests",
    price: 99,
    enginePath: "",
    scorePrefix: "testhub_tet_mock_",
    listPath: "/tet-mock-tests",
    meta: { hi: "150 प्रश्न · 150 मिनट", en: "150 Qs · 150 min" },
    testHref: (n) => `/tet-mock-test-${n}.html`,
    unlockHref: "/tests.html",
    title: { hi: "MP TET 2026 — 25 फुल मॉक टेस्ट", en: "MP TET 2026 — 25 Full Mock Tests" },
    sub: {
      hi: "हर टेस्ट में 150 प्रश्न, 150 मिनट, 5 खंड। हर प्रश्न हिंदी/English में। टेस्ट 1 फ्री, बाकी 24 टेस्ट ₹99 में।",
      en: "150 questions, 150 minutes and 5 sections in every test. Every question in Hindi/English. Test 1 is free, the other 24 tests are ₹99.",
    },
    rows: {
      hi: [
        ["बाल विकास एवं शिक्षाशास्त्र", "30", "हिंदी/English"],
        ["भाषा-1 (English)", "30", "English"],
        ["भाषा-2 (हिंदी)", "30", "हिंदी"],
        ["गणित", "30", "हिंदी/English"],
        ["पर्यावरण अध्ययन", "30", "हिंदी/English"],
      ],
      en: [
        ["Child Development & Pedagogy", "30", "Hindi/English"],
        ["Language-1 (English)", "30", "English"],
        ["Language-2 (Hindi)", "30", "Hindi"],
        ["Mathematics", "30", "Hindi/English"],
        ["Environmental Studies", "30", "Hindi/English"],
      ],
    },
    totalLine: { hi: "कुल 150 प्रश्न · 150 अंक · 150 मिनट · प्रत्येक प्रश्न 1 अंक", en: "Total 150 questions · 150 marks · 150 minutes · 1 mark each" },
    neg: { hi: "ऋणात्मक अंकन नहीं है।", en: "There is no negative marking." },
    unlockTitle: { hi: "पूरी टेस्ट सीरीज़ — 25 फुल मॉक टेस्ट", en: "Full test series — 25 full mock tests" },
    unlockSub: {
      hi: "टेस्ट 1 फ्री है। बाकी 24 टेस्ट एक बार ₹99 देकर अनलॉक करें।",
      en: "Test 1 is free. Unlock the other 24 tests once for ₹99.",
    },
    unlockBtn: { hi: "सभी टेस्ट अनलॉक करें", en: "Unlock all tests" },
    links: [],
  },
  asi: {
    id: "asi",
    total: 25,
    free: [1],
    product: "asi-tests",
    price: 99,
    enginePath: "/mock-tests/asi/test.html",
    scorePrefix: "testhub_asi_mock_",
    listPath: "/mp-police-subedar-asi-mock-tests",
    title: { hi: "MP पुलिस सूबेदार (शीघ्रलेखक) / ASI 2026 — 25 फुल मॉक टेस्ट", en: "MP Police Subedar (Steno) / ASI 2026 — 25 Full Mock Tests" },
    sub: {
      hi: "MPESB नियम पुस्तिका 2026 के पैटर्न पर: 100 प्रश्न, 120 मिनट, 3 खंड, 12वीं स्तर। हर प्रश्न हिंदी/English में, व्याख्या सहित। किसी भी टेस्ट में प्रश्न दोहराए नहीं गए।",
      en: "On the MPESB rule book 2026 pattern: 100 questions, 120 minutes, 3 sections, Class 12 level. Every question in Hindi/English with an explanation. No question repeats across tests.",
    },
    rows: POLICE_ROWS,
    totalLine: POLICE_TOTAL,
    neg: POLICE_NEG,
    unlockTitle: { hi: "पूरी टेस्ट सीरीज़ — 25 फुल मॉक टेस्ट", en: "Full test series — 25 full mock tests" },
    unlockSub: {
      hi: "टेस्ट 1 फ्री है। बाकी 24 टेस्ट एक बार ₹99 देकर अनलॉक करें — इसी डिवाइस पर तुरंत खुल जाएंगे।",
      en: "Test 1 is free. Unlock the other 24 tests once for ₹99 — they open instantly on this device.",
    },
    unlockBtn: { hi: "सभी टेस्ट अनलॉक करें", en: "Unlock all tests" },
    links: [{ href: "/exams/mp-subedar-steno-asi-2026/", label: { hi: "परीक्षा की पूरी जानकारी →", en: "Full exam details →" }, tone: "brand" }],
  },
  mpgrb: {
    id: "mpgrb",
    total: 25,
    free: [1],
    product: "mpgrb-tests",
    price: 99,
    enginePath: "",
    scorePrefix: "testhub_mpgrb_mock_",
    listPath: "/mp-grameen-bank-mock-tests",
    meta: { hi: "80 प्रश्न · 45 मिनट", en: "80 Qs · 45 min" },
    testHref: (n) => `/examhelp/mock-tests/mpgrb/test.html?t=${String(n).padStart(2, "0")}&lang=hi`,
    title: { hi: "मध्य प्रदेश ग्रामीण बैंक — 25 मॉक टेस्ट", en: "Madhya Pradesh Gramin Bank — 25 Mock Tests" },
    sub: {
      hi: "केवल IBPS RRB प्रारंभिक परीक्षा के अभ्यास पैटर्न पर आधारित।",
      en: "Based only on the IBPS RRB preliminary exam practice pattern.",
    },
    rows: {
      hi: [
        ["रीजनिंग / तार्किक क्षमता", "40", "हिंदी/English"],
        ["संख्यात्मक योग्यता", "40", "हिंदी/English"],
      ],
      en: [
        ["Reasoning Ability", "40", "Hindi/English"],
        ["Numerical Ability", "40", "Hindi/English"],
      ],
    },
    totalLine: { hi: "कुल 80 प्रश्न · 80 अंक · 45 मिनट", en: "Total 80 questions · 80 marks · 45 minutes" },
    neg: { hi: "प्रत्येक गलत उत्तर पर ¼ अंक कटेगा; छोड़े गए प्रश्न पर अंक नहीं कटेंगे।", en: "¼ mark is deducted for each wrong answer; unattempted questions carry no penalty." },
    unlockTitle: { hi: "टेस्ट 2–25 अनलॉक करें", en: "Unlock Tests 2–25" },
    unlockSub: { hi: "पहला टेस्ट फ्री है। बाकी 24 टेस्ट एक बार ₹99 देकर अनलॉक करें।", en: "Test 1 is free. Unlock the other 24 tests with a one-time ₹99 payment." },
    unlockBtn: { hi: "अभी भुगतान करें", en: "Pay Now" },
    links: [],
  },
  rrbg: {
    id: "rrbg",
    total: 25,
    free: [1],
    product: "rrbg-tests",
    price: 85,
    enginePath: "",
    scorePrefix: "testhub_rrbg_mock_",
    listPath: "/rrb-ntpc-graduate-mock-tests",
    meta: { hi: "100 प्रश्न · 90 मिनट", en: "100 Qs · 90 min" },
    testHref: (n) => `/rrb-ntpc/?test=rrbntpc-g-full-${String(n).padStart(2, "0")}`,

    title: { hi: "RRB NTPC ग्रेजुएट लेवल (CEN 06/2025) — 25 फुल CBT-1 मॉक टेस्ट", en: "RRB NTPC Graduate Level (CEN 06/2025) — 25 Full CBT-1 Mock Tests" },
    sub: {
      hi: "CBT-1 पैटर्न पर: 100 प्रश्न, 90 मिनट, 3 खंड। टेस्ट 1 फ्री है; टेस्ट 2–25 फिलहाल लॉक हैं। टेस्ट खोलने के लिए लॉगिन की जरूरत नहीं।",
      en: "CBT-1 pattern: 100 questions, 90 minutes, 3 sections. Test 1 is free; tests 2–25 are locked for now. No login is required to view the test list.",
    },
    rows: {
      hi: [
        ["सामान्य जागरूकता", "40", "English"],
        ["गणित", "30", "English"],
        ["सामान्य बुद्धिमत्ता एवं तर्कशक्ति", "30", "English"],
      ],
      en: [
        ["General Awareness", "40", "English"],
        ["Mathematics", "30", "English"],
        ["General Intelligence & Reasoning", "30", "English"],
      ],
    },
    totalLine: { hi: "कुल 100 प्रश्न · 100 अंक · 90 मिनट · प्रत्येक प्रश्न 1 अंक", en: "Total 100 questions · 100 marks · 90 minutes · 1 mark each" },
    neg: { hi: "प्रत्येक गलत उत्तर पर ⅓ अंक कटेगा; छोड़े गए प्रश्न पर कोई कटौती नहीं।", en: "⅓ mark is deducted for each wrong answer; no deduction for unattempted questions." },
    unlockTitle: { hi: "टेस्ट 2–25 अनलॉक करें", en: "Unlock Tests 2–25" },
    unlockSub: {
      hi: "टेस्ट 1 फ्री है। टेस्ट 2–25 खोलने के लिए एक बार ₹85 का भुगतान करें।",
      en: "Test 1 is free. Pay ₹85 once to unlock Tests 2–25.",
    },
    unlockBtn: { hi: "अभी भुगतान करें", en: "Pay Now" },
    links: [],
  },
  rrbu: {
    id: "rrbu",
    total: 25,
    free: [1],
    product: "rrbu-tests",
    price: 85,
    enginePath: "",
    scorePrefix: "testhub_rrbu_mock_",
    listPath: "/rrb-ntpc-undergraduate-mock-tests",
    meta: { hi: "100 प्रश्न · 90 मिनट", en: "100 Qs · 90 min" },
    testHref: (n) => `/rrb-ntpc/?test=rrbntpc-u-full-${String(n).padStart(2, "0")}`,
    title: { hi: "RRB NTPC अंडरग्रेजुएट 10+2 (CEN 07/2025) — 25 फुल CBT-1 मॉक टेस्ट", en: "RRB NTPC Undergraduate 10+2 (CEN 07/2025) — 25 Full CBT-1 Mock Tests" },
    sub: {
      hi: "CBT-1 पैटर्न पर: 100 प्रश्न, 90 मिनट, 3 खंड। टेस्ट 1 फ्री है; टेस्ट 2–25 ₹85 में अनलॉक करें।",
      en: "On the CBT-1 pattern: 100 questions, 90 minutes, 3 sections. Test 1 is free; unlock tests 2–25 for ₹85.",
    },
    rows: {
      hi: [
        ["सामान्य जागरूकता", "40", "English"],
        ["गणित", "30", "English"],
        ["सामान्य बुद्धिमत्ता एवं तर्कशक्ति", "30", "English"],
      ],
      en: [
        ["General Awareness", "40", "English"],
        ["Mathematics", "30", "English"],
        ["General Intelligence & Reasoning", "30", "English"],
      ],
    },
    totalLine: { hi: "कुल 100 प्रश्न · 100 अंक · 90 मिनट · प्रत्येक प्रश्न 1 अंक", en: "Total 100 questions · 100 marks · 90 minutes · 1 mark each" },
    neg: { hi: "प्रत्येक गलत उत्तर पर ⅓ अंक कटेगा; छोड़े गए प्रश्न पर कोई कटौती नहीं।", en: "⅓ mark is deducted for each wrong answer; no deduction for unattempted questions." },
    unlockTitle: { hi: "टेस्ट 2–25 अनलॉक करें", en: "Unlock Tests 2–25" },
    unlockSub: {
      hi: "टेस्ट 1 फ्री है। टेस्ट 2–25 खोलने के लिए एक बार ₹85 का भुगतान करें।",
      en: "Test 1 is free. Pay ₹85 once to unlock Tests 2–25.",
    },
    unlockBtn: { hi: "अभी भुगतान करें", en: "Pay Now" },
    links: [],
  },
};

/** Back-compat for the AG-3 landing page. */
export const AG3_MOCK = {
  total: MOCK_SERIES.ag3.total,
  free: MOCK_SERIES.ag3.free,
  product: MOCK_SERIES.ag3.product,
  price: MOCK_SERIES.ag3.price,
  enginePath: MOCK_SERIES.ag3.enginePath,
};
