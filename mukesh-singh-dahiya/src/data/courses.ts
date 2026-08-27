import type { Course } from './types'

// Sample/demo course to demonstrate the course catalog and detail page.
// Prices, schedules and curricula are illustrative — update with real
// details before launch.
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
    price: 1499,
    discountPrice: 999,
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
    title: 'NEET Botany — Foundation Course',
    type: 'course',
    subject: 'biology',
    category: 'neet',
    description: 'A dedicated NEET Botany course covering key chapters with concept notes, MCQ practice and revision material.',
    price: 2999,
    discountPrice: 1999,
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
]

export function getCourse(slug: string) {
  return courses.find((c) => c.slug === slug)
}
