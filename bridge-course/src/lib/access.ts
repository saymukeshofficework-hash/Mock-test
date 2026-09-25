// Keeps the customer's access token and last order reference on THIS device so the
// success page survives a refresh and a closed tab can be recovered. The token alone
// never unlocks anything client-side — every download is checked by the server.

const ACCESS_KEY = 'bc_access_v1'
const PENDING_KEY = 'bc_pending_v1'

export type StoredAccess = { token: string; orderReference: string; savedAt: number }
export type PendingOrder = { orderReference: string; email: string; phone: string; createdAt: number }

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // private mode / storage disabled — the flow still works for this page view
  }
}

export const access = {
  get: () => read<StoredAccess>(ACCESS_KEY),
  save: (token: string, orderReference: string) =>
    write(ACCESS_KEY, { token, orderReference, savedAt: Date.now() } satisfies StoredAccess),
  clear: () => {
    try {
      localStorage.removeItem(ACCESS_KEY)
    } catch {
      // ignore
    }
  },
  getPending: () => read<PendingOrder>(PENDING_KEY),
  savePending: (p: Omit<PendingOrder, 'createdAt'>) => write(PENDING_KEY, { ...p, createdAt: Date.now() }),
}

// Links sent by the admin look like …/success#t=<token>. Read it once, store it, and
// strip it from the address bar so it isn't left in history or screenshots.
export function takeTokenFromHash(): string | null {
  const m = window.location.hash.match(/[#&]t=([A-Za-z0-9_-]{43})/)
  if (!m) return null
  history.replaceState(null, '', window.location.pathname + window.location.search)
  return m[1]
}
