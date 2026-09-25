// Legal pages. Anything the seller hasn't provided (business name, address, GSTIN,
// grievance contact, refund terms) is shown as a visible [placeholder] from config.ts —
// never invented. Have these reviewed before going live.
import { Link } from 'react-router-dom'
import { Prose } from '../components/Layout'
import WhatsAppButton from '../components/WhatsAppButton'
import { business, product, refundPolicy, site } from '../config'
import { hasWhatsApp } from '../lib/whatsapp'

function Updated() {
  return <p className="text-sm text-ink-500">Last updated: {business.lastUpdated}</p>
}

export function Terms() {
  return (
    <Prose title="Terms of Sale">
      <Updated />
      <h2>1. Who is selling</h2>
      <p>{product.name} is sold by {business.sellerName}, {business.address}.{business.gstin ? ` GSTIN: ${business.gstin}.` : ''}</p>
      <h2>2. The product</h2>
      <p>
        A digital PDF of study notes, priced at {product.priceDisplay} (INR), inclusive of any applicable taxes unless stated
        otherwise at checkout. Nothing physical is shipped.
      </p>
      <h2>3. Payment</h2>
      <p>
        Payments are processed by Razorpay. An order is complete only after our server has verified the payment with
        Razorpay. A “success” message from a browser alone does not complete an order.
      </p>
      <h2>4. Access and downloads</h2>
      <p>
        After a verified payment you receive a personal, temporary download link. Each purchase allows up to
        {' '}{product.maxDownloads} downloads, and each generated link expires after {product.linkExpiryMinutes} minutes (you can
        generate a new one while downloads remain). We may reset or extend this on request.
      </p>
      <h2>5. Licence — personal study only</h2>
      <p>
        The notes are licensed to the buyer for personal, non-commercial study. You may not resell, share, upload, forward
        in groups, or republish the PDF or any part of it. We may disable access where a purchase is misused.
      </p>
      <h2>6. Refunds</h2>
      <p>See the <Link to="/refund">refund policy</Link>.</p>
      <h2>7. Liability</h2>
      <p>
        The notes are a study aid prepared in good faith. They do not guarantee any exam result. Always refer to your
        official course material and instructions.
      </p>
      <h2>8. Contact</h2>
      <p>See the <Link to="/contact">contact page</Link>. Grievances: {business.grievanceOfficer}.</p>
    </Prose>
  )
}

export function Privacy() {
  return (
    <Prose title="Privacy Policy">
      <Updated />
      <h2>What we collect</h2>
      <p>
        When you buy, we collect your name, mobile number and email address, plus payment references from Razorpay
        (order ID, payment ID, payment method and status). We do not receive or store your card number, UPI PIN or bank
        credentials — those are handled by Razorpay.
      </p>
      <h2>Why</h2>
      <ul>
        <li>to create your order and verify your payment;</li>
        <li>to give you, and later restore, access to your download;</li>
        <li>to answer support requests and prevent misuse or fraud;</li>
        <li>to meet legal and accounting obligations.</li>
      </ul>
      <h2>Anonymous usage counts</h2>
      <p>
        We count page views, button clicks, checkouts opened, payments and downloads (with the traffic source, e.g.
        “whatsapp”) to understand how the page is used. These counts contain no name, phone, email or IP address. No
        third-party advertising trackers are used.
      </p>
      <h2>On your device</h2>
      <p>
        Your browser stores your download access code and last order reference so the download page keeps working after a
        refresh. You can clear it by clearing this site’s data.
      </p>
      <h2>Who processes your data</h2>
      <p>
        Razorpay (payments) and Supabase (database, file storage and server functions). We do not sell your data.
      </p>
      <h2>Retention and your rights</h2>
      <p>
        Order and payment records are kept as long as needed for access, support and legal requirements. To ask for a copy,
        correction or deletion of your data, contact us via the <Link to="/contact">contact page</Link>.
      </p>
      <p>Data controller: {business.sellerName}, {business.address}.</p>
    </Prose>
  )
}

export function Refund() {
  return (
    <Prose title="Refund Policy">
      <Updated />
      {refundPolicy.isPlaceholder && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-amber-900">{refundPolicy.summary}</p>
      )}
      {refundPolicy.body.map((p) => <p key={p}>{p}</p>)}
      <h2>Payment problems</h2>
      <p>
        If money was deducted but you didn’t get access, first use <Link to="/check-status">Check Payment Status</Link>.
        If a payment didn’t complete, it is not charged — any amount held by your bank is reversed by the bank/Razorpay
        according to their timelines.
      </p>
    </Prose>
  )
}

export function Contact() {
  return (
    <Prose title="Contact & Support">
      <p>For help with buying, payment or downloads, include your order reference (BCN-…) if you have one.</p>
      <div className="not-prose my-6 flex flex-col gap-3 sm:flex-row">
        {hasWhatsApp && <WhatsAppButton />}
        <Link to="/check-status" className="btn-secondary">CHECK PAYMENT STATUS</Link>
      </div>
      <ul>
        <li>WhatsApp: {hasWhatsApp ? `+${site.whatsappNumber}` : '[WhatsApp support number — to be configured (VITE_WHATSAPP_NUMBER)]'}</li>
        <li>Email: {site.supportEmail || '[Support email — to be filled in]'}</li>
        <li>Seller: {business.sellerName}</li>
        <li>Address: {business.address}</li>
      </ul>
    </Prose>
  )
}

export function NotFound() {
  return (
    <Prose title="Page not found">
      <p>That page doesn’t exist. <Link to="/">Go to {product.shortName}</Link>.</p>
    </Prose>
  )
}
