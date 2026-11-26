import exams from "../exams.json";
import { isFreeTest, parseTestKey, SERIES, testKey } from "../catalog";

describe("catalog", () => {
  it("round-trips test keys", () => {
    const s = SERIES[0]!;
    const k = testKey(s.id, 3);
    expect(parseTestKey(k)?.series.id).toBe(s.id);
    expect(parseTestKey(k)?.n).toBe(3);
    expect(parseTestKey("nope~1")).toBeNull();
  });
  it("only test 1 is free", () => {
    expect(isFreeTest(1)).toBe(true);
    expect(isFreeTest(2)).toBe(false);
  });
  it("has unique ids and real exam links", () => {
    const ids = new Set(SERIES.map((s) => s.id));
    expect(ids.size).toBe(SERIES.length);
    const examIds = new Set((exams as { exams: { id: string }[] }).exams.map((e) => e.id));
    for (const s of SERIES) for (const e of s.examIds) expect(examIds.has(e)).toBe(true);
  });
  it("hub series have folder and product", () => {
    for (const s of SERIES.filter((x) => x.source === "hub")) { expect(s.folder).toBeTruthy(); expect(s.product).toBeTruthy(); }
  });
});
