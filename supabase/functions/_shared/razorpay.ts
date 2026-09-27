// Minimal Razorpay REST client + signature verification (Orders API v1).
//   Payment signature  = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
//   Webhook signature  = HMAC_SHA256(raw request body, webhook_secret)
// Both compared in constant time. See docs/RAZORPAY_SETUP.md.
import { config } from './config.ts'
import { hmacSha256Hex, timingSafeEqual } from './crypto.ts'

const API = 'https://api.razorpay.com/v1'

export type RazorpayOrder = { id: string; amount: number; currency: string; status: string; receipt?: string }
export type RazorpayPayment = {
  id: string
  order_id: string | null
  amount: number
  currency: string
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
  method?: string
  email?: string
  contact?: string
  captured?: boolean
}

function authHeader(): string {
  return 'Basic ' + btoa(`${config.razorpayKeyId()}:${config.razorpayKeySecret()}`)
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    // Log Razorpay's error code/description only — never the auth header.
    const e = (data as { error?: { code?: string; description?: string } }).error
    throw new Error(`Razorpay ${method} ${path.split('/')[1]} failed: ${res.status} ${e?.code ?? ''} ${e?.description ?? ''}`)
  }
  return data as T
}

export function createOrder(amount: number, currency: string, receipt: string, notes: Record<string, string>) {
  return call<RazorpayOrder>('POST', '/orders', { amount, currency, receipt, notes })
}

export function fetchPayment(paymentId: string) {
  return call<RazorpayPayment>('GET', `/payments/${encodeURIComponent(paymentId)}`)
}

export async function fetchOrderPayments(orderId: string): Promise<RazorpayPayment[]> {
  const res = await call<{ items: RazorpayPayment[] }>('GET', `/orders/${encodeURIComponent(orderId)}/payments`)
  return res.items ?? []
}

export function capturePayment(paymentId: string, amount: number, currency: string) {
  return call<RazorpayPayment>('POST', `/payments/${encodeURIComponent(paymentId)}/capture`, { amount, currency })
}

export async function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): Promise<boolean> {
  const expected = await hmacSha256Hex(config.razorpayKeySecret(), `${orderId}|${paymentId}`)
  return timingSafeEqual(expected, signature)
}

export async function verifyWebhookSignature(rawBody: string, signature: string): Promise<boolean> {
  const expected = await hmacSha256Hex(config.razorpayWebhookSecret(), rawBody)
  return timingSafeEqual(expected, signature)
}

export const ORDER_ID_PATTERN = /^order_[A-Za-z0-9]{6,40}$/
export const PAYMENT_ID_PATTERN = /^pay_[A-Za-z0-9]{6,40}$/
export const SIGNATURE_PATTERN = /^[a-f0-9]{64}$/
