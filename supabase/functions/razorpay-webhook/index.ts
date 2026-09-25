// Razorpay webhook receiver. Configure in Razorpay Dashboard → Webhooks with URL
//   https://<project-ref>.supabase.co/functions/v1/razorpay-webhook
// and events: payment.captured, payment.failed, order.paid, refund.processed.
//
// * Signature: HMAC-SHA256 of the RAW body with RAZORPAY_WEBHOOK_SECRET, compared to
//   the X-Razorpay-Signature header in constant time. Bad signature → 400, nothing stored.
// * Idempotency: X-Razorpay-Event-Id is stored in webhook_events.event_id (unique). A
//   repeat of an already-processed event is acknowledged and ignored; fulfilment is
//   itself idempotent (bridge_fulfil_order), so even a race cannot duplicate a purchase.
// * Returns 5xx only for transient failures, so Razorpay retries those.
import { db, type OrderRow } from '../_shared/db.ts'
import { sha256Hex } from '../_shared/crypto.ts'
import { handler, json, PublicError } from '../_shared/http.ts'
import { loadOrderByRazorpayId, settlePayment } from '../_shared/fulfil.ts'
import { verifyWebhookSignature, type RazorpayPayment } from '../_shared/razorpay.ts'

type WebhookBody = {
  event?: string
  created_at?: number
  payload?: {
    payment?: { entity?: RazorpayPayment }
    order?: { entity?: { id?: string } }
    refund?: { entity?: { id?: string; payment_id?: string; amount?: number } }
  }
}

async function markProcessed(eventId: string, note: string) {
  await db().from('webhook_events').update({ processed: true, processing_note: note }).eq('event_id', eventId)
}

async function orderForPayment(payment: RazorpayPayment | undefined): Promise<OrderRow | null> {
  if (!payment?.order_id) return null
  return await loadOrderByRazorpayId(payment.order_id)
}

Deno.serve(handler('razorpay-webhook', async (req) => {
  const raw = await req.text()
  if (raw.length > 256 * 1024) throw new PublicError(413, 'Too large', 'too_large')
  const signature = req.headers.get('x-razorpay-signature') ?? ''
  if (!signature || !(await verifyWebhookSignature(raw, signature))) {
    console.warn('[razorpay-webhook] rejected: invalid signature')
    throw new PublicError(400, 'Invalid signature', 'bad_signature')
  }

  const body = JSON.parse(raw) as WebhookBody
  const eventType = body.event ?? 'unknown'
  const eventId = req.headers.get('x-razorpay-event-id') || `derived_${await sha256Hex(raw)}`

  // Store first; unique(event_id) makes duplicates visible.
  const { error: insErr } = await db()
    .from('webhook_events')
    .insert({ event_id: eventId, event_type: eventType, payload: body })
  if (insErr) {
    if (insErr.code !== '23505') throw new Error(`store event: ${insErr.message}`)
    const { data: existing } = await db()
      .from('webhook_events').select('processed').eq('event_id', eventId).maybeSingle()
    if (existing?.processed) return json(req, 200, { ok: true, duplicate: true })
    // stored earlier but not processed (previous attempt failed) → process again below
  }

  const payment = body.payload?.payment?.entity

  switch (eventType) {
    case 'payment.captured':
    case 'order.paid': {
      const order = await orderForPayment(payment)
      if (!order || !payment) {
        await markProcessed(eventId, 'ignored: order not found')
        break
      }
      const result = await settlePayment(order, payment, null)
      await markProcessed(eventId, `settle: ${result.state}${result.state === 'mismatch' ? ':' + result.reason : ''}`)
      break
    }
    case 'payment.failed': {
      const order = await orderForPayment(payment)
      if (order && payment && (order.status === 'created' || order.status === 'payment_pending')) {
        await db().from('orders').update({ status: 'failed' }).eq('id', order.id).in('status', ['created', 'payment_pending'])
        await db().from('payments').upsert({
          order_id: order.id,
          razorpay_payment_id: payment.id,
          razorpay_order_id: order.razorpay_order_id,
          amount_paise: payment.amount,
          currency: payment.currency,
          status: 'failed',
          method: payment.method ?? null,
          email: payment.email ?? null,
          phone: payment.contact ?? null,
        }, { onConflict: 'razorpay_payment_id', ignoreDuplicates: true })
      }
      await markProcessed(eventId, order ? 'marked failed (if not paid)' : 'ignored: order not found')
      break
    }
    case 'refund.processed': {
      const refund = body.payload?.refund?.entity
      const order = await orderForPayment(payment)
      if (order && refund && (refund.amount ?? 0) >= order.amount_paise) {
        await db().from('orders').update({ status: 'refunded' }).eq('id', order.id)
        await db().from('purchases').update({ active: false }).eq('order_id', order.id)
        await markProcessed(eventId, 'full refund: order refunded, access disabled')
      } else {
        await markProcessed(eventId, 'partial refund or unknown order: no access change')
      }
      break
    }
    default:
      await markProcessed(eventId, 'ignored event type')
  }

  return json(req, 200, { ok: true })
}, { publicKeyGate: false }))
