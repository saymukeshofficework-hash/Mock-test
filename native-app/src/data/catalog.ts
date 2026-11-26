import type { Bi } from "@/lib/i18n";

/**
 * Test-series catalogue. Only metadata lives in the app; questions and answer keys are always
 * fetched from the server for an authorised user and are never bundled. The list mirrors what
 * the backend actually holds (main project test_content rows, exam-hub "tests" bucket folders).
 */
export type Category = "teaching" | "police" | "railway" | "ssc" | "mp" | "other";

export type Scoring =
  | { kind: "rpc" } // server score_test_attempt score as-is (TET, STET, CPCT, CTET CDP)
  | { kind: "rpcNeg3" } // server counts, score = correct − wrong/3 (RRB NTPC page)
  | { kind: "marks"; c: number; w: number; useJson: boolean }; // client scoring, same as examhelp engine

export type Series = {
  id: string;
  source: "main" | "hub";
  title: Bi;
  category: Category;
  examIds: string[]; // ids in exams.json this series belongs to
  count: number;
  questions: number;
  minutes: number;
  /** main: test id for number n */
  mainId?: (n: number) => string;
  /** hub: storage folder, product and series param for notes-checkout */
  folder?: string;
  product?: string;
  seriesParam?: boolean;
  scoring: Scoring;
};

const pad = (n: number) => String(n).padStart(2, "0");
const RPC: Scoring = { kind: "rpc" };
const M1: Scoring = { kind: "marks", c: 1, w: 0, useJson: false };
const MJ: Scoring = { kind: "marks", c: 1, w: 0, useJson: true };

function main(id: string, prefix: string, title: Bi, category: Category, examIds: string[], count: number, questions: number, minutes: number, scoring: Scoring = RPC): Series {
  return { id, source: "main", title, category, examIds, count, questions, minutes, mainId: (n) => (prefix === "test" ? `test${pad(n)}` : `${prefix}-${pad(n)}`), scoring };
}
function hub(folder: string, product: string, title: Bi, category: Category, examIds: string[], minutes: number, scoring: Scoring, count = 25, questions = 100, seriesParam = false): Series {
  return { id: `hub-${folder}`, source: "hub", folder, product, seriesParam, title, category, examIds, count, questions, minutes, scoring };
}

export const SERIES: Series[] = [
  main("tetp-hindi", "test", { hi: "MP TET प्राथमिक (हिंदी) — फुल टेस्ट", en: "MP TET Primary (Hindi) — Full Tests" }, "teaching", ["mp-teacher-eligibility-test-2026"], 20, 150, 150),
  main("tetp-english", "tetp-english", { hi: "MP TET प्राथमिक (अंग्रेज़ी)", en: "MP TET Primary (English)" }, "teaching", ["mp-teacher-eligibility-test-2026"], 25, 150, 150),
  main("tetp-sanskrit", "tetp-sanskrit", { hi: "MP TET प्राथमिक (संस्कृत)", en: "MP TET Primary (Sanskrit)" }, "teaching", ["mp-teacher-eligibility-test-2026"], 25, 150, 150),
  main("tets-hindi", "tets-hindi", { hi: "MP STET हिंदी", en: "MP STET Hindi" }, "teaching", ["mp-teacher-eligibility-test-2026"], 25, 150, 150),
  main("tets-english", "tets-english", { hi: "MP STET अंग्रेज़ी", en: "MP STET English" }, "teaching", ["mp-teacher-eligibility-test-2026"], 25, 150, 150),
  main("tets-maths", "tets-maths", { hi: "MP STET गणित", en: "MP STET Mathematics" }, "teaching", ["mp-teacher-eligibility-test-2026"], 25, 150, 150),
  main("tets-science", "tets-science", { hi: "MP STET विज्ञान", en: "MP STET Science" }, "teaching", ["mp-teacher-eligibility-test-2026"], 25, 150, 150),
  main("tets-sst", "tets-sst", { hi: "MP STET सामाजिक विज्ञान", en: "MP STET Social Science" }, "teaching", ["mp-teacher-eligibility-test-2026"], 25, 150, 150),
  main("ctet-p1-cdp", "ctet-p1-cdp", { hi: "CTET पेपर 1 — बाल विकास व शिक्षाशास्त्र", en: "CTET Paper 1 — Child Development & Pedagogy" }, "teaching", [], 6, 30, 30),
  main("cpct-exam", "cpct-exam", { hi: "MP CPCT मॉक टेस्ट", en: "MP CPCT Mock Tests" }, "mp", ["mp-cpct-nov-2026"], 25, 75, 75),
  main("rrbntpc-g-full", "rrbntpc-g-full", { hi: "RRB NTPC ग्रेजुएट — फुल CBT-1", en: "RRB NTPC Graduate — Full CBT-1" }, "railway", [], 25, 100, 90, { kind: "rpcNeg3" }),
  main("rrbntpc-g-ga", "rrbntpc-g-ga", { hi: "RRB NTPC ग्रेजुएट — सामान्य जागरूकता", en: "RRB NTPC Graduate — General Awareness" }, "railway", [], 25, 40, 36, { kind: "rpcNeg3" }),
  main("rrbntpc-g-maths", "rrbntpc-g-maths", { hi: "RRB NTPC ग्रेजुएट — गणित", en: "RRB NTPC Graduate — Mathematics" }, "railway", [], 25, 30, 27, { kind: "rpcNeg3" }),
  main("rrbntpc-g-reason", "rrbntpc-g-reason", { hi: "RRB NTPC ग्रेजुएट — तर्कशक्ति", en: "RRB NTPC Graduate — Reasoning" }, "railway", [], 25, 30, 27, { kind: "rpcNeg3" }),
  main("rrbntpc-u-full", "rrbntpc-u-full", { hi: "RRB NTPC अंडरग्रेजुएट — फुल CBT-1", en: "RRB NTPC Undergraduate — Full CBT-1" }, "railway", [], 25, 100, 90, { kind: "rpcNeg3" }),
  main("rrbntpc-u-ga", "rrbntpc-u-ga", { hi: "RRB NTPC अंडरग्रेजुएट — सामान्य जागरूकता", en: "RRB NTPC Undergraduate — General Awareness" }, "railway", [], 25, 40, 36, { kind: "rpcNeg3" }),
  main("rrbntpc-u-maths", "rrbntpc-u-maths", { hi: "RRB NTPC अंडरग्रेजुएट — गणित", en: "RRB NTPC Undergraduate — Mathematics" }, "railway", [], 25, 30, 27, { kind: "rpcNeg3" }),
  main("rrbntpc-u-reason", "rrbntpc-u-reason", { hi: "RRB NTPC अंडरग्रेजुएट — तर्कशक्ति", en: "RRB NTPC Undergraduate — Reasoning" }, "railway", [], 25, 30, 27, { kind: "rpcNeg3" }),

  hub("ag3", "ag3-tests", { hi: "MP हाई कोर्ट सहायक ग्रेड-III", en: "MP High Court Assistant Grade-III" }, "mp", ["mphc-assistant-grade-3-2026"], 120, M1),
  hub("pcgd", "pcgd-tests", { hi: "MP पुलिस आरक्षक (जी.डी.) 2026", en: "MP Police Constable (GD) 2026" }, "police", ["mp-police-constable-gd-2026"], 120, M1),
  hub("pcdr", "pcdr-tests", { hi: "MP पुलिस आरक्षक (चालक) 2026", en: "MP Police Constable (Driver) 2026" }, "police", ["mp-police-constable-driver-2026"], 120, M1),
  hub("mpsi", "mpsi-tests", { hi: "MP पुलिस SI / सूबेदार 2026", en: "MP Police SI / Subedar 2026" }, "police", ["mp-subedar-si-2026"], 120, MJ),
  hub("asi", "asi-tests", { hi: "MP पुलिस सूबेदार (शीघ्रलेखक) / ASI", en: "MP Police Subedar (Stenographer) / ASI" }, "police", ["mp-subedar-steno-asi-2026"], 120, M1),
  hub("nt", "nt-tests", { hi: "MP नायब तहसीलदार सीमित परीक्षा", en: "MP Naib Tehsildar Limited Exam" }, "mp", ["mp-nayab-tahsildar-2026"], 240, MJ),
  hub("group4", "group4-tests", { hi: "MPESB ग्रुप-4 सहायक ग्रेड-3", en: "MPESB Group-4 Assistant Grade-3" }, "mp", [], 120, M1),
  hub("mppsc", "mppsc-tests", { hi: "MPPSC प्रारंभिक — सामान्य अध्ययन", en: "MPPSC Prelims — General Studies" }, "mp", ["mppsc-state-service-2026"], 120, MJ),
  hub("mppsc2", "mppsc2-tests", { hi: "MPPSC प्रारंभिक — सामान्य अभिरुचि (CSAT)", en: "MPPSC Prelims — General Aptitude (CSAT)" }, "mp", ["mppsc-state-service-2026"], 120, MJ),
  hub("jnv6", "jnv6-tests", { hi: "नवोदय विद्यालय (JNVST) कक्षा 6", en: "Navodaya Vidyalaya (JNVST) Class 6" }, "other", [], 120, M1, 15, 80),
  hub("rrbsm", "rrbsm-tests", { hi: "RRB स्टेशन मास्टर", en: "RRB Station Master" }, "railway", [], 120, { kind: "marks", c: 1, w: 1 / 3, useJson: false }),
  hub("sscgd", "sscgd-tests", { hi: "SSC GD कांस्टेबल", en: "SSC GD Constable" }, "ssc", [], 60, { kind: "marks", c: 2, w: 0.25, useJson: false }),
  hub("netp1", "ugcnet-tests", { hi: "UGC NET पेपर 1", en: "UGC NET Paper 1" }, "teaching", [], 60, MJ, 25, 50, true),
  hub("neteng", "ugcnet-tests", { hi: "UGC NET अंग्रेज़ी (पेपर 2)", en: "UGC NET English (Paper 2)" }, "teaching", [], 120, MJ, 25, 100, true),
  hub("uptet", "uptet-tests", { hi: "UPTET (पेपर 1 + पेपर 2)", en: "UPTET (Paper 1 + Paper 2)" }, "teaching", [], 150, MJ, 25, 150),
  hub("ctet1", "ctet-tests", { hi: "CTET पेपर 1 (कक्षा 1–5)", en: "CTET Paper 1 (Classes 1–5)" }, "teaching", [], 150, MJ, 25, 150, true),
  hub("ctet2ms", "ctet-tests", { hi: "CTET पेपर 2 गणित-विज्ञान", en: "CTET Paper 2 Maths-Science" }, "teaching", [], 150, MJ, 25, 150, true),
  hub("ctet2sst", "ctet-tests", { hi: "CTET पेपर 2 सामाजिक अध्ययन", en: "CTET Paper 2 Social Studies" }, "teaching", [], 150, MJ, 25, 150, true),
];

export const seriesById = (id: string) => SERIES.find((s) => s.id === id);

/** Stable key for one test: "<seriesId>~<n>". */
export const testKey = (seriesId: string, n: number) => `${seriesId}~${n}`;
export function parseTestKey(key: string): { series: Series; n: number } | null {
  const [id, num] = key.split("~");
  const series = id ? seriesById(id) : undefined;
  const n = Number(num);
  if (!series || !Number.isInteger(n) || n < 1 || n > series.count) return null;
  return { series, n };
}
/** Test 1 of every series is free on the website. */
export const isFreeTest = (n: number) => n === 1;
export const CATEGORIES: Category[] = ["mp", "police", "teaching", "railway", "ssc", "other"];
