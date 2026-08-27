import { useState } from 'react'
import Icon from './Icon'

// Payment-ready UI abstraction. No real authentication or payment gateway
// is wired up yet — clicking never claims a purchase or enrollment
// succeeded. Swap the onClick handler for a real checkout flow
// (Razorpay/Cashfree/Stripe) once a backend is available.
type Status = 'Enrollment Open' | 'Coming Soon' | 'Enrollment Closed'

export default function EnrollmentCTA({ status, price, discountPrice }: { status: Status; price?: number; discountPrice?: number }) {
  const [clicked, setClicked] = useState(false)

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
      <button onClick={() => setClicked(true)} className="btn-primary w-full sm:w-auto">
        <Icon name="lock" className="h-4 w-4" />
        Enroll Now {discountPrice ? `— ₹${discountPrice}` : price ? `— ₹${price}` : ''}
      </button>
      {clicked && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Online payment is not yet enabled. Please use the Contact page to arrange enrollment for now.
        </p>
      )}
    </div>
  )
}
