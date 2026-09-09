import type { SchoolSettings } from '../types/school'

const HINDI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']

export function toHindiDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => HINDI_DIGITS[Number(d)])
}

export function formatDate(date: Date, format: SchoolSettings['date_format']): string {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = String(date.getFullYear())
  switch (format) {
    case 'DD-MM-YYYY':
      return `${dd}-${mm}-${yyyy}`
    case 'DD.MM.YYYY':
      return `${dd}.${mm}.${yyyy}`
    default:
      return `${dd}/${mm}/${yyyy}`
  }
}

export function todayFormatted(format: SchoolSettings['date_format']): string {
  return formatDate(new Date(), format)
}
