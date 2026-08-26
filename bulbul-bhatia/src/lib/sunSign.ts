// Western tropical sun-sign lookup — a fixed, public calendar mapping.
// This is genuinely computable from date of birth alone (unlike Vedic
// Rashi, which depends on the Moon's sidereal position and needs a real
// ephemeris — see lib/calculationEngine.ts for that boundary).

interface SunSignRange {
  slug: string
  start: [number, number] // [month, day]
  end: [number, number]
}

const RANGES: SunSignRange[] = [
  { slug: 'capricorn', start: [1, 1], end: [1, 19] },
  { slug: 'aquarius', start: [1, 20], end: [2, 18] },
  { slug: 'pisces', start: [2, 19], end: [3, 20] },
  { slug: 'aries', start: [3, 21], end: [4, 19] },
  { slug: 'taurus', start: [4, 20], end: [5, 20] },
  { slug: 'gemini', start: [5, 21], end: [6, 20] },
  { slug: 'cancer', start: [6, 21], end: [7, 22] },
  { slug: 'leo', start: [7, 23], end: [8, 22] },
  { slug: 'virgo', start: [8, 23], end: [9, 22] },
  { slug: 'libra', start: [9, 23], end: [10, 22] },
  { slug: 'scorpio', start: [10, 23], end: [11, 21] },
  { slug: 'sagittarius', start: [11, 22], end: [12, 21] },
  { slug: 'capricorn', start: [12, 22], end: [12, 31] },
]

export function sunSignFromDate(month: number, day: number): string {
  const match = RANGES.find(({ start, end }) => {
    const afterStart = month > start[0] || (month === start[0] && day >= start[1])
    const beforeEnd = month < end[0] || (month === end[0] && day <= end[1])
    if (start[0] === end[0]) return month === start[0] && day >= start[1] && day <= end[1]
    return afterStart && beforeEnd
  })
  return match?.slug ?? 'capricorn'
}
