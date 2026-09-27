// Thin client for the Bridge Course Edge Functions. Only the public (publishable) key
// is ever used here, sent on the `apikey` header as Supabase requires for sb_publishable_
// keys. All money / access decisions are made server-side.
import { site } from '../config'

export class ApiError extends Error {
  constructor(message: string, public status: number, public code: string) {
    super(message)
  }
}

const GENERIC = 'Something went wrong. Please try again.'

async function call<T>(fn: string, body: unknown): Promise<{ status: number; data: T }> {
  let res: Response
  try {
    res = await fetch(`${site.supabaseUrl}/functions/v1/${fn}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: site.supabasePublishableKey },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Network problem. Please check your internet connection and try again.', 0, 'network')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const d = data as { error?: string; code?: string }
    throw new ApiError(d.error || GENERIC, res.status, d.code || 'error')
  }
  return { status: res.status, data: data as T }
}

export type CreateOrderResponse = {
  razorpay_order_id: string
  razorpay_key_id: string
  amount: number
  currency: string
  internal_order_reference: string
  product_name: string
}

export type AccessResponse = {
  status: 'paid' | 'processing' | 'failed' | 'unpaid' | 'refunded' | 'cancelled'
  access_token?: string
  order_reference: string
  product_name?: string
  amount?: number
  downloads_left?: number
  expires_at?: string
  message?: string
}

export type TokenStatus = {
  status: 'active' | 'disabled' | 'not_paid' | 'expired' | 'limit'
  downloads_left: number
  expires_at: string
  product_name: string
  amount: number
  order_reference: string
}

export const api = {
  createOrder: (buyer: { buyer_name: string; buyer_email: string; buyer_phone: string }, productSlug: string) =>
    call<CreateOrderResponse>('create-razorpay-order', { ...buyer, product_slug: productSlug }),

  verifyPayment: (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    call<AccessResponse>('verify-razorpay-payment', r),

  recover: (orderReference: string, contact: string) =>
    call<AccessResponse>('order-status', { order_reference: orderReference, contact }),

  tokenStatus: (token: string) => call<TokenStatus>('order-status', { token }),

  downloadLink: (token: string) =>
    call<{ url: string; expires_in: number; downloads_left: number }>('create-download-link', { token }),
}
