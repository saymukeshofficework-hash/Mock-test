// Genuine numerology arithmetic (Pythagorean system). These are deterministic
// digit-sum calculations, not astronomical predictions — safe to compute
// entirely client-side. Master numbers 11, 22 and 33 are preserved during
// reduction, per standard numerology convention.

const MASTER_NUMBERS = new Set([11, 22, 33])

export function reduceToDigit(input: number, keepMaster = true): number {
  let n = Math.abs(Math.trunc(input))
  while (n > 9 && !(keepMaster && MASTER_NUMBERS.has(n))) {
    n = String(n)
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0)
  }
  return n
}

const PYTHAGOREAN_MAP: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
}
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u'])

function letterSum(name: string, filter: (letter: string) => boolean): number {
  return name
    .toLowerCase()
    .split('')
    .filter((ch) => PYTHAGOREAN_MAP[ch] !== undefined && filter(ch))
    .reduce((sum, ch) => sum + PYTHAGOREAN_MAP[ch], 0)
}

export interface BirthDate {
  day: number
  month: number
  year: number
}

export function parseDateInput(value: string): BirthDate | null {
  // Expects an <input type="date"> value: YYYY-MM-DD
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [, y, m, d] = match
  return { year: Number(y), month: Number(m), day: Number(d) }
}

export function lifePathNumber({ day, month, year }: BirthDate): number {
  const total = reduceToDigit(day) + reduceToDigit(month) + reduceToDigit(year)
  return reduceToDigit(total)
}

export function destinyNumber(fullName: string): number {
  return reduceToDigit(letterSum(fullName, () => true))
}

export function soulUrgeNumber(fullName: string): number {
  return reduceToDigit(letterSum(fullName, (ch) => VOWELS.has(ch)))
}

export function personalityNumber(fullName: string): number {
  return reduceToDigit(letterSum(fullName, (ch) => !VOWELS.has(ch)))
}

export function nameNumber(name: string): number {
  return destinyNumber(name)
}

export function luckyNumbers({ day, month, year }: BirthDate): number[] {
  const life = lifePathNumber({ day, month, year })
  const dayNum = reduceToDigit(day)
  const set = new Set([life, dayNum, reduceToDigit(life + dayNum)])
  return Array.from(set).sort((a, b) => a - b)
}

export function luckyDates(life: number): number[] {
  const dates: number[] = []
  for (let d = 1; d <= 31; d++) {
    if (reduceToDigit(d) === reduceToDigit(life)) dates.push(d)
  }
  return dates
}

export function personalYearNumber({ day, month }: BirthDate, year: number): number {
  return reduceToDigit(reduceToDigit(day) + reduceToDigit(month) + reduceToDigit(year))
}
