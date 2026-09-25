import { product, site } from '../config'

export const hasWhatsApp = site.whatsappNumber.length >= 10

export function supportUrl(message = `Hello, I need help with ${product.name}.`): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`
}

export function supportMessageForOrder(orderReference?: string | null): string {
  return orderReference
    ? `Hello, I need help with my ${product.name} order. Order reference: ${orderReference}`
    : `Hello, I need help with ${product.name}.`
}

// Same text as marketing/whatsapp-message.txt — keep the two in sync.
export function shareMessage(url = site.siteUrl): string {
  return [
    `*${product.name}*`,
    '',
    '📚 Complete Digital Notes',
    `💰 Price: ${product.priceDisplay}`,
    '⚡ Instant digital access',
    '📄 PDF format',
    '',
    'Buy here:',
    url,
  ].join('\n')
}

export function shareUrl(): string {
  const url = `${site.siteUrl}${site.siteUrl.includes('?') ? '&' : '?'}utm_source=whatsapp-share`
  return `https://wa.me/?text=${encodeURIComponent(shareMessage(url))}`
}
