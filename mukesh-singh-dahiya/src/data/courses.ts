import type { Course } from './types'

// Sample/demo courses to demonstrate the course catalog and detail page.
// Prices below are initial suggested starting prices, not final or
// market-standard pricing — every price is editable here and nowhere
// else. Schedules and curricula are illustrative until confirmed.
export const courses: Course[] = [
  {
    id: 'c1',
    slug: 'class-10-science-cbse',
    title: 'Class 10 Science — Complete CBSE Course',
    type: 'course',
    classSlug: 'class-10',
    board: 'CBSE',
    subject: 'science',
    category: 'school',
    description: 'A structured, chapter-by-chapter Class 10 Science course covering Physics, Chemistry and Biology with notes, solved examples and practice questions.',
    whatsIncluded: ['Recorded lessons', 'Chapter-wise notes', 'Practice questions', 'Doubt support via WhatsApp'],
    price: 1999,
    discountPrice: 1499,
    offerLabel: 'Launch Offer',
    currency: 'INR',
    access: 'paid',
    status: 'Coming Soon',
    duration: 'Full academic session',
    level: 'Class 10',
    modules: [
      {
        title: 'Biology — Life Processes',
        lessons: [
          { title: 'Introduction to Life Processes', access: 'free' },
          { title: 'Nutrition in Living Organisms', access: 'paid' },
          { title: 'Respiration and Transportation', access: 'paid' },
        ],
      },
      {
        title: 'Chemistry — Chemical Reactions',
        lessons: [
          { title: 'Types of Chemical Reactions', access: 'free' },
          { title: 'Balancing Chemical Equations', access: 'paid' },
        ],
      },
    ],
  },
  {
    id: 'c2',
    slug: 'neet-botany-foundation',
    title: 'NEET Botany Course',
    type: 'course',
    subject: 'biology',
    category: 'neet',
    description: 'A dedicated NEET Botany course covering key chapters with concept notes, MCQ practice and revision material.',
    whatsIncluded: ['Chapter-wise concept notes', 'MCQ practice sets', 'Revision material', 'Doubt support via WhatsApp'],
    price: 2499,
    discountPrice: 1799,
    currency: 'INR',
    access: 'paid',
    status: 'Coming Soon',
    duration: 'Self-paced',
    level: 'NEET Aspirants',
    modules: [
      {
        title: 'Plant Physiology',
        lessons: [
          { title: 'Overview of Plant Physiology', access: 'free' },
          { title: 'Photosynthesis in Higher Plants', access: 'paid' },
        ],
      },
    ],
  },
  {
    id: 'c3',
    slug: 'neet-botany-zoology-complete',
    title: 'NEET Botany + Zoology Complete Course',
    type: 'course',
    subject: 'biology',
    category: 'neet',
    description: 'The complete NEET Biology course covering both Botany and Zoology — concept notes, MCQ practice, previous-year questions and revision.',
    whatsIncluded: ['Complete Botany + Zoology coverage', 'Concept notes', 'MCQ & PYQ practice', 'Revision sessions', 'Doubt support via WhatsApp'],
    price: 4999,
    discountPrice: 3499,
    offerLabel: 'Best Value',
    currency: 'INR',
    access: 'paid',
    status: 'Coming Soon',
    duration: 'Self-paced',
    level: 'NEET Aspirants',
    modules: [
      {
        title: 'Botany Foundation',
        lessons: [
          { title: 'Overview of Plant Physiology', access: 'free' },
          { title: 'Cell Biology Essentials', access: 'paid' },
        ],
      },
      {
        title: 'Zoology Foundation',
        lessons: [
          { title: 'Overview of Human Physiology', access: 'free' },
          { title: 'Genetics and Evolution', access: 'paid' },
        ],
      },
    ],
  },
]

export function getCourse(slug: string) {
  return courses.find((c) => c.slug === slug)
}
