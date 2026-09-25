// POST { buyer_name, buyer_email, buyer_phone, product_slug }
// → { razorpay_order_id, razorpay_key_id, amount, currency, internal_order_reference, product_name }
//
// The amount is read from the products table. Nothing the browser sends can change
// it: there is no amount field, and product_slug must be the one product on sale.
import { config } from '../_shared/config.ts'
import { randomReference } from '../_shared/crypto.ts'
import { db, type ProductRow } from '../_shared/db.ts'
import { handler, json, PublicError, readJson } from '../_shared/http.ts'
import { createOrder } from '../_shared/razorpay.ts'
import { validateBuyer } from '../_shared/validate.ts'

const START_FAILED = 'Unable to start payment. Please try again.'

Deno.serve(handler('create-razorpay-order', async (req) => {
  const body = await readJson(req)
  const buyer = validateBuyer(body)

  const slug = typeof body.product_slug === 'string' ? body.product_slug : ''
  if (slug !== config.productSlug()) {
    throw new PublicError(400, 'This product is not available.', 'invalid_product')
  }

  const { data: product, error: productErr } = await db()
    .from('products')
    .select('id, slug, name, amount_paise, currency, active')
    .eq('slug', slug)
    .maybeSingle<ProductRow>()
  if (productErr) throw new Error(`load product: ${productErr.message}`)
  if (!product || !product.active) {
    throw new PublicError(400, 'This product is not available right now.', 'inactive_product')
  }
  if (product.amount_paise !== config.productAmountPaise() || product.currency !== config.productCurrency()) {
    // Price in the DB and the configured price disagree — refuse rather than charge
    // an unexpected amount. See docs/BRIDGE_COURSE_IMPLEMENTATION.md "Changing the price".
    throw new Error('product price does not match PRODUCT_AMOUNT_PAISE/PRODUCT_CURRENCY')
  }

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count, error: countErr } = await db()
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('buyer_phone', buyer.phone)
    .gte('created_at', since)
  if (countErr) throw new Error(`rate check: ${countErr.message}`)
  if ((count ?? 0) >= config.maxOrdersPerPhonePerHour()) {
    throw new PublicError(429, 'Too many attempts. Please wait a while and try again, or contact support.', 'rate_limited')
  }

  const reference = randomReference()
  const { data: order, error: insertErr } = await db()
    .from('orders')
    .insert({
      public_reference: reference,
      product_id: product.id,
      buyer_name: buyer.name,
      buyer_email: buyer.email,
      buyer_phone: buyer.phone,
      amount_paise: product.amount_paise,
      currency: product.currency,
      status: 'created',
    })
    .select('id')
    .single()
  if (insertErr) throw new Error(`insert order: ${insertErr.message}`)

  let rzpOrderId: string
  try {
    const rzp = await createOrder(product.amount_paise, product.currency, reference, {
      order_reference: reference,
      product_slug: product.slug,
    })
    if (rzp.amount !== product.amount_paise || rzp.currency !== product.currency) {
      throw new Error('Razorpay order amount mismatch')
    }
    rzpOrderId = rzp.id
  } catch (err) {
    await db().from('orders').update({ status: 'cancelled' }).eq('id', order.id)
    console.error(`[create-razorpay-order] ${(err as Error).message}`)
    throw new PublicError(502, START_FAILED, 'gateway_error')
  }

  const { error: updErr } = await db()
    .from('orders')
    .update({ razorpay_order_id: rzpOrderId, status: 'payment_pending' })
    .eq('id', order.id)
  if (updErr) throw new Error(`save razorpay order id: ${updErr.message}`)

  return json(req, 200, {
    razorpay_order_id: rzpOrderId,
    razorpay_key_id: config.razorpayKeyId(),
    amount: product.amount_paise,
    currency: product.currency,
    internal_order_reference: reference,
    product_name: product.name,
  })
}))
