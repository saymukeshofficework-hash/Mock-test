// Every price on the site is formatted through here — never hardcode a
// "₹" string next to a raw number in a component.
export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`
}

// Returns the savings amount only when both prices are present and the
// discount is actually lower than the original — never fabricate a
// "Save ₹X" line for an invalid or missing discount.
export function savings(price?: number, discountPrice?: number): number | null {
  if (typeof price !== 'number' || typeof discountPrice !== 'number') return null
  if (discountPrice >= price) return null
  return price - discountPrice
}
