import type { Resource } from './types'

// Demo/sample content to make the resource system testable end-to-end.
// Real notes, solutions, questions, worksheets and papers can be added
// here (or wired to a CMS/backend later) without touching any page code.
export const resources: Resource[] = [
  {
    id: 'r1',
    slug: 'class-10-science-life-processes-notes',
    title: 'Life Processes — Chapter Notes',
    classSlug: 'class-10',
    board: 'CBSE',
    subject: 'science',
    chapter: 'Life Processes',
    resourceType: 'Notes',
    description: 'Concise, exam-focused notes covering nutrition, respiration, transportation and excretion in living organisms.',
    date: '2026-04-10',
    tags: ['life processes', 'biology', 'class 10'],
    difficulty: 'Medium',
    access: 'free',
  },
  {
    id: 'r2',
    slug: 'class-10-science-life-processes-questions',
    title: 'Life Processes — Important Questions',
    classSlug: 'class-10',
    board: 'CBSE',
    subject: 'science',
    chapter: 'Life Processes',
    resourceType: 'Important Questions',
    description: 'Chapter-wise important questions with marking-scheme style answers for board exam practice.',
    date: '2026-04-12',
    tags: ['life processes', 'biology'],
    difficulty: 'Medium',
    access: 'free',
  },
  {
    id: 'r3',
    slug: 'class-10-mathematics-real-numbers-solutions',
    title: 'Real Numbers — NCERT Solutions',
    classSlug: 'class-10',
    board: 'CBSE',
    subject: 'mathematics',
    chapter: 'Real Numbers',
    resourceType: 'Solutions',
    description: 'Step-by-step NCERT textbook solutions for the Real Numbers chapter.',
    date: '2026-03-28',
    tags: ['real numbers', 'mathematics'],
    difficulty: 'Easy',
    access: 'free',
  },
  {
    id: 'r4',
    slug: 'class-12-biology-genetics-notes',
    title: 'Principles of Inheritance and Variation — Notes',
    classSlug: 'class-12',
    board: 'CBSE',
    subject: 'biology',
    chapter: 'Genetics and Evolution',
    resourceType: 'Notes',
    description: 'Detailed notes on Mendelian genetics, chromosomal theory and molecular basis of inheritance — also useful for NEET.',
    date: '2026-05-02',
    tags: ['genetics', 'neet', 'biology'],
    difficulty: 'Hard',
    access: 'preview',
    previewFile: undefined,
  },
  {
    id: 'r5',
    slug: 'class-9-science-worksheet',
    title: 'Matter in Our Surroundings — Worksheet',
    classSlug: 'class-9',
    board: 'MP Board',
    subject: 'science',
    chapter: 'Matter in Our Surroundings',
    resourceType: 'Worksheet',
    description: 'Practice worksheet with fill-in-the-blanks, short answers and diagram-based questions.',
    date: '2026-02-18',
    tags: ['matter', 'science'],
    difficulty: 'Easy',
    access: 'free',
  },
  {
    id: 'r6',
    slug: 'class-8-english-grammar-practice',
    title: 'Tenses — Practice Exercise',
    classSlug: 'class-8',
    board: 'CBSE',
    subject: 'english',
    chapter: 'Grammar — Tenses',
    resourceType: 'Practice',
    description: 'Practice sentences covering all major tense forms with an answer key.',
    date: '2026-01-22',
    tags: ['grammar', 'tenses', 'english'],
    difficulty: 'Easy',
    access: 'free',
  },
]

export function getResource(slug: string) {
  return resources.find((r) => r.slug === slug)
}

export function relatedResources(res: Resource, limit = 4) {
  return resources
    .filter((r) => r.id !== res.id && (r.chapter === res.chapter || (r.subject === res.subject && r.classSlug === res.classSlug)))
    .slice(0, limit)
}
