import type { NTest, ScoreResult } from "./types";

export type Answers = (number | null)[];

/**
 * Client scoring for exam-hub series, identical to the website engine
 * (examhelp/public/mock-tests/<id>/test.html): +c per correct, −w per wrong, 0 for skipped.
 */
export function scoreClient(test: NTest, answers: Answers): ScoreResult {
  const key = test.key_;
  const marks = test.marks ?? { c: 1, w: 0 };
  if (!key) throw new Error("no_key");
  const sections = test.sections.map((s) => ({ name: s.name, total: 0, c: 0, ic: 0, un: 0 }));
  const verdicts: (boolean | null)[] = [];
  let score = 0;
  test.questions.forEach((q, i) => {
    const sec = sections[q.section];
    const g = answers[i];
    if (sec) sec.total++;
    if (g === null || g === undefined) {
      if (sec) sec.un++;
      verdicts.push(null);
    } else if (g === key.a[i]) {
      if (sec) sec.c++;
      score += marks.c;
      verdicts.push(true);
    } else {
      if (sec) sec.ic++;
      score -= marks.w;
      verdicts.push(false);
    }
  });
  const sum = (k: "c" | "ic" | "un") => sections.reduce((t, s) => t + s[k], 0);
  return {
    score: round2(score),
    max: test.questions.length * marks.c,
    correct: sum("c"),
    incorrect: sum("ic"),
    unattempted: sum("un"),
    sections,
    verdicts,
    solutions: key,
  };
}

/** Payload for RPC score_test_attempt: one array per section of chosen index or null. */
export function mainPayload(test: NTest, answers: Answers): (number | null)[][] {
  const out = test.sections.map(() => [] as (number | null)[]);
  test.questions.forEach((q, i) => {
    const arr = out[q.section];
    if (arr) arr[q.inSection] = answers[i] ?? null;
  });
  return out.map((arr) => Array.from(arr, (v) => (v === undefined ? null : v)));
}

export type RpcScore = {
  score: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalUnattempted: number;
  rows: { name: string; total: number; c: number; ic: number; un: number }[];
  /** CPCT only: [section][question] = { a, e } */
  key?: unknown;
};

/** Turns the server's score into a result, applying the page-specific formula (RRB NTPC: c − w/3). */
export function fromRpc(test: NTest, d: RpcScore): ScoreResult {
  const sections = (d.rows ?? []).map((r) => ({ name: { hi: r.name, en: r.name }, total: r.total, c: r.c, ic: r.ic, un: r.un }));
  const max = test.questions.length;
  const score = test.scoring.kind === "rpcNeg3" ? round2(d.totalCorrect - d.totalIncorrect / 3) : d.score;
  const res: ScoreResult = { score, max, correct: d.totalCorrect, incorrect: d.totalIncorrect, unattempted: d.totalUnattempted, sections };
  if (Array.isArray(d.key)) {
    const keyRows = d.key as unknown[];
    const a: number[] = [];
    const sol: ({ hi?: string; en?: string } | undefined)[] = [];
    test.questions.forEach((q) => {
      const row = keyRows[q.section];
      const k = (Array.isArray(row) ? row[q.inSection] : undefined) as { a?: number; e?: unknown } | undefined;
      a.push(typeof k?.a === "number" ? k.a : -1);
      const e = k?.e;
      sol.push(typeof e === "string" ? { hi: e, en: e } : e && typeof e === "object" ? (e as { hi?: string; en?: string }) : undefined);
    });
    res.solutions = { a, sol };
  }
  return res;
}

export const accuracy = (r: Pick<ScoreResult, "correct" | "incorrect">) => {
  const att = r.correct + r.incorrect;
  return att ? Math.round((r.correct / att) * 1000) / 10 : 0;
};
const round2 = (x: number) => Math.round(x * 100) / 100;
