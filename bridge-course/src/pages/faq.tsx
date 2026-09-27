import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { product, site, totals } from '../config'
import { hasWhatsApp } from '../lib/whatsapp'

// No refund promise is made here: the refund answer points to the configurable policy page.
export const faqs: { q: string; a: ReactNode }[] = [
  {
    q: 'What is this product?',
    a: `${product.name} is a digital PDF of chapter-wise notes for the Bridge Course 2.0 — ${totals.papers} papers, ${totals.chapters} chapter notes, with answers to in-text and end-of-unit questions and quick revision lists.`,
  },
  { q: 'Is this a physical book?', a: 'No. It is a digital PDF only. Nothing is shipped.' },
  {
    q: 'How will I receive the notes?',
    a: 'Right after your payment is verified you land on a page with a DOWNLOAD NOTES button. It gives you a secure, temporary link to the PDF.',
  },
  {
    q: 'Is Razorpay secure?',
    a: 'Yes. Payment happens inside Razorpay’s own checkout (UPI, cards, net banking, wallets). We never see or store your card details or UPI PIN, and our server confirms every payment directly with Razorpay.',
  },
  {
    q: 'When will I receive the download?',
    a: 'Immediately after payment — usually within a few seconds. If your bank takes longer to confirm, use “Check Payment Status” a few minutes later.',
  },
  { q: 'Can I read the PDF on mobile?', a: 'Yes. It opens in any PDF viewer on Android or iPhone, and on computers.' },
  {
    q: 'What happens if payment succeeds but download fails?',
    a: (
      <>
        Your purchase is saved on our side. Open <Link to="/check-status" className="font-semibold underline">Check Payment Status</Link>,
        enter your order reference (BCN-…) or the Razorpay payment ID from your payment receipt (pay_…), plus the mobile
        number or email you used — you’ll get your download again. You can download up to {product.maxDownloads} times.
        Refund questions: see the <Link to="/refund" className="font-semibold underline">refund policy</Link>.
      </>
    ),
  },
  {
    q: 'How can I contact support?',
    a: hasWhatsApp
      ? 'Tap “Contact on WhatsApp” on this page and include your order reference if you have one.'
      : site.supportEmail
        ? `Email ${site.supportEmail} with your order reference if you have one.`
        : <>See the <Link to="/contact" className="font-semibold underline">contact page</Link>.</>,
  },
]
