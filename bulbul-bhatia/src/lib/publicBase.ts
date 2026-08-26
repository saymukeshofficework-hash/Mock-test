// This app is deployed as one of several sibling projects on a shared
// GitHub Pages site, mounted under a `/bulbul-bhatia` sub-path whose exact
// prefix (repo/owner) isn't known at build time. Because client-side
// routing changes the visible URL without reloading the document, a
// root-absolute asset path like `/images/x.webp` would resolve against
// the domain root and 404 once the router has navigated deeper than one
// level. `asset()` resolves it against the app's actual mount point
// instead, computed at runtime from the current location.
export function getPublicBase(): string {
  if (typeof window === 'undefined') return ''
  const marker = '/bulbul-bhatia'
  const idx = window.location.pathname.indexOf(marker)
  return idx !== -1 ? window.location.pathname.slice(0, idx + marker.length) : ''
}

export function asset(path: string): string {
  return `${getPublicBase()}${path}`
}
