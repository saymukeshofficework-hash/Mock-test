import type { Course, PaidNote, OnlineClass, Bundle, EnrollmentStatus } from '../data/types'
import WhatsAppButton from './WhatsAppButton'
import { courseMessage, noteMessage, onlineClassMessage, bundleMessage } from '../lib/whatsapp'

type Product =
  | { kind: 'course'; data: Course }
  | { kind: 'note'; data: PaidNote }
  | { kind: 'onlineClass'; data: OnlineClass }
  | { kind: 'bundle'; data: Bundle }

const labels: Record<Product['kind'], string> = {
  course: 'Enroll via WhatsApp',
  note: 'Buy Notes via WhatsApp',
  onlineClass: 'Join via WhatsApp',
  bundle: 'Buy via WhatsApp',
}

function buildMessage(product: Product): string {
  switch (product.kind) {
    case 'course':
      return courseMessage(product.data)
    case 'note':
      return noteMessage(product.data)
    case 'onlineClass':
      return onlineClassMessage(product.data)
    case 'bundle':
      return bundleMessage(product.data)
  }
}

// Payment happens manually over WhatsApp — this never claims a purchase
// or enrollment succeeded. It only opens WhatsApp with the product
// details pre-filled; the teacher confirms payment and grants access.
export default function EnrollmentCTA(product: Product & { status?: EnrollmentStatus; compact?: boolean }) {
  const status = product.status ?? 'Enrollment Open'

  if (status === 'Coming Soon') {
    return (
      <button disabled className="btn-secondary w-full cursor-not-allowed opacity-70 sm:w-auto">
        Coming Soon
      </button>
    )
  }
  if (status === 'Enrollment Closed') {
    return (
      <button disabled className="btn-secondary w-full cursor-not-allowed opacity-70 sm:w-auto">
        Enrollment Closed
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <WhatsAppButton message={buildMessage(product)} label={labels[product.kind]} className="w-full sm:w-auto" />
      {!product.compact && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          You'll be connected with the teacher on WhatsApp to confirm payment and access.
        </p>
      )}
    </div>
  )
}
