// ca-ingest: lets a scheduled ChatGPT task publish Daily Current Affairs into public.ca_days.
//
//   POST  /ca-ingest              body = day JSON  -> validate, merge into today's row, upsert
//   GET   /ca-ingest?day=YYYY-MM-DD               -> that day's row
//   GET   /ca-ingest?days=3                       -> latest N rows (default 3, max 14)
//
// Auth: "Authorization: Bearer <CA_INGEST_TOKEN>" (Edge Function secret). The table itself stays
// locked (RLS, no policies); only this function writes to it, using the service-role key that
// Supabase injects automatically.

import { createClient } from 'npm:@supabase/supabase-js@2'

const CATS = new Set([
  'appointments', 'awards', 'days', 'defence', 'economy', 'environment', 'other',
  'polity', 'relations', 'reports', 'schemes', 'science', 'sports',
])
const REGIONS = new Set(['mp', 'india', 'world'])
const MAX_BODY_BYTES = 500_000
const MAX_ITEMS = 60
const MAX_QUIZ = 30

const enc = new TextEncoder()

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

function timingSafeEqual(a: string, b: string): boolean {
  const ab = enc.encode(a)
  const bb = enc.encode(b)
  let diff = ab.length ^ bb.length
  for (let i = 0; i < Math.max(ab.length, bb.length); i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0)
  return diff === 0
}

// deno-lint-ignore no-explicit-any
type Any = any

const isObj = (v: Any) => v !== null && typeof v === 'object' && !Array.isArray(v)
const str = (v: Any) => typeof v === 'string' && v.trim().length > 0
const bi = (v: Any, max = 2000) => isObj(v) && str(v.en) && str(v.hi) && v.en.length <= max && v.hi.length <= max
const biList = (v: Any, min: number, max: number) =>
  isObj(v) && Array.isArray(v.en) && Array.isArray(v.hi) &&
  v.en.length === v.hi.length && v.en.length >= min && v.en.length <= max &&
  [...v.en, ...v.hi].every((s: Any) => str(s) && s.length <= 1000)

function validDay(day: Any): boolean {
  if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false
  const d = new Date(day + 'T00:00:00Z')
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === day
}

function validateItem(it: Any, n: number): string | null {
  const at = `items[${n}]`
  if (!isObj(it)) return `${at} must be an object`
  if (!str(it.id) || !/^[a-z]{2,3}-\d{1,3}$/.test(it.id)) return `${at}.id must look like mp-1, in-2, wd-3`
  if (!CATS.has(it.cat)) return `${at}.cat "${it.cat}" not allowed`
  if (!REGIONS.has(it.region)) return `${at}.region "${it.region}" not allowed`
  if (!bi(it.title, 200)) return `${at}.title needs en and hi`
  if (!bi(it.summary, 1200)) return `${at}.summary needs en and hi`
  if (!biList(it.points, 1, 8)) return `${at}.points needs equal-length en and hi arrays (1-8)`
  if (!Array.isArray(it.sources) || it.sources.length < 1 || it.sources.length > 6) return `${at}.sources needs 1-6 entries`
  for (const s of it.sources) {
    if (!isObj(s) || !str(s.name)) return `${at}.sources[].name missing`
    try {
      const u = new URL(s.url)
      if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error()
    } catch {
      return `${at}.sources[].url must be a valid http(s) URL`
    }
  }
  return null
}

function validateQuiz(q: Any, n: number): string | null {
  const at = `quiz[${n}]`
  if (!isObj(q)) return `${at} must be an object`
  if (!bi(q.q, 500)) return `${at}.q needs en and hi`
  if (!isObj(q.o) || !Array.isArray(q.o.en) || !Array.isArray(q.o.hi) || q.o.en.length !== 4 || q.o.hi.length !== 4 ||
    ![...q.o.en, ...q.o.hi].every((s: Any) => str(s) && s.length <= 300)) return `${at}.o needs exactly 4 en and 4 hi options`
  if (!Number.isInteger(q.a) || q.a < 0 || q.a > 3) return `${at}.a must be an integer 0-3`
  if (!bi(q.exp, 600)) return `${at}.exp needs en and hi`
  return null
}

// Returns an error string, or null when the payload is a valid day document.
function validate(d: Any): string | null {
  if (!isObj(d)) return 'body must be a JSON object'
  if (!validDay(d.day)) return 'day must be a real date, YYYY-MM-DD'
  if (!bi(d.title, 200)) return 'title needs en and hi'
  if (!Array.isArray(d.items) || d.items.length < 1 || d.items.length > MAX_ITEMS) return `items must have 1-${MAX_ITEMS} entries`
  const ids = new Set<string>()
  for (let i = 0; i < d.items.length; i++) {
    const e = validateItem(d.items[i], i)
    if (e) return e
    if (ids.has(d.items[i].id)) return `duplicate item id ${d.items[i].id}`
    ids.add(d.items[i].id)
  }
  if (!Array.isArray(d.quiz) || d.quiz.length > MAX_QUIZ) return `quiz must be an array (max ${MAX_QUIZ})`
  for (let i = 0; i < d.quiz.length; i++) {
    const e = validateQuiz(d.quiz[i], i)
    if (e) return e
  }
  if (!biList(d.oneliners, 0, 40)) return 'oneliners needs equal-length en and hi arrays (max 40)'
  return null
}

// Merge an incoming day document into the stored one so a later run never wipes earlier work:
// items with the same id are replaced (allows corrections), new ids are appended; quiz questions
// are de-duplicated by English text; one-liners are unioned in order (en/hi kept as pairs).
function merge(old: Any, inc: Any): Any {
  if (!old) return inc
  const items = new Map<string, Any>()
  for (const it of old.items ?? []) items.set(it.id, it)
  for (const it of inc.items) items.set(it.id, it)

  const quiz = [...(old.quiz ?? [])]
  const seenQ = new Set(quiz.map((q: Any) => q.q?.en?.trim().toLowerCase()))
  for (const q of inc.quiz) {
    const k = q.q.en.trim().toLowerCase()
    if (!seenQ.has(k)) { quiz.push(q); seenQ.add(k) }
  }

  const en: string[] = [...(old.oneliners?.en ?? [])]
  const hi: string[] = [...(old.oneliners?.hi ?? [])]
  const seenO = new Set(en.map((s) => s.trim().toLowerCase()))
  inc.oneliners.en.forEach((s: string, i: number) => {
    const k = s.trim().toLowerCase()
    if (!seenO.has(k)) { en.push(s); hi.push(inc.oneliners.hi[i]); seenO.add(k) }
  })

  return { day: inc.day, title: inc.title, items: [...items.values()], quiz, oneliners: { en, hi } }
}

// Keep only the keys the site reads (drops "edition" and anything else).
const clean = (d: Any) => ({ day: d.day, title: d.title, items: d.items, quiz: d.quiz, oneliners: d.oneliners })

Deno.serve(async (req) => {
  const token = Deno.env.get('CA_INGEST_TOKEN')?.trim()
  if (!token) return json({ error: 'server not configured' }, 500)

  const m = /^Bearer\s+(.+)$/i.exec(req.headers.get('authorization') ?? '')
  if (!m || !timingSafeEqual(m[1].trim(), token)) return json({ error: 'unauthorized' }, 401)

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  })

  const url = new URL(req.url)

  if (req.method === 'GET') {
    const day = url.searchParams.get('day')
    if (day) {
      if (!validDay(day)) return json({ error: 'day must be YYYY-MM-DD' }, 400)
      const { data, error } = await db.from('ca_days').select('day,items,updated_at,data').eq('day', day).maybeSingle()
      if (error) return json({ error: error.message }, 500)
      return json({ row: data })
    }
    const n = Math.min(Math.max(parseInt(url.searchParams.get('days') ?? '3', 10) || 3, 1), 14)
    const { data, error } = await db.from('ca_days').select('day,items,updated_at,data').order('day', { ascending: false }).limit(n)
    if (error) return json({ error: error.message }, 500)
    return json({ rows: data })
  }

  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  const raw = await req.text()
  if (enc.encode(raw).length > MAX_BODY_BYTES) return json({ error: 'body too large' }, 413)
  let body: Any
  try { body = JSON.parse(raw) } catch { return json({ error: 'invalid JSON' }, 400) }

  const bad = validate(body)
  if (bad) return json({ error: 'validation failed', detail: bad }, 422)

  // Never accept a day more than 2 days away from today (IST), so a wrong date can't create junk rows.
  const todayIst = new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10)
  const gap = Math.abs((Date.parse(body.day) - Date.parse(todayIst)) / 86_400_000)
  if (gap > 2) return json({ error: 'day too far from today (IST)', today_ist: todayIst }, 422)

  const { data: existing, error: readErr } = await db.from('ca_days').select('data').eq('day', body.day).maybeSingle()
  if (readErr) return json({ error: readErr.message }, 500)

  const merged = merge(existing?.data ?? null, clean(body))
  const { error: writeErr } = await db.from('ca_days').upsert(
    { day: merged.day, data: merged, items: merged.items.length, updated_at: new Date().toISOString() },
    { onConflict: 'day' },
  )
  if (writeErr) return json({ error: writeErr.message }, 500)

  return json({
    ok: true,
    day: merged.day,
    merged_with_existing: !!existing,
    items: merged.items.length,
    quiz: merged.quiz.length,
    oneliners: merged.oneliners.en.length,
  })
})
