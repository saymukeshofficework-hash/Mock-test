const paths: Record<string, string> = {
  leaf: 'M11 20A7 7 0 0 1 4 13V7a7 7 0 0 1 7-7h6a1 1 0 0 1 1 1v6a7 7 0 0 1-7 7Zm0 0v3M4 13c6-1 8-3 12-9',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V4a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 0 4 5.5v14Z',
  clock: 'M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  graduation: 'm22 10-10-5L2 10l10 5 10-5Zm-4 2v5c0 1.5-2.5 3-6 3s-6-1.5-6-3v-5',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c2.5-2.5 3.5-5.5 3.5-9S14.5 4.5 12 2m0 19c-2.5-2.5-3.5-5.5-3.5-9S9.5 4.5 12 2M3.5 9h17M3.5 15h17',
  search: 'm21 21-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  x: 'M18 6 6 18M6 6l12 12',
  sun: 'M12 3v2m0 14v2m9-9h-2M5 12H3m14.95 6.95-1.41-1.41M6.46 6.46 5.05 5.05m13.9 0-1.41 1.41M6.46 17.54l-1.41 1.41M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z',
  lock: 'M6 11V8a6 6 0 1 1 12 0v3m-13 0h14v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9Z',
  chevronDown: 'm6 9 6 6 6-6',
  chevronRight: 'm9 18 6-6-6-6',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  check: 'M20 6 9 17l-5-5',
  calc: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 5h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01',
  flask: 'M9 3h6M10 3v6l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  phone: 'M22 16.9v2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 3.2 2 2 0 0 1 4.1 1h2a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7 8.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.1 2Z',
  mapPin: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  filter: 'M4 5h16l-6 8v6l-4-2v-4L4 5Z',
  play: 'M6 4l14 8-14 8V4Z',
}

export default function Icon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  const d = paths[name] ?? paths.check
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  )
}
