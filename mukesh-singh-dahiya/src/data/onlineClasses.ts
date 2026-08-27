import type { OnlineClass } from './types'
import { site } from './site'

// Sample online-class listing. Prices below are initial suggested
// starting prices, not final. Real schedules and enrollment status to be
// confirmed and updated before launch.
export const onlineClasses: OnlineClass[] = [
  {
    id: 'oc1',
    slug: 'class-10-science-batch',
    title: 'Class 10 Science — Live Batch',
    classSlug: 'class-10',
    board: 'CBSE',
    subject: 'science',
    teacher: site.name,
    description: 'A live, doubt-clearing online batch for Class 10 Science covering the full CBSE syllabus.',
    mode: 'To be announced',
    price: 1999,
    priceType: 'month',
    currency: 'INR',
    status: 'Coming Soon',
  },
]

export function getOnlineClass(slug: string) {
  return onlineClasses.find((c) => c.slug === slug)
}
