export interface NavLink {
  label: string
  to: string
  badge?: string
}
export interface NavGroup {
  label: string
  links: NavLink[]
  secondaryLinks?: NavLink[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'Learn',
    links: [
      { label: 'Science Notes', to: '/learn/science', badge: 'All Grades' },
      { label: 'Class 6', to: '/learn/science/class-6' },
      { label: 'Class 7', to: '/learn/science/class-7' },
      { label: 'Class 8', to: '/learn/science/class-8' },
      { label: 'Class 9', to: '/learn/science/class-9' },
      { label: 'Class 10', to: '/learn/science/class-10' },
      { label: 'Class 11', to: '/learn/science/class-11' },
      { label: 'Class 12', to: '/learn/science/class-12' },
    ],
    secondaryLinks: [
      { label: 'All Classes', to: '/classes' },
      { label: 'All Subjects', to: '/subjects' },
      { label: 'General Notes', to: '/notes' },
      { label: 'Solutions', to: '/solutions' },
    ],
  },
  {
    label: 'Practice',
    links: [
      { label: 'Questions', to: '/questions' },
      { label: 'Worksheets', to: '/notes?type=Worksheet' },
      { label: 'Previous Papers', to: '/previous-papers' },
    ],
  },
  {
    label: 'NEET',
    links: [
      { label: 'NEET Biology', to: '/neet' },
      { label: 'Botany', to: '/neet/botany' },
      { label: 'Zoology', to: '/neet/zoology' },
      { label: 'NEET Notes', to: '/neet/notes' },
      { label: 'NEET Questions', to: '/neet/questions' },
      { label: 'Previous Questions', to: '/neet/previous-questions' },
      { label: 'Revision', to: '/neet/revision' },
    ],
  },
  {
    label: 'Tools',
    links: [
      { label: 'Calculators', to: '/calculators' },
      { label: 'Unit Converter', to: '/calculators/converter' },
    ],
  },
]

export const topLevelLinks: NavLink[] = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Resources', to: '/resources' },
  { label: 'Contact', to: '/contact' },
]
