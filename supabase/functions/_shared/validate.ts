// Input validation for customer-supplied fields.
import { PublicError } from './http.ts'

export type Buyer = { name: string; email: string; phone: string }

const EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[A-Za-z0-9.-]{1,185}\.[A-Za-z]{2,24}$/

// Accepts "9876543210", "+91 98765 43210", "09876543210" → "9876543210".
export function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  const ten = digits.length === 12 && digits.startsWith('91')
    ? digits.slice(2)
    : digits.length === 11 && digits.startsWith('0')
      ? digits.slice(1)
      : digits
  return /^[6-9]\d{9}$/.test(ten) ? ten : null
}

export function validateBuyer(body: Record<string, unknown>): Buyer {
  const name = typeof body.buyer_name === 'string' ? body.buyer_name.trim().replace(/\s+/g, ' ') : ''
  const email = typeof body.buyer_email === 'string' ? body.buyer_email.trim().toLowerCase() : ''
  const phoneRaw = typeof body.buyer_phone === 'string' ? body.buyer_phone : ''

  if (name.length < 2 || name.length > 80 || /[<>{}]/.test(name)) {
    throw new PublicError(400, 'Please enter your full name.', 'invalid_name')
  }
  if (!EMAIL.test(email) || email.length > 254) {
    throw new PublicError(400, 'Please enter a valid email address.', 'invalid_email')
  }
  const phone = normalisePhone(phoneRaw)
  if (!phone) {
    throw new PublicError(400, 'Please enter a valid 10-digit Indian mobile number.', 'invalid_phone')
  }
  return { name, email, phone }
}

export function str(body: Record<string, unknown>, key: string, pattern: RegExp): string {
  const v = body[key]
  if (typeof v !== 'string' || !pattern.test(v)) {
    throw new PublicError(400, 'Invalid request.', 'bad_request')
  }
  return v
}
