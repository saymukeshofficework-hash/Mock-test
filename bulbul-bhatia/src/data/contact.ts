// Centralized, editable contact configuration — every page reads from
// this single source, so updating a number/address here updates it
// everywhere (footer, Contact page, booking WhatsApp link, etc.).
export const contactConfig = {
  phone: '7999381926',
  email: 'bhatiabulbul11@gmail.com',
  // wa.me requires the full number with country code, no leading '+'.
  whatsappNumber: '917999381926',
  instagram: 'https://www.instagram.com/bulbulbhatia11/',
  youtube: 'https://youtube.com/@bulbulbhatia',
  facebook: 'https://facebook.com/bulbulbhatia',
  whatsappMessage: 'Hi Bulbul Bhatia, I would like to book a consultation.',
}

export function whatsappLink(message?: string) {
  const text = encodeURIComponent(message ?? contactConfig.whatsappMessage)
  return `https://wa.me/${contactConfig.whatsappNumber}?text=${text}`
}
