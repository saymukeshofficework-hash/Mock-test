// The one place that decides "this Razorpay payment really paid for this order".
// Used by verify-razorpay-payment, razorpay-webhook and order-status (recovery), so
// every path applies exactly the same checks and the same idempotent DB function.
import { config } from './config.ts'
import { randomToken, sha256Hex } from './crypto.ts'
import { db, type OrderRow } from './db.ts'
import { capturePayment, type RazorpayPayment } from './razorpay.ts'

export type SettleResult =
  | { state: 'paid'; purchaseId: string; newlyFulfilled: boolean }
  | { state: 'pending' }
  | { state: 'failed' }
  | { state: 'mismatch'; reason: string }

export async function settlePayment(
  order: OrderRow,
  payment: RazorpayPayment,
  signature: string | null,
): Promise<SettleResult> {
  if (!order.razorpay_order_id || payment.order_id !== order.razorpay_order_id) {
    return { state: 'mismatch', reason: 'order_id' }
  }
  if (payment.amount !== order.amount_paise || payment.currency !== order.currency) {
    return { state: 'mismatch', reason: 'amount' }
  }

  let p = payment
  if (p.status === 'authorized') {
    // Normally the account's automatic-capture setting captures immediately; if a
    // payment is still only authorized, capture the exact order amount ourselves.
    try {
      p = await capturePayment(p.id, order.amount_paise, order.currency)
    } catch (err) {
      console.error(`[settle] capture attempt failed: ${(err as Error).message}`)
      return { state: 'pending' }
    }
  }
  if (p.status === 'failed') return { state: 'failed' }
  if (p.status !== 'captured') return { state: 'pending' }

  const { data, error } = await db().rpc('bridge_fulfil_order', {
    p_order_id: order.id,
    p_razorpay_payment_id: p.id,
    p_razorpay_signature: signature,
    p_amount_paise: p.amount,
    p_currency: p.currency,
    p_payment_status: p.status,
    p_method: p.method ?? null,
    p_email: p.email ?? null,
    p_phone: p.contact ?? null,
    p_max_downloads: config.maxDownloads(),
    p_access_days: config.accessDays(),
  })
  if (error) throw new Error(`fulfil rpc: ${error.message}`)
  const row = (data as { purchase_id: string; newly_fulfilled: boolean }[])[0]
  return { state: 'paid', purchaseId: row.purchase_id, newlyFulfilled: row.newly_fulfilled }
}

// Issue a fresh access token for a purchase. The raw token is returned to the caller
// (to hand to the customer) and only its SHA-256 is stored; any previous token for the
// same purchase stops working.
export async function issueAccessToken(purchaseId: string): Promise<string> {
  const token = randomToken()
  const { error } = await db().rpc('bridge_set_access_token', {
    p_purchase_id: purchaseId,
    p_token_hash: await sha256Hex(token),
    p_access_days: config.accessDays(),
  })
  if (error) throw new Error(`set token rpc: ${error.message}`)
  return token
}

export async function accessSummary(token: string) {
  const { data, error } = await db().rpc('bridge_token_status', { p_token_hash: await sha256Hex(token) })
  if (error) throw new Error(`token status rpc: ${error.message}`)
  const row = (data as {
    valid: boolean
    reason: string
    downloads_left: number
    expires_at: string
    product_name: string
    amount_paise: number
    order_reference: string
  }[])[0]
  return row ?? null
}

export async function loadOrderByRazorpayId(razorpayOrderId: string): Promise<OrderRow | null> {
  const { data, error } = await db()
    .from('orders')
    .select('*')
    .eq('razorpay_order_id', razorpayOrderId)
    .maybeSingle()
  if (error) throw new Error(`load order: ${error.message}`)
  return data as OrderRow | null
}
