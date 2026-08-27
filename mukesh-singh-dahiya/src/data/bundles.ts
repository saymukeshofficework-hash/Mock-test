import type { Bundle } from './types'

// Bundled products (notes + questions + solutions, sold together at one
// price). Prices below are initial suggested starting prices, not final —
// every price is editable here and nowhere else.
export const bundles: Bundle[] = [
  {
    id: 'b1',
    slug: 'class-10-science-complete-bundle',
    title: 'Class 10 Science — Complete Study Bundle',
    type: 'bundle',
    classSlug: 'class-10',
    board: 'CBSE',
    subject: 'science',
    category: 'school',
    description: 'Everything needed for Class 10 Science board exam preparation, bundled at one price.',
    includes: ['Complete Notes', 'Important Questions', 'Solved Textbook Solutions', 'Revision Material'],
    price: 699,
    discountPrice: 499,
    offerLabel: 'Bundle & Save',
    currency: 'INR',
    access: 'paid',
  },
  {
    id: 'b2',
    slug: 'class-12-biology-complete-bundle',
    title: 'Class 12 Biology — Complete Bundle',
    type: 'bundle',
    classSlug: 'class-12',
    board: 'CBSE',
    subject: 'biology',
    category: 'school',
    description: 'Complete Class 12 Biology preparation — notes, questions, solutions and previous-year questions in one bundle.',
    includes: ['Complete Notes', 'Important Questions', 'Solutions', 'Previous Year Questions'],
    price: 799,
    discountPrice: 599,
    currency: 'INR',
    access: 'paid',
  },
  {
    id: 'b3',
    slug: 'neet-biology-complete-bundle',
    title: 'NEET Biology — Complete Bundle',
    type: 'bundle',
    subject: 'biology',
    category: 'neet',
    description: 'The complete NEET Biology bundle — Botany, Zoology, question practice and revision material together.',
    includes: ['Botany Notes', 'Zoology Notes', 'MCQ Practice', 'Revision Material'],
    price: 999,
    discountPrice: 699,
    offerLabel: 'Bundle & Save',
    currency: 'INR',
    access: 'paid',
  },
]

export function getBundle(slug: string) {
  return bundles.find((b) => b.slug === slug)
}
