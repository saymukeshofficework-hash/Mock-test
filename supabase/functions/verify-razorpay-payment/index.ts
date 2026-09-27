// POST { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// → 200 { status: 'paid', access_token, order_reference, product_name, amount, downloads_left, expires_at }
// → 202 { status: 'processing' }   payment not captured yet — client polls / uses recovery
//
// Checkout's success callback alone never unlocks anything. We (1) check the HMAC
// signature with the key secret, (2) fetch the payment from Razorpay ourselves and
// check order id, amount, currency and captured status, then (3) fulfil idempotently.
import { handler, json, PublicError, readJson } from '../_shared/http.ts'
import { accessSummary, issueAccessToken, loadOrderByRazorpayId, settlePayment } from '../_shared/fulfil.ts'
import {
  fetchPayment,
  ORDER_ID_PATTERN,
  PAYMENT_ID_PATTERN,
  SIGNATURE_PATTERN,
  verifyPaymentSignature,
} from '../_shared/razorpay.ts'
import { str } from '../_shared/validate.ts'

const NOT_CONFIRMED = 'We could not confirm your payment yet. Please contact support.'

Deno.serve(handler('verify-razorpay-payment', async (req) => {
  const body = await readJson(req)
  const orderId = str(body, 'razorpay_order_id', ORDER_ID_PATTERN)
  const paymentId = str(body, 'razorpay_payment_id', PAYMENT_ID_PATTERN)
  const signature = str(body, 'razorpay_signature', SIGNATURE_PATTERN)

  const order = await loadOrderByRazorpayId(orderId)
  if (!order) throw new PublicError(400, NOT_CONFIRMED, 'unknown_order')

  if (!(await verifyPaymentSignature(orderId, paymentId, signature))) {
    throw new PublicError(400, NOT_CONFIRMED, 'bad_signature')
  }

  const payment = await fetchPayment(paymentId)
  const result = await settlePayment(order, payment, signature)

  if (result.state === 'mismatch') {
    console.error(`[verify] payment/order mismatch (${result.reason}) for ${order.public_reference}`)
    throw new PublicError(400, NOT_CONFIRMED, 'mismatch')
  }
  if (result.state === 'failed') {
    throw new PublicError(402, 'Payment could not be completed.', 'payment_failed')
  }
  if (result.state === 'pending') {
    return json(req, 202, {
      status: 'processing',
      order_reference: order.public_reference,
      message: 'Payment verification is still processing.',
    })
  }

  const token = await issueAccessToken(result.purchaseId)
  const summary = await accessSummary(token)
  return json(req, 200, {
    status: 'paid',
    access_token: token,
    order_reference: order.public_reference,
    product_name: summary?.product_name,
    amount: summary?.amount_paise,
    downloads_left: summary?.downloads_left,
    expires_at: summary?.expires_at,
  })
}))
