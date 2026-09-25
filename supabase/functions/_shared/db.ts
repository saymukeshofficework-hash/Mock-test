// Service-role Supabase client. Runs ONLY inside Edge Functions; the secret key is
// provided by the platform as an environment variable and never leaves the server.
import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2'

let client: SupabaseClient | null = null

function secretKey(): string {
  const keys = Deno.env.get('SUPABASE_SECRET_KEYS')
  if (keys) {
    try {
      const parsed = JSON.parse(keys) as Record<string, string>
      if (parsed.default) return parsed.default
    } catch {
      // fall back to the legacy variable below
    }
  }
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!legacy) throw new Error('Server key not available')
  return legacy
}

export function db(): SupabaseClient {
  if (!client) {
    client = createClient(Deno.env.get('SUPABASE_URL')!, secretKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return client
}

export type OrderRow = {
  id: string
  public_reference: string
  product_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  amount_paise: number
  currency: string
  razorpay_order_id: string | null
  status: 'created' | 'payment_pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
  lookup_failures: number
}

export type ProductRow = {
  id: string
  slug: string
  name: string
  amount_paise: number
  currency: string
  active: boolean
}
