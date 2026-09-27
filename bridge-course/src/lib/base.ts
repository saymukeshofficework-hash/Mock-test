// Deployed on the shared GitHub Pages site under a `/bridge-course` sub-path (same
// pattern as the sibling apps). Resolve the base at runtime so the router basename
// and asset paths work on the custom domain, a repo-prefixed Pages URL, or localhost.
const MARKER = '/bridge-course'

export function getPublicBase(): string {
  if (typeof window === 'undefined') return ''
  const idx = window.location.pathname.indexOf(MARKER)
  return idx !== -1 ? window.location.pathname.slice(0, idx + MARKER.length) : ''
}

export function asset(path: string): string {
  return `${getPublicBase()}/${path.replace(/^\//, '')}`
}

export function absoluteUrl(path = ''): string {
  return `${window.location.origin}${getPublicBase()}/${path.replace(/^\//, '')}`
}
