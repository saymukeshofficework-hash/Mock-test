// POST { token } → { url, expires_in, downloads_left }
//
// Hashes the token, then bridge_consume_download() atomically checks: purchase exists,
// active, order paid, product matches, not expired, under the download limit — and
// only then increments download_count. The PDF itself lives in a PRIVATE bucket; the
// customer only ever receives a short-lived signed URL.
//
// Phase 2 (buyer watermarking) hooks in at deliverFile(): generate a stamped copy
// (name / email / order reference) and sign that instead of the master file.
import { config } from '../_shared/config.ts'
import { sha256Hex, TOKEN_PATTERN } from '../_shared/crypto.ts'
import { db } from '../_shared/db.ts'
import { handler, json, PublicError, readJson } from '../_shared/http.ts'
import { str } from '../_shared/validate.ts'

const REASONS: Record<string, [number, string]> = {
  invalid: [404, 'This download link is not valid. Please use "Check Payment Status" or contact support.'],
  disabled: [403, 'Access for this purchase has been disabled. Please contact support.'],
  not_paid: [402, 'We could not confirm your payment yet. Please contact support.'],
  expired: [410, 'Your download link has expired. Please request a new one.'],
  limit: [429, 'Download limit reached. Please contact support if you need more downloads.'],
}

type Consume = {
  ok: boolean
  reason: string
  file_bucket: string
  file_path: string
  downloads_left: number
  buyer_name: string
  buyer_email: string
  order_reference: string
}

async function deliverFile(c: Consume): Promise<string | null> {
  const bucket = c.file_bucket || config.storageBucket()
  const path = c.file_path || config.productFilePath()
  const { data, error } = await db().storage
    .from(bucket)
    .createSignedUrl(path, config.downloadUrlExpirySeconds(), { download: config.downloadFileName() })
  if (error || !data?.signedUrl) {
    console.error(`[create-download-link] sign failed: ${error?.message ?? 'no url'}`)
    return null
  }
  return data.signedUrl
}

Deno.serve(handler('create-download-link', async (req) => {
  const body = await readJson(req)
  const token = str(body, 'token', TOKEN_PATTERN)
  const tokenHash = await sha256Hex(token)

  const { data, error } = await db().rpc('bridge_consume_download', { p_token_hash: tokenHash })
  if (error) throw new Error(`consume rpc: ${error.message}`)
  const c = (data as Consume[])[0]
  if (!c?.ok) {
    const [status, message] = REASONS[c?.reason ?? 'invalid'] ?? REASONS.invalid
    throw new PublicError(status, message, c?.reason ?? 'invalid')
  }

  const url = await deliverFile(c)
  if (!url) {
    // Don't charge the customer a download for our failure: give it back.
    const { data: pu } = await db().from('purchases')
      .select('id, download_count').eq('access_token_hash', tokenHash).maybeSingle()
    if (pu && pu.download_count > 0) {
      await db().from('purchases').update({ download_count: pu.download_count - 1 }).eq('id', pu.id)
    }
    throw new PublicError(503, 'Download is temporarily unavailable. Please try again in a few minutes or contact support.', 'file_unavailable')
  }

  return json(req, 200, {
    url,
    expires_in: config.downloadUrlExpirySeconds(),
    downloads_left: c.downloads_left,
  })
}))
