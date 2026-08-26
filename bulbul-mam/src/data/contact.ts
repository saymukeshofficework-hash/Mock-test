// Centralized, editable contact configuration.
// Replace these placeholder values with Bulbul Mam's real contact details
// before launch. Nothing here is invented as fact anywhere else in the site —
// every page reads from this single source.
export const contactConfig = {
  phone: '+91-XXXXXXXXXX',
  email: 'contact@bulbulmam.example',
  whatsappNumber: '91XXXXXXXXXX',
  instagram: 'https://instagram.com/bulbulmam',
  youtube: 'https://youtube.com/@bulbulmam',
  facebook: 'https://facebook.com/bulbulmam',
  whatsappMessage: 'Hi Bulbul Mam, I would like to book a consultation.',
}

export function whatsappLink(message?: string) {
  const text = encodeURIComponent(message ?? contactConfig.whatsappMessage)
  return `https://wa.me/${contactConfig.whatsappNumber}?text=${text}`
}
