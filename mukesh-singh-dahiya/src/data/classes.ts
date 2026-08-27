import type { ClassInfo } from './types'

export const classes: ClassInfo[] = [
  { slug: 'class-5', label: 'Class 5', numeral: '5', boards: ['CBSE', 'MP Board'], description: 'Foundational learning in English, Hindi, Mathematics, Science (EVS) and Social Studies.' },
  { slug: 'class-6', label: 'Class 6', numeral: '6', boards: ['CBSE', 'MP Board'], description: 'Building strong fundamentals across core subjects for middle school.' },
  { slug: 'class-7', label: 'Class 7', numeral: '7', boards: ['CBSE', 'MP Board'], description: 'Strengthening concepts in English, Hindi, Mathematics, Science and Social Science.' },
  { slug: 'class-8', label: 'Class 8', numeral: '8', boards: ['CBSE', 'MP Board'], description: 'Preparing students for the transition to secondary-level academics.' },
  { slug: 'class-9', label: 'Class 9', numeral: '9', boards: ['CBSE', 'MP Board'], description: 'Secondary-level foundation across English, Hindi, Mathematics, Science and Social Science.' },
  { slug: 'class-10', label: 'Class 10', numeral: '10', boards: ['CBSE', 'MP Board'], description: 'Board examination preparation with structured notes, solutions and previous papers.' },
  { slug: 'class-11', label: 'Class 11', numeral: '11', boards: ['CBSE', 'MP Board'], description: 'Senior secondary academics with a focus on Science stream subjects.' },
  { slug: 'class-12', label: 'Class 12', numeral: '12', boards: ['CBSE', 'MP Board'], description: 'Board examination and NEET-focused preparation for Science stream students.' },
]

export function getClass(slug: string) {
  return classes.find((c) => c.slug === slug)
}
