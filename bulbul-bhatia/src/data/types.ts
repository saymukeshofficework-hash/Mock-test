export interface Bilingual {
  en: string
  hi: string
}

export interface Service {
  slug: string
  category: 'astrology' | 'tarot'
  name: Bilingual
  description: Bilingual
  icon: string
  featured?: boolean
}

// Only two levels are offered, across every course.
export type CourseLevel = 'basic' | 'advanced'

export type CourseCategory = 'tarot' | 'astrology' | 'handwriting'

export interface Course {
  slug: string
  category: CourseCategory
  // Omitted for courses that don't have levels (e.g. Handwriting & Signature Analysis).
  level?: CourseLevel
  title: Bilingual
  description: Bilingual
  overview: Bilingual
  whatYouLearn: Bilingual[]
  whoItsFor: Bilingual
  modules: Bilingual[]
  duration: Bilingual
  price: string
}

export interface Consultation {
  slug: string
  name: Bilingual
  price: Bilingual
  description: Bilingual
  icon: string
  bookingType: string
}

export type ToolStatus = 'live' | 'architecture'

export interface Tool {
  slug: string
  category:
    | 'kundli'
    | 'dasha'
    | 'dosha'
    | 'marriage'
    | 'numerology'
    | 'panchang'
    | 'horoscope'
  name: Bilingual
  description: Bilingual
  status: ToolStatus
  metaTitle: Bilingual
  metaDescription: Bilingual
}

export interface ZodiacSign {
  slug: string
  name: Bilingual
  symbol: string
  dateRange: string
  element: Bilingual
  image?: string
  thumb?: string
  traits: Bilingual
}

export interface FAQItem {
  question: Bilingual
  answer: Bilingual
}

export interface FAQCategory {
  category: Bilingual
  items: FAQItem[]
}

export interface Testimonial {
  name: string
  location?: Bilingual
  quote: Bilingual
  isPlaceholder: true
}
