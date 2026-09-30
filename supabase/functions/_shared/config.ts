// Central server-side configuration for the Bridge Course store Edge Functions.
// Every value comes from Supabase Edge Function secrets (Dashboard -> Edge Functions ->
// Secrets, or `supabase secrets set`). Nothing here is ever sent to the browser except
// RAZORPAY_KEY_ID, which Razorpay Checkout needs and is public by design.

function str(name: string, fallback?: string): string {
  const v = Deno.env.get(name)?.trim()
  if (v) return v
  if (fallback !== undefined) return fallback
  throw new ConfigError(name)
}

function int(name: string, fallback: number): number {
  const raw = Deno.env.get(name)?.trim()
  if (!raw) return fallback
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export class ConfigError extends Error {
  constructor(name: string) {
    super(`Missing required secret: ${name}`)
    this.name = 'ConfigError'
  }
}

export const config = {
  razorpayKeyId: () => str('RAZORPAY_KEY_ID'),
  razorpayKeySecret: () => str('RAZORPAY_KEY_SECRET'),
  razorpayWebhookSecret: () => str('RAZORPAY_WEBHOOK_SECRET'),

  productSlug: () => str('PRODUCT_SLUG', 'bridge-course-notes'),
  // Consistency guard only: the price actually charged always comes from the
  // products table. If the two disagree, order creation refuses to run.
  productAmountPaise: () => int('PRODUCT_AMOUNT_PAISE', 19900),
  productCurrency: () => str('PRODUCT_CURRENCY', 'INR'),
  // Every product that may be sold, slug → expected price in paise. A slug not listed
  // here cannot be bought even if a products row exists. Override with the secret
  // PRODUCT_PRICES="slug:paise,slug:paise" (PRODUCT_SLUG/PRODUCT_AMOUNT_PAISE still
  // apply to the main product).
  productPrices: (): Record<string, number> => {
    const prices: Record<string, number> = { 'teaching-plan-copy': 2900 }
    for (const pair of (Deno.env.get('PRODUCT_PRICES') ?? '').split(',')) {
      const [slug, paise] = pair.split(':').map((x) => x.trim())
      const n = Number.parseInt(paise ?? '', 10)
      if (slug && Number.isFinite(n) && n > 0) prices[slug] = n
    }
    prices[config.productSlug()] = config.productAmountPaise()
    return prices
  },

  storageBucket: () => str('STORAGE_BUCKET', 'bridge-course-private'),
  productFilePath: () => str('PRODUCT_FILE_PATH', 'products/bridge-course-notes.pdf'),
  downloadFileName: () => str('DOWNLOAD_FILE_NAME', 'Bridge Course Notes by Rakesh Pandey.pdf'),
  downloadUrlExpirySeconds: () => int('DOWNLOAD_URL_EXPIRY_SECONDS', 300),
  maxDownloads: () => int('MAX_DOWNLOADS', 5),
  accessDays: () => int('ACCESS_TOKEN_EXPIRY_DAYS', 30),

  // Max orders one mobile number may start per hour (basic abuse protection).
  maxOrdersPerPhonePerHour: () => int('MAX_ORDERS_PER_PHONE_PER_HOUR', 10),
  // Failed "check payment status" attempts before an order is locked for recovery.
  maxLookupFailures: () => int('MAX_LOOKUP_FAILURES', 10),

  siteUrl: () => str('SITE_URL', 'https://tettesthub.in/bridge-course/'),
  allowedOrigins: (): string[] => {
    const explicit = Deno.env.get('ALLOWED_ORIGINS')
    const list = explicit
      ? explicit.split(',')
      : ['http://localhost:5173', 'http://localhost:4173']
    try {
      list.push(new URL(config.siteUrl()).origin)
    } catch {
      // ignore malformed SITE_URL; explicit ALLOWED_ORIGINS still applies
    }
    return list.map((o) => o.trim()).filter(Boolean)
  },
}
