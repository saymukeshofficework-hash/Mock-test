import { formatINR, savings } from '../lib/currency'
import type { Pricing } from '../data/types'
import Badge from './Badge'

export default function PriceTag({
  pricing,
  size = 'md',
  suffix,
  onDark = false,
}: {
  pricing: Pricing
  size?: 'sm' | 'md' | 'lg'
  suffix?: string
  onDark?: boolean
}) {
  const { price, discountPrice, offerLabel } = pricing
  const save = savings(price, discountPrice)
  const main = discountPrice ?? price

  const sizeClass = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-base' : 'text-lg'

  if (main === undefined) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`font-bold ${sizeClass} ${onDark ? 'text-white' : 'text-navy-900 dark:text-white'}`}>
        {formatINR(main)}
        {suffix && <span className={`text-sm font-medium ${onDark ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>{suffix}</span>}
      </span>
      {discountPrice && price && (
        <span className={`text-sm line-through ${onDark ? 'text-slate-400' : 'text-slate-400'}`}>{formatINR(price)}</span>
      )}
      {save !== null && <Badge tone="green">Save {formatINR(save)}</Badge>}
      {offerLabel && <Badge tone="gold">{offerLabel}</Badge>}
    </div>
  )
}
