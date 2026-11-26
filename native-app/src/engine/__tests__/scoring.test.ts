import { SERIES } from "@/data/catalog";
import { normalizeHub, normalizeMain } from "../normalize";
import { accuracy, fromRpc, mainPayload, scoreClient } from "../scoring";

const sscgd = SERIES.find((s) => s.id === "hub-sscgd")!;
const rrbsm = SERIES.find((s) => s.id === "hub-rrbsm")!;
const mpsi = SERIES.find((s) => s.id === "hub-mpsi")!;
const rrbg = SERIES.find((s) => s.id === "rrbntpc-g-ga")!;
const tet = SERIES.find((s) => s.id === "tetp-english")!;

const hubJson = (marks?: { c: number; w: number }) => ({
  sections: [
    { key: "gk", label: { hi: "सामान्य ज्ञान", en: "GK" } },
    { key: "m", label: { hi: "गणित", en: "Maths" } },
  ],
  questions: [
    { s: "gk", a: 0, q: { hi: "प्र1", en: "Q1" }, o: { hi: ["a", "b"], en: ["a", "b"] } },
    { s: "gk", a: 1, q: { hi: "प्र2", en: "Q2" }, o: { hi: ["a", "b"], en: ["a", "b"] } },
    { s: "m", a: 1, q: { hi: "प्र3", en: "Q3" }, o: { hi: ["a", "b"], en: ["a", "b"] } },
    { s: "m", a: 0, q: { hi: "प्र4", en: "Q4" }, o: { hi: ["a", "b"], en: ["a", "b"] } },
  ],
  marks,
});

describe("client scoring matches the website engines", () => {
  test("SSC GD: +2 correct, −0.25 wrong, skipped 0", () => {
    const t = normalizeHub("k", sscgd, 2, hubJson());
    const r = scoreClient(t, [0, 0, null, 0]); // c, w, skip, c
    expect(r.score).toBe(3.75);
    expect(r.max).toBe(8);
    expect([r.correct, r.incorrect, r.unattempted]).toEqual([2, 1, 1]);
    expect(r.sections.map((s) => [s.c, s.ic, s.un])).toEqual([[1, 1, 0], [1, 0, 1]]);
  });
  test("RRB Station Master: −1/3 per wrong", () => {
    const t = normalizeHub("k", rrbsm, 2, hubJson());
    expect(scoreClient(t, [1, 0, 0, 0]).score).toBe(0); // 3 wrong (−1), 1 correct (+1)
    expect(scoreClient(t, [0, 1, 1, 1]).score).toBe(2.67);
  });
  test("JSON marks win where the engine reads them (MP SI mains +3/−1)", () => {
    const t = normalizeHub("k", mpsi, 2, hubJson({ c: 3, w: 1 }));
    expect(scoreClient(t, [0, 0, 1, null]).score).toBe(5);
    expect(t.marks).toEqual({ c: 3, w: 1 });
  });
  test("fixed-rule engines ignore JSON marks (SSC GD)", () => {
    const t = normalizeHub("k", sscgd, 2, hubJson({ c: 9, w: 9 }));
    expect(t.marks).toEqual({ c: 2, w: 0.25 });
  });
  test("JSON minutes override the default duration", () => {
    expect(normalizeHub("k", mpsi, 2, { ...hubJson(), minutes: 45 }).minutes).toBe(45);
    expect(normalizeHub("k", mpsi, 2, hubJson()).minutes).toBe(120);
  });
});

describe("main tests (server scoring)", () => {
  const sections = [
    { name: "CDP", mode: "bilingual", questions: [{ en: { q: "Q1", options: ["a", "b"] }, hi: { q: "प्र1", options: ["क", "ख"] } }, { en: { q: "Q2", options: ["a", "b"] } }] },
    { name: "Maths", mode: "en", questions: [{ en: { q: "Q3", options: ["a", "b"] } }] },
  ];
  test("payload is one array per section with null for skipped", () => {
    const t = normalizeMain("k", tet, 3, sections);
    expect(mainPayload(t, [1, null, 0])).toEqual([[1, null], [0]]);
    expect(t.questions[1]?.q.hi).toBe("Q2"); // English-only question falls back
    expect(t.key_).toBeUndefined();
  });
  const rpc = { score: 5, totalCorrect: 6, totalIncorrect: 3, totalUnattempted: 1, rows: [{ name: "GA", total: 10, c: 6, ic: 3, un: 1 }] };
  test("TET uses the server score as-is", () => {
    expect(fromRpc(normalizeMain("k", tet, 3, sections), rpc).score).toBe(5);
  });
  test("RRB NTPC uses correct − wrong/3 like the website page", () => {
    expect(fromRpc(normalizeMain("k", rrbg, 3, sections), rpc).score).toBe(5);
    expect(fromRpc(normalizeMain("k", rrbg, 3, sections), { ...rpc, totalIncorrect: 2 }).score).toBe(5.33);
  });
  test("CPCT key maps onto questions", () => {
    const t = normalizeMain("k", tet, 3, sections);
    const r = fromRpc(t, { ...rpc, key: [[{ a: 1, e: { en: "because" } }, { a: 0 }], [{ a: 1, e: "x" }]] });
    expect(r.solutions?.a).toEqual([1, 0, 1]);
    expect(r.solutions?.sol[2]).toEqual({ hi: "x", en: "x" });
  });
  test("accuracy", () => {
    expect(accuracy({ correct: 3, incorrect: 1 })).toBe(75);
    expect(accuracy({ correct: 0, incorrect: 0 })).toBe(0);
  });
});
