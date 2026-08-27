import type { PaidNote } from './types'

// Sample paid-note listing to demonstrate the premium notes catalog.
// Update pricing and files with real content before launch.
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
    price: 149,
    discountPrice: 99,
    currency: 'INR',
    access: 'paid',
  },
]

export function getPaidNote(slug: string) {
  return paidNotes.find((n) => n.slug === slug)
}
