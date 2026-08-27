export type Board = 'CBSE' | 'MP Board'
export type Access = 'free' | 'paid' | 'preview'
export type ResourceType =
  | 'Notes'
  | 'Solutions'
  | 'Questions'
  | 'Practice'
  | 'Worksheet'
  | 'Previous Paper'
  | 'Revision'
  | 'Important Questions'
  | 'MCQ'
  | 'Other'

export interface ClassInfo {
  slug: string
  label: string
  numeral: string
  boards: Board[]
  description: string
}

export interface Subject {
  slug: string
  name: string
  classes: string[] // class slugs this subject applies to
  description: string
}

export interface Chapter {
  slug: string
  name: string
  subject: string // subject slug
  classSlug: string
}

export interface Resource {
  id: string
  slug: string
  title: string
  classSlug: string
  board: Board
  subject: string // subject slug
  chapter?: string
  topic?: string
  resourceType: ResourceType
  description: string
  file?: string
  previewFile?: string
  date?: string
  tags?: string[]
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  access: Access
  price?: number
  discountPrice?: number
}

export interface Question {
  id: string
  question: string
  options: string[]
  answer: number
  explanation: string
  classSlug: string
  board: Board
  subject: string
  chapter?: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

export interface PreviousPaper {
  id: string
  title: string
  classSlug: string
  board: Board
  subject: string
  year: number | string
  exam: string
  file?: string
  description: string
}

export interface CourseModule {
  title: string
  lessons: { title: string; access: 'free' | 'paid' }[]
}

export interface Course {
  id: string
  slug: string
  title: string
  type: 'course'
  classSlug?: string
  board?: Board
  subject?: string
  category: 'school' | 'neet'
  description: string
  thumbnail?: string
  price?: number
  discountPrice?: number
  currency: 'INR'
  access: 'paid'
  status: 'Enrollment Open' | 'Coming Soon' | 'Enrollment Closed'
  duration?: string
  level?: string
  modules: CourseModule[]
}

export interface PaidNote {
  id: string
  slug: string
  title: string
  classSlug: string
  board: Board
  subject: string
  chapter?: string
  description: string
  previewFile?: string
  file?: string
  price: number
  discountPrice?: number
  currency: 'INR'
  access: 'paid'
}

export interface OnlineClass {
  id: string
  slug: string
  title: string
  classSlug: string
  board: Board
  subject: string
  teacher: string
  description: string
  days?: string
  time?: string
  startDate?: string
  duration?: string
  mode: 'Online (Live)' | 'To be announced'
  price?: number
  currency: 'INR'
  status: 'Enrollment Open' | 'Coming Soon' | 'Enrollment Closed'
}

export interface CalculatorField {
  key: string
  label: string
  unit?: string
}

export interface CalculatorConfig {
  slug: string
  title: string
  category: 'Mathematics' | 'Physics' | 'Chemistry' | 'Biology / NEET' | 'Converter'
  description: string
  formula: string
  fields: CalculatorField[]
  compute: (values: Record<string, number>) => Record<string, number> | string
}
