// Fails the build if the built site could leak a secret or the paid PDF.
// Run after `vite build`: `npm run check:bundle` (also runs in GitHub Actions).
import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const dist = path.resolve(process.argv[2] ?? 'dist')

const FORBIDDEN_TEXT = [
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SECRET_KEY',
  'bridge-course-private',
  'products/bridge-course-notes.pdf',
]

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(p)
    else yield p
  }
}

function jwtRoles(text) {
  const roles = []
  for (const m of text.matchAll(/eyJ[A-Za-z0-9_-]+\.(eyJ[A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g)) {
    try {
      roles.push(JSON.parse(Buffer.from(m[1], 'base64url').toString()).role)
    } catch {
      // not a JWT
    }
  }
  return roles
}

const problems = []
let files = 0
for await (const file of walk(dist)) {
  files++
  const rel = path.relative(dist, file)
  if (/\.pdf$/i.test(rel)) problems.push(`${rel}: PDF files must never be in the public build`)
  if (/\.map$/i.test(rel)) problems.push(`${rel}: source maps must not be published`)
  if ((await stat(file)).size > 5 * 1024 * 1024) problems.push(`${rel}: unexpectedly large file`)
  if (!/\.(js|css|html|json|txt|svg|webmanifest)$/i.test(rel)) continue
  const text = await readFile(file, 'utf8')
  for (const needle of FORBIDDEN_TEXT) {
    if (text.includes(needle)) problems.push(`${rel}: contains "${needle}"`)
  }
  // supabase-js itself contains the literal prefix "sb_secret_"; only a real key value is a leak.
  if (/sb_secret_[A-Za-z0-9_-]{12,}/.test(text)) problems.push(`${rel}: contains a Supabase secret key`)
  for (const role of jwtRoles(text)) {
    if (role && role !== 'anon') problems.push(`${rel}: contains a Supabase JWT with role "${role}"`)
  }
  if (/rzp_live_[A-Za-z0-9]{8,}/.test(text)) {
    console.warn(`note: ${rel} contains a LIVE Razorpay key id (public, but confirm live mode is intended)`)
  }
}

// Our own frontend code must never ask Storage for a public URL (the library has the
// method, so this is checked on src/ rather than the bundle).
for await (const file of walk(path.resolve(dist, '../src'))) {
  if ((await readFile(file, 'utf8')).includes('getPublicUrl')) {
    problems.push(`${path.relative(process.cwd(), file)}: uses getPublicUrl()`)
  }
}

if (files === 0) problems.push(`no files found in ${dist} — run the build first`)

if (problems.length) {
  console.error('Bundle check FAILED:\n  ' + problems.join('\n  '))
  process.exit(1)
}
console.log(`Bundle check passed: ${files} files scanned, no secrets, no PDFs, no source maps.`)
