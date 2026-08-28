export interface NavLink {
  label: string
  to: string
}
export interface NavGroup {
  label: string
  links: NavLink[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'Learn',
    links: [
      { label: 'Classes', to: '/classes' },
      { label: 'Subjects', to: '/subjects' },
      { label: 'Notes', to: '/notes' },
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
