import type { Orientation, PageSize } from '../../types/document'

const SIZES_MM: Record<PageSize, { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  A5: { w: 148, h: 210 },
  Letter: { w: 215.9, h: 279.4 },
  Legal: { w: 215.9, h: 355.6 },
}

export function getPageDimsMm(size: PageSize, orientation: Orientation): { w: number; h: number } {
  const s = SIZES_MM[size]
  return orientation === 'landscape' ? { w: s.h, h: s.w } : { w: s.w, h: s.h }
}
