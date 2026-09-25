// Run: deno test supabase/functions/_shared/
// Known-answer vectors were produced independently with Node's `crypto` module.
import { assert, assertEquals, assertFalse, assertMatch } from 'jsr:@std/assert@1'
import { hmacSha256Hex, randomReference, randomToken, sha256Hex, timingSafeEqual, TOKEN_PATTERN } from './crypto.ts'
import { normalisePhone } from './validate.ts'

Deno.test('payment signature = HMAC_SHA256(order_id|payment_id, secret)', async () => {
  assertEquals(
    await hmacSha256Hex('test_secret', 'order_ABC123|pay_XYZ789'),
    '85cbc6036124891c4d0280fbb7cd83804f87a66f2eb485a89af574086f592cbc',
  )
})

Deno.test('webhook signature = HMAC_SHA256(raw body, webhook secret)', async () => {
  assertEquals(
    await hmacSha256Hex('whsec', '{"event":"payment.captured"}'),
    '4673dd707ef4c41b987cb7fefe1583142dc702388c93145b7814b9ad3d3c183e',
  )
})

Deno.test('tampered payload / wrong secret produce a different signature', async () => {
  const good = await hmacSha256Hex('whsec', '{"event":"payment.captured"}')
  assertFalse(timingSafeEqual(good, await hmacSha256Hex('whsec', '{"event":"payment.captured" }')))
  assertFalse(timingSafeEqual(good, await hmacSha256Hex('other', '{"event":"payment.captured"}')))
})

Deno.test('sha256Hex matches the standard "abc" vector (same as Postgres digest())', async () => {
  assertEquals(await sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
})

Deno.test('timingSafeEqual', () => {
  assert(timingSafeEqual('abc', 'abc'))
  assertFalse(timingSafeEqual('abc', 'abd'))
  assertFalse(timingSafeEqual('abc', 'abcd'))
  assertFalse(timingSafeEqual('', 'a'))
})

Deno.test('tokens are 256-bit base64url and unique', () => {
  const seen = new Set<string>()
  for (let i = 0; i < 1000; i++) {
    const t = randomToken()
    assertMatch(t, TOKEN_PATTERN)
    seen.add(t)
  }
  assertEquals(seen.size, 1000)
})

Deno.test('order references look like BCN-XXXXXXXXXX (Crockford base32)', () => {
  for (let i = 0; i < 200; i++) assertMatch(randomReference(), /^BCN-[0-9A-HJKMNP-TV-Z]{10}$/)
})

Deno.test('normalisePhone', () => {
  assertEquals(normalisePhone('9876543210'), '9876543210')
  assertEquals(normalisePhone('+91 98765 43210'), '9876543210')
  assertEquals(normalisePhone('09876543210'), '9876543210')
  assertEquals(normalisePhone('1234567890'), null)
  assertEquals(normalisePhone('98765'), null)
})
