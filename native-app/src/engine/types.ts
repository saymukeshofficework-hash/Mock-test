import type { Bi } from "@/lib/i18n";
import type { Scoring } from "@/data/catalog";

export type BiList = { hi: string[]; en: string[] };
export type NQuestion = {
  section: number;
  /** index inside its section (main tests need it for the scoring payload) */
  inSection: number;
  q: Bi;
  options: BiList;
  passage?: Bi;
  /** inline SVG figure */
  figure?: string;
};
export type NTest = {
  key: string;
  title: Bi;
  sections: { name: Bi }[];
  questions: NQuestion[];
  minutes: number;
  scoring: Scoring;
  /** marks per correct/wrong after JSON overrides (client-scored tests only) */
  marks?: { c: number; w: number };
  /** Hub series ship their key to authorised users, as the website engine does. Main tests never do. */
  key_?: { a: number[]; sol: (Bi | undefined)[] };
};
export type SectionResult = { name: Bi; total: number; c: number; ic: number; un: number };
export type ScoreResult = {
  score: number;
  max: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  sections: SectionResult[];
  /** per question: true correct, false wrong, null skipped (only when the key is known) */
  verdicts?: (boolean | null)[];
  /** answer key + solutions where the backend provides them (hub series, CPCT) */
  solutions?: { a: number[]; sol: (Bi | undefined)[] };
};
