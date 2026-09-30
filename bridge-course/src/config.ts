// Single source of truth for everything the Bridge Course site SHOWS.
//
// The price CHARGED is never taken from here — it lives in the Supabase `products`
// table and is enforced by the create-razorpay-order Edge Function. `priceDisplay`
// below is only the label; if you change the price, follow
// docs/BRIDGE_COURSE_IMPLEMENTATION.md → "Changing the price" (DB + secret + this label).

const env = import.meta.env

function clean(v: string | undefined): string {
  return (v ?? '').trim()
}

export const site = {
  // Public values only (the publishable key is designed to be public). Defaults match
  // the existing project so a build without env vars still works.
  supabaseUrl: clean(env.VITE_SUPABASE_URL) || 'https://ovaubhekxjtkodkhsybg.supabase.co',
  supabasePublishableKey:
    clean(env.VITE_SUPABASE_PUBLISHABLE_KEY) || 'sb_publishable_LXYxPPuR4tX7vGyWg7NIyA_-F_ieSGW',
  razorpayKeyIdFallback: clean(env.VITE_RAZORPAY_KEY_ID),
  siteUrl: clean(env.VITE_SITE_URL) || 'https://tettesthub.in/bridge-course/',
  // Support WhatsApp, digits only incl. country code. The repository Variable
  // VITE_WHATSAPP_NUMBER overrides this default. Set the default to '' to hide the buttons.
  whatsappNumber: clean(env.VITE_WHATSAPP_NUMBER).replace(/\D/g, '') || '918770375866',
  supportEmail: clean(env.VITE_SUPPORT_EMAIL),
}

export const product = {
  slug: 'bridge-course-notes',
  name: 'Bridge Course Notes by Rakesh Pandey',
  shortName: 'Bridge Course Notes',
  author: 'Rakesh Pandey',
  badge: 'BRIDGE COURSE 2.0',
  tagline: 'Complete digital notes designed for quick revision, understanding and preparation.',
  priceDisplay: '₹199',
  priceNumber: 199,
  currency: 'INR',
  format: 'PDF',
  fileName: 'Bridge Course Notes by Rakesh Pandey.pdf',
  // Server-side values mirrored here only for customer-facing copy.
  maxDownloads: 2, // display only — the real limit is products.max_downloads in the database
  linkExpiryMinutes: 5,
}

// Anything the buy form can sell. `slug` must exist in the products table AND in
// productPrices (supabase/functions/_shared/config.ts); price labels here are display only.
export type SaleItem = { slug: string; name: string; shortName: string; priceDisplay: string }

// ₹49 combo: 7 assignment covers (Course 1–7) + 12-page blank Teaching Plan, one PDF.
export const assignmentCombo = {
  slug: 'assignment-combo',
  name: 'Assignment Combo — 7 Covers + Teaching Plan (शिक्षण योजना)',
  shortName: 'Assignment Combo',
  priceDisplay: '₹49',
  priceNumber: 49,
  pages: 19,
  path: '/assignment-combo',
  courses: [
    'बाल विकास एवं शैक्षिक मनोविज्ञान',
    'पाठ्यचर्या, शिक्षाशास्त्र एवं मूल्यांकन',
    'भाषा का शिक्षाशास्त्र-I (हिंदी)',
    'भाषा-II (अंग्रेज़ी) का शिक्षाशास्त्र',
    'गणित का शिक्षाशास्त्र',
    'हमारे आस-पास की दुनिया का शिक्षाशास्त्र',
    'विद्यालय अनुभव कार्यक्रम एवं प्रायोगिक कार्य',
  ],
}

// ---------------------------------------------------------------------------
// What's inside — taken from the source folder "bridge course notes by Rakesh pandey"
// (Google Drive, exported 2026-09-27). Paper numbers are as printed in the notes.
// Must match the final PDF (content/source/manifest.json order).
// ---------------------------------------------------------------------------

export type Paper = {
  number?: number
  title: string
  titleHi?: string
  language: 'Hindi' | 'English'
  chapters: string[]
}

export const papers: Paper[] = [
  {
    number: 1,
    title: 'Child Development and Educational Psychology',
    titleHi: 'बाल विकास और शैक्षिक मनोविज्ञान',
    language: 'Hindi',
    chapters: ['बाल्यावस्था को समझना', 'बाल्यावस्था और समाजीकरण', 'स्व की भारतीय अवधारणा'],
  },
  {
    number: 2,
    title: 'Curriculum, Pedagogy and Assessment',
    titleHi: 'पाठ्यचर्या, शिक्षाशास्त्र एवं मूल्यांकन',
    language: 'Hindi',
    chapters: ['पाठ्यचर्या'],
  },
  {
    number: 3,
    title: 'Pedagogy of Language-I',
    titleHi: 'भाषा का शिक्षाशास्त्र-I',
    language: 'Hindi',
    chapters: [
      'भाषा-शिक्षा की विभिन्न नीतियाँ एवं बहुभाषिकता',
      'उदीयमान साक्षरता, पाठ्यचर्या-लक्ष्य व सीखने के प्रतिफल',
      'चार ब्लॉक मॉडल एवं मौखिक भाषा-विकास',
      'शब्द-पहचान की विभिन्न रणनीतियाँ',
      'पढ़ना एवं विभिन्न संसाधन',
      'लेखन को समझना और लेखन कौशल का विकास',
      'इकाई-योजना एवं पाठ-योजना का निर्माण',
      'मौखिक भाषा का आकलन',
      'पठन का आकलन',
      'लेखन का आकलन',
      'आकलन के अन्य पक्ष : 360 डिग्री आकलन एवं स्व-संशोधन',
      'पाठ्यक्रम परिचय एवं संपूर्ण पुनरावृत्ति पत्रक',
    ],
  },
  {
    number: 4,
    title: 'Pedagogy of Language-II (English)',
    language: 'English',
    chapters: [
      'Language Education: Policies and Multilingualism',
      'Second Language Acquisition and Curricular Goals',
      'Four Block Approach and Oral Language Development',
      'Word Recognition: Various Strategies',
      'Reading and Various Resources',
      'Understanding Writing and Development of Writing Skills',
      'Unit Planning and Lesson Planning',
      'Assessment of Oral Language',
      'Assessment of Reading',
      'Assessment of Writing in a Second Language',
      'Other Dimensions of Assessment',
      'Course Overview and Revision Sheet',
      'Glossary: Key Terms and Quiz',
      'Suggested Reading: Quick Guide',
    ],
  },
  {
    number: 5,
    title: 'Pedagogy of Mathematics',
    titleHi: 'गणित का शिक्षाशास्त्र',
    language: 'Hindi',
    chapters: [
      'गणित की प्रकृति',
      'बच्चे गणित कैसे सीखते हैं',
      'गणितीय संचार: आँकड़ों का प्रबंधन एवं स्थानिक चिंतन',
      'गणित में शिक्षण अधिगम',
    ],
  },
  {
    number: 6,
    title: 'Pedagogy of The World Around Us',
    titleHi: 'हमारे आस-पास की दुनिया (TWAU) का शिक्षाशास्त्र',
    language: 'Hindi',
    chapters: [
      'TWAU का स्वरूप तथा क्षेत्र',
      'बच्चों के विचार और वैकल्पिक अवधारणाओं को समझना',
      'हमारे आस-पास की दुनिया में अधिगम संसाधन',
      'पाठ्यपुस्तक (हमारा अद्भुत संसार)',
      'योजना निर्माण (Planning)',
      'आकलन',
    ],
  },
]

export const totals = {
  papers: papers.length,
  chapters: papers.reduce((n, p) => n + p.chapters.length, 0),
}

// Buyer-facing copy (feature lists, steps, FAQ…) lives in src/i18n.tsx in Hindi and English.

// Sample pages: real pages of the final PDF with the lower half faded out and a
// watermark (scripts/previews/render_previews_from_pdf.py). Only the top of 3 of the
// 40 chapters is shown, so the paid PDF can't be reconstructed from previews.
// Alt texts: i18n.tsx → samples.alts (same order).
export const samples = [
  { src: 'previews/sample-1.webp' },
  { src: 'previews/sample-2.webp' },
  { src: 'previews/sample-3.webp' },
]

// ---------------------------------------------------------------------------
// Legal / business details. Unknown values stay as visible placeholders — do NOT
// invent them. Fill these in before going live.
// ---------------------------------------------------------------------------

export const business = {
  sellerName: 'Rakesh Pandey',
  address: '', // optional — shown on Terms/Contact only when filled in
  gstin: '', // leave empty unless registered; never invent one
  grievanceOfficer: 'Rakesh Pandey (reach us via the Contact page)',
  lastUpdated: '27 September 2026',
}

// Refund text is configurable and deliberately NOT decided here. Replace
// `refundPolicy.body` with the policy you actually want to offer.
export const refundPolicy = {
  isPlaceholder: false,
  summary: 'Digital product — no refunds once access is given, except when we fail to deliver.',
  body: [
    'Everything sold here (Bridge Course Notes and the Assignment Combo) is a digital PDF delivered instantly after payment. Because the full product is available to you as soon as your payment is verified, purchases cannot be cancelled and are not refundable once access has been given.',
    'You WILL get a full refund if: (a) your payment was successful but we are unable to give you the PDF and our support cannot fix it within 3 working days, or (b) you were accidentally charged more than once for the same order — the extra payment is refunded.',
    'If money was deducted but the payment did not complete, you were not charged: the amount is reversed automatically by your bank/Razorpay.',
    'To ask for a refund, contact us with your order reference (BCN-…) or Razorpay payment ID (pay_…). Approved refunds are made to your original payment method through Razorpay; banks usually credit them within 5–7 working days.',
  ],
}
