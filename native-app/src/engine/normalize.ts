import type { Bi } from "@/lib/i18n";
import type { Series } from "@/data/catalog";
import type { BiList, NQuestion, NTest } from "./types";

type MainSection = { name?: string; mode?: string; questions?: { en?: { q?: string; options?: string[] }; hi?: { q?: string; options?: string[] } }[] };

const bi = (v: unknown): Bi => (typeof v === "string" ? { hi: v, en: v } : v && typeof v === "object" ? (v as Bi) : { hi: "", en: "" });
const biList = (v: unknown): BiList => {
  if (Array.isArray(v)) return { hi: v.map(String), en: v.map(String) };
  const o = (v ?? {}) as { hi?: string[]; en?: string[] };
  const hi = o.hi ?? o.en ?? [];
  const en = o.en ?? o.hi ?? [];
  return { hi, en };
};

/** Main project: rows from RPC get_test_questions (answers already stripped server-side). */
export function normalizeMain(key: string, series: Series, n: number, sections: MainSection[], title?: string): NTest {
  const questions: NQuestion[] = [];
  sections.forEach((s, si) => {
    (s.questions ?? []).forEach((q, qi) => {
      const en = q.en ?? q.hi ?? {};
      const hi = q.hi ?? q.en ?? {};
      questions.push({
        section: si,
        inSection: qi,
        q: { hi: hi.q ?? "", en: en.q ?? "" },
        options: { hi: hi.options ?? en.options ?? [], en: en.options ?? hi.options ?? [] },
      });
    });
  });
  return {
    key,
    title: title ? { hi: title, en: title } : { hi: `${series.title.hi} — टेस्ट ${n}`, en: `${series.title.en} — Test ${n}` },
    sections: sections.map((s) => ({ name: bi(s.name ?? "") })),
    questions,
    minutes: series.minutes,
    scoring: series.scoring,
  };
}

type HubJson = {
  title?: Bi;
  sections?: { key: string; label: Bi }[];
  questions?: { s: string; a: number; q: Bi; o: BiList | string[]; sol?: Bi; p?: Bi; f?: string }[];
  marks?: { c: number; w: number };
  minutes?: number;
};

/** exam-hub test JSON (public test 01 or a paid test served by notes-checkout). */
export function normalizeHub(key: string, series: Series, n: number, d: HubJson): NTest {
  const secs = d.sections ?? [];
  const idx = new Map(secs.map((s, i) => [s.key, i]));
  const counters = secs.map(() => 0);
  const questions: NQuestion[] = [];
  const a: number[] = [];
  const sol: (Bi | undefined)[] = [];
  for (const q of d.questions ?? []) {
    const si = idx.get(q.s) ?? 0;
    const inSection = counters[si] ?? 0;
    counters[si] = inSection + 1;
    questions.push({ section: si, inSection, q: bi(q.q), options: biList(q.o), passage: q.p ? bi(q.p) : undefined, figure: typeof q.f === "string" ? q.f : undefined });
    a.push(Number(q.a));
    sol.push(q.sol ? bi(q.sol) : undefined);
  }
  const sc = series.scoring;
  const marks = sc.kind === "marks" ? (sc.useJson && d.marks ? d.marks : { c: sc.c, w: sc.w }) : undefined;
  return {
    key,
    title: d.title ? bi(d.title) : { hi: `${series.title.hi} — टेस्ट ${n}`, en: `${series.title.en} — Test ${n}` },
    sections: secs.map((s) => ({ name: bi(s.label) })),
    questions,
    minutes: typeof d.minutes === "number" && d.minutes > 0 ? d.minutes : series.minutes,
    scoring: series.scoring,
    marks,
    key_: { a, sol },
  };
}
