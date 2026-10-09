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
    price: 199,
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
      hi: "टेस्ट 1 फ्री है। बाकी 24 टेस्ट एक बार ₹199 देकर अनलॉक करें — इसी डिवाइस पर तुरंत खुल जाएंगे।",
      en: "Test 1 is free. Unlock the other 24 tests once for ₹199 — they open instantly on this device.",
    },
    unlockBtn: { hi: "सभी टेस्ट अनलॉक करें — ₹199", en: "Unlock all tests — ₹199" },
    links: [
      { href: "/exams/mp-high-court-assistant-grade-3-2026/", label: { hi: "परीक्षा की पूरी जानकारी →", en: "Full exam details →" }, tone: "brand" },
    ],
  },
  pcgd: {
    id: "pcgd",
    total: 25,
    free: [1],
    product: "pcgd-tests",
    price: 199,
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
      hi: "टेस्ट 1 फ्री है। बाकी 24 टेस्ट एक बार ₹199 देकर अनलॉक करें — इसी डिवाइस पर तुरंत खुल जाएंगे।",
      en: "Test 1 is free. Unlock the other 24 tests once for ₹199 — they open instantly on this device.",
    },
    unlockBtn: { hi: "सभी टेस्ट अनलॉक करें — ₹199", en: "Unlock all tests — ₹199" },
    links: [{ href: "/exams/mp-police-constable-2026/", label: { hi: "परीक्षा की पूरी जानकारी →", en: "Full exam details →" }, tone: "brand" }],
  },
  asi: {
    id: "asi",
    total: 25,
    free: [1],
    product: "asi-tests",
    price: 199,
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
      hi: "टेस्ट 1 फ्री है। बाकी 24 टेस्ट एक बार ₹199 देकर अनलॉक करें — इसी डिवाइस पर तुरंत खुल जाएंगे।",
      en: "Test 1 is free. Unlock the other 24 tests once for ₹199 — they open instantly on this device.",
    },
    unlockBtn: { hi: "सभी टेस्ट अनलॉक करें — ₹199", en: "Unlock all tests — ₹199" },
    links: [{ href: "/exams/mp-subedar-steno-asi-2026/", label: { hi: "परीक्षा की पूरी जानकारी →", en: "Full exam details →" }, tone: "brand" }],
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
