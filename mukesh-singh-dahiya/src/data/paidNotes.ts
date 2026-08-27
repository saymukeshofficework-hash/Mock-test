import type { PaidNote } from './types'

// Sample paid-note listings. Prices below are initial suggested starting
// prices, not final — every price is editable here and nowhere else.
export const paidNotes: PaidNote[] = [
  {
    id: 'p1',
    slug: 'class-12-biology-genetics-premium-notes',
    title: 'Genetics and Evolution — Premium Notes (NEET-focused)',
    classSlug: 'class-12',
    board: 'CBSE',
    subject: 'biology',
    chapter: 'Genetics and Evolution',
    description: 'In-depth, exam- and NEET-focused notes on Genetics and Evolution with diagrams, solved numericals and a revision summary.',
    whatsIncluded: ['Chapter notes (PDF)', 'Solved numericals', 'Revision summary'],
    format: 'PDF',
    price: 149,
    discountPrice: 99,
    currency: 'INR',
    access: 'paid',
  },
  {
    id: 'p2',
    slug: 'class-10-science-complete-notes',
    title: 'Class 10 Science — Complete Subject Notes',
    classSlug: 'class-10',
    board: 'CBSE',
    subject: 'science',
    description: 'Complete Class 10 Science notes covering Physics, Chemistry and Biology in one set — concise, exam-focused and diagram-rich.',
    whatsIncluded: ['All chapters (PDF)', 'Diagrams & flowcharts', 'Quick revision points'],
    format: 'PDF',
    price: 199,
    discountPrice: 149,
    currency: 'INR',
    access: 'paid',
  },
  {
    id: 'p3',
    slug: 'neet-botany-complete-notes',
    title: 'NEET Botany — Complete Notes',
    classSlug: 'class-12',
    board: 'CBSE',
    subject: 'biology',
    description: 'Complete NEET Botany notes across all major chapters, written for quick revision and concept clarity.',
    whatsIncluded: ['All Botany chapters (PDF)', 'NCERT line-by-line highlights', 'Quick revision charts'],
    format: 'PDF',
    price: 399,
    discountPrice: 299,
    currency: 'INR',
    access: 'paid',
  },
]

export function getPaidNote(slug: string) {
  return paidNotes.find((n) => n.slug === slug)
}
