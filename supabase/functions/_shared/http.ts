// Request/response helpers shared by the Bridge Course Edge Functions: CORS,
// JSON responses, the publishable-key gate, and customer-safe error handling.
import { config } from './config.ts'

export class PublicError extends Error {
  // `message` is shown to the customer as-is, so keep it simple and non-technical.
  constructor(public status: number, message: string, public code = 'error') {
    super(message)
    this.name = 'PublicError'
  }
}

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? ''
  const allowed = config.allowedOrigins()
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[allowed.length - 1] ?? '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'apikey, content-type, x-client-info, authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

export function json(req: Request, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

// The publishable key is public, so this is not authentication — it just stops
// drive-by traffic that isn't coming from our own frontend. Real protection lives in
// each function's own checks (signatures, token hashes, DB-side price).
export function requirePublishableKey(req: Request): void {
  const presented = req.headers.get('apikey') ?? ''
  const known: string[] = []
  const anon = Deno.env.get('SUPABASE_ANON_KEY')
  if (anon) known.push(anon)
  const publishable = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')
  if (publishable) {
    try {
      known.push(...Object.values(JSON.parse(publishable) as Record<string, string>))
    } catch {
      // ignore malformed env
    }
  }
  if (known.length > 0 && !known.includes(presented)) {
    throw new PublicError(401, 'Unauthorized request.', 'unauthorized')
  }
}

export async function readJson(req: Request, maxBytes = 4096): Promise<Record<string, unknown>> {
  const text = await req.text()
  if (text.length > maxBytes) throw new PublicError(413, 'Request too large.', 'too_large')
  try {
    const parsed = JSON.parse(text)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
  } catch {
    // fall through
  }
  throw new PublicError(400, 'Invalid request.', 'bad_request')
}

// Wraps a handler with CORS preflight, method check and safe error handling:
// PublicErrors reach the customer; anything else is logged (name + message only)
// and replaced with a generic message — no stack traces, SQL or secrets leak out.
export function handler(
  name: string,
  fn: (req: Request) => Promise<Response>,
  opts: { publicKeyGate?: boolean } = { publicKeyGate: true },
) {
  return async (req: Request): Promise<Response> => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })
    if (req.method !== 'POST') return json(req, 405, { error: 'Method not allowed.' })
    try {
      if (opts.publicKeyGate !== false) requirePublishableKey(req)
      return await fn(req)
    } catch (err) {
      if (err instanceof PublicError) {
        return json(req, err.status, { error: err.message, code: err.code })
      }
      const e = err as Error
      console.error(`[${name}] ${e?.name ?? 'Error'}: ${e?.message ?? String(err)}`)
      return json(req, 500, {
        error: 'Something went wrong. Please try again, or contact support if money was deducted.',
        code: 'server_error',
      })
    }
  }
}
