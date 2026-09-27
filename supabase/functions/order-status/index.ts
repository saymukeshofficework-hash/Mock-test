// Two read/recovery modes:
//
// 1. POST { token }
//    → { status, downloads_left, expires_at, product_name, amount, order_reference }
//    Lets the success page survive a refresh. Never consumes a download.
//
// 2. POST { order_reference, contact }   (contact = the email OR mobile used at checkout;
//    order_reference = our BCN-… reference OR the Razorpay payment id pay_… from the
//    customer's Razorpay receipt)
//    Payment recovery for "money deducted / browser closed / callback failed". The
//    order reference alone is not enough — the contact must match too, failures are
//    counted and the order is locked after MAX_LOOKUP_FAILURES. If the order is not yet
//    marked paid, Razorpay is asked directly for the order's payments; only a captured
//    payment for the exact amount unlocks access. On success a NEW access token is issued.
import { config } from '../_shared/config.ts'
import { TOKEN_PATTERN, timingSafeEqual } from '../_shared/crypto.ts'
import { db, type OrderRow } from '../_shared/db.ts'
import { handler, json, PublicError, readJson } from '../_shared/http.ts'
import { accessSummary, issueAccessToken, loadOrderByRazorpayId, settlePayment } from '../_shared/fulfil.ts'
import { fetchOrderPayments, fetchPayment, PAYMENT_ID_PATTERN } from '../_shared/razorpay.ts'
import { normalisePhone } from '../_shared/validate.ts'

const NOT_FOUND = 'We could not find a matching order. Please check the order reference and the email or mobile number you used.'
const REF_PATTERN = /^BCN-[0-9A-HJKMNP-TV-Z]{10}$/

function contactMatches(order: OrderRow, contact: string): boolean {
  const c = contact.trim().toLowerCase()
  if (c.includes('@')) return timingSafeEqual(c, order.buyer_email.toLowerCase())
  const phone = normalisePhone(c)
  return phone !== null && timingSafeEqual(phone, order.buyer_phone)
}

async function tokenMode(req: Request, token: string) {
  if (!TOKEN_PATTERN.test(token)) throw new PublicError(400, 'Invalid request.', 'bad_request')
  const s = await accessSummary(token)
  if (!s) throw new PublicError(404, 'This download link is not valid.', 'invalid')
  return json(req, 200, {
    status: s.valid ? 'active' : s.reason,
    downloads_left: s.downloads_left,
    expires_at: s.expires_at,
    product_name: s.product_name,
    amount: s.amount_paise,
    order_reference: s.order_reference,
  })
}

async function findOrder(reference: string): Promise<OrderRow | null> {
  const trimmed = reference.trim()
  if (PAYMENT_ID_PATTERN.test(trimmed)) {
    // Ask Razorpay which order this payment belongs to (a made-up id simply 404s there).
    let orderId: string | null = null
    try {
      orderId = (await fetchPayment(trimmed)).order_id
    } catch {
      return null
    }
    return orderId ? await loadOrderByRazorpayId(orderId) : null
  }
  const ref = trimmed.toUpperCase()
  if (!REF_PATTERN.test(ref)) return null
  const { data, error } = await db()
    .from('orders').select('*').eq('public_reference', ref).maybeSingle<OrderRow>()
  if (error) throw new Error(`load order: ${error.message}`)
  return data
}

async function recoveryMode(req: Request, reference: string, contact: string) {
  if (reference.length > 64 || contact.length < 5 || contact.length > 254) {
    throw new PublicError(400, NOT_FOUND, 'not_found')
  }
  const order = await findOrder(reference)
  if (!order) throw new PublicError(404, NOT_FOUND, 'not_found')
  const ref = order.public_reference

  if (order.lookup_failures >= config.maxLookupFailures()) {
    throw new PublicError(429, 'Too many attempts for this order. Please contact support.', 'locked')
  }
  if (!contactMatches(order, contact)) {
    await db().from('orders').update({ lookup_failures: order.lookup_failures + 1 }).eq('id', order.id)
    throw new PublicError(404, NOT_FOUND, 'not_found')
  }

  if (order.status === 'refunded' || order.status === 'cancelled') {
    return json(req, 200, { status: order.status, order_reference: ref,
      message: order.status === 'refunded'
        ? 'This order was refunded, so download access is no longer available.'
        : 'This order was cancelled before payment.' })
  }

  let purchaseId: string | null = null
  if (order.status === 'paid') {
    const { data: pu } = await db().from('purchases').select('id').eq('order_id', order.id).maybeSingle()
    purchaseId = pu?.id ?? null
  }

  if (!purchaseId && order.razorpay_order_id) {
    const payments = await fetchOrderPayments(order.razorpay_order_id)
    const candidate = payments.find((p) => p.status === 'captured')
      ?? payments.find((p) => p.status === 'authorized')
    if (candidate) {
      const result = await settlePayment(order, candidate, null)
      if (result.state === 'paid') purchaseId = result.purchaseId
      else if (result.state === 'pending') {
        return json(req, 202, { status: 'processing', order_reference: ref,
          message: 'Payment verification is still processing. Please check again in a few minutes.' })
      }
    }
  }

  if (!purchaseId) {
    return json(req, 200, {
      status: order.status === 'failed' ? 'failed' : 'unpaid',
      order_reference: ref,
      message: 'We could not find a successful payment for this order. If money was deducted, it is usually auto-reversed by your bank; please contact support with your order reference.',
    })
  }

  const token = await issueAccessToken(purchaseId)
  const s = await accessSummary(token)
  return json(req, 200, {
    status: 'paid',
    access_token: token,
    order_reference: ref,
    product_name: s?.product_name,
    amount: s?.amount_paise,
    downloads_left: s?.downloads_left,
    expires_at: s?.expires_at,
  })
}

Deno.serve(handler('order-status', async (req) => {
  const body = await readJson(req)
  if (typeof body.token === 'string') return await tokenMode(req, body.token)
  if (typeof body.order_reference === 'string' && typeof body.contact === 'string') {
    return await recoveryMode(req, body.order_reference, body.contact)
  }
  throw new PublicError(400, 'Invalid request.', 'bad_request')
}))
