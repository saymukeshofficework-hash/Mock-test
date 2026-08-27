import type { Subject } from './types'

const lower = ['class-5', 'class-6', 'class-7', 'class-8']
const middle = ['class-9', 'class-10']
const senior = ['class-11', 'class-12']

export const subjects: Subject[] = [
  { slug: 'english', name: 'English', classes: [...lower, ...middle, ...senior], description: 'Grammar, comprehension, writing skills and literature.' },
  { slug: 'hindi', name: 'Hindi', classes: [...lower, ...middle], description: 'Vyakaran, gadya, padya and lekhan kaushal.' },
  { slug: 'mathematics', name: 'Mathematics', classes: [...lower, ...middle, 'class-11', 'class-12'], description: 'Concept-based mathematics with solved examples and practice.' },
  { slug: 'science', name: 'Science', classes: [...lower, ...middle], description: 'Physics, Chemistry and Biology fundamentals for school science.' },
  { slug: 'social-science', name: 'Social Science', classes: [...lower, ...middle], description: 'History, Geography, Civics and Economics.' },
  { slug: 'computer', name: 'Computer / IT', classes: [...middle], description: 'Foundational computer applications and information technology.' },
  { slug: 'physics', name: 'Physics', classes: senior, description: 'Senior secondary Physics for Science stream students.' },
  { slug: 'chemistry', name: 'Chemistry', classes: senior, description: 'Senior secondary Chemistry for Science stream students.' },
  { slug: 'biology', name: 'Biology', classes: senior, description: 'Senior secondary Biology, including NEET-focused topics.' },
]

export function getSubject(slug: string) {
  return subjects.find((s) => s.slug === slug)
}

export function subjectsForClass(classSlug: string) {
  return subjects.filter((s) => s.classes.includes(classSlug))
}
