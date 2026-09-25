// Crypto helpers (Web Crypto only — no third-party dependencies).

const enc = new TextEncoder()

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(message)))
}

export async function sha256Hex(message: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(message)))
}

// Constant-time comparison so signature checks don't leak timing information.
export function timingSafeEqual(a: string, b: string): boolean {
  const ab = enc.encode(a)
  const bb = enc.encode(b)
  let diff = ab.length ^ bb.length
  const len = Math.max(ab.length, bb.length)
  for (let i = 0; i < len; i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0)
  return diff === 0
}

// 256-bit random access token, base64url (43 chars). Only its SHA-256 is stored.
export function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Customer-facing order reference, e.g. BCN-7K2QX9M4TA (Crockford base32, ~50 bits).
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
export function randomReference(prefix = 'BCN'): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10))
  return `${prefix}-${[...bytes].map((b) => ALPHABET[b % 32]).join('')}`
}

export const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/
