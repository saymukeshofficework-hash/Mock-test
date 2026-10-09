import { categories } from "@/data/categories";
import { exams } from "@/data/exams";
import { notes } from "@/data/notes";
import { compareExams } from "@/lib/dates";
import type { Exam, ExamCategory, NoteProduct } from "@/types";

export type SearchHit =
  | { kind: "exam"; exam: Exam }
  | { kind: "note"; note: NoteProduct }
  | { kind: "category"; category: ExamCategory };

const norm = (s: string) => s.toLowerCase().normalize("NFC").replace(/[-_]/g, " ");

/** Token search across exams, notes and categories. Safe to run in the browser. */
export function searchSync(query: string): SearchHit[] {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const match = (hay: string) => {
    const h = norm(hay);
    return tokens.every((t) => h.includes(t));
  };
  const hits: SearchHit[] = [];
  for (const c of categories) {
    if (match([c.name.hi, c.name.en, c.description.hi, c.description.en, ...c.subcategories.flatMap((s) => [s.hi, s.en])].join(" "))) {
      hits.push({ kind: "category", category: c });
    }
  }
  for (const e of [...exams].sort((a, b) => compareExams(a, b))) {
    if (match([e.name.hi, e.name.en, e.shortName, e.organization, e.category, e.slug].join(" "))) hits.push({ kind: "exam", exam: e });
  }
  for (const n of notes) {
    if (match([n.title.hi, n.title.en, n.subject.hi, n.subject.en, n.category, "notes नोट्स"].join(" "))) hits.push({ kind: "note", note: n });
  }
  return hits;
}
