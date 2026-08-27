// Deployed as one of several sibling projects on a shared GitHub Pages
// site, mounted under a `/mukesh-singh-dahiya` sub-path. Resolve the base
// at runtime so router basename and asset() paths work regardless of the
// owner/repo prefix.
export function getPublicBase(): string {
  if (typeof window === 'undefined') return ''
  const marker = '/mukesh-singh-dahiya'
  const idx = window.location.pathname.indexOf(marker)
  return idx !== -1 ? window.location.pathname.slice(0, idx + marker.length) : ''
}

export function asset(path: string): string {
  return `${getPublicBase()}${path}`
}
