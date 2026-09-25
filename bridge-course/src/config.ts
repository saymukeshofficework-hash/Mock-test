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
  // Digits only incl. country code, e.g. "919876543210". Empty → WhatsApp buttons hidden.
  whatsappNumber: clean(env.VITE_WHATSAPP_NUMBER).replace(/\D/g, ''),
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
  maxDownloads: 5,
  linkExpiryMinutes: 5,
}

// ---------------------------------------------------------------------------
// What's inside — taken from the source folder "bridge course notes by Rakesh pandey"
// (Google Drive, inspected 2026-09-25). Paper numbers are shown only where the notes
// themselves print them. If the compiled PDF differs, update this list.
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
    title: 'Curriculum, Pedagogy and Assessment',
    titleHi: 'पाठ्यचर्या, शिक्षाशास्त्र एवं आकलन',
    language: 'Hindi',
    chapters: ['पाठ्यचर्या'],
  },
  {
    title: 'Pedagogy of Language-I',
    titleHi: 'भाषा-I का शिक्षाशास्त्र',
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

// Features observed in every chapter of the source notes (see docs for evidence).
export const whatYouGet = [
  {
    title: 'In-text questions, answered',
    body: 'Every पाठगत प्रश्न / Check Your Progress question with the correct option marked ✔ and a short explanation of why.',
  },
  {
    title: 'End-of-unit answers',
    body: 'पाठांत प्रश्न / End Exercises written out as structured answers — points, examples and a conclusion.',
  },
  {
    title: 'Quick revision lists',
    body: 'A त्वरित सूची / Quick Revision List and one-glance answer key for each unit.',
  },
  {
    title: 'Tables & comparisons',
    body: 'Key ideas laid out in tables — e.g. EVS vs TWAU, disciplinary vs interdisciplinary, skill-wise summaries.',
  },
  {
    title: 'Practice MCQs',
    body: 'Extra practice MCQs with answers in many units, plus revision sheets, a glossary and a suggested-reading guide for Language-II.',
  },
  {
    title: 'Hindi + English',
    body: 'Five papers in Hindi and Pedagogy of Language-II in English, exactly as the course is taught.',
  },
]

export const whyTheseNotes = [
  'Structured the same way in every unit: in-text questions → quick list → end-of-unit answers.',
  'Easy revision — short points and tables instead of long paragraphs.',
  'Important concepts organised clearly, with the policy references the course uses (NEP 2020, NCF-FS 2022, NCF-SE 2023).',
  'Exam-oriented: answers to the actual in-text and end-of-unit questions, not general theory.',
  'Digital PDF — read on your phone, anywhere, without carrying books.',
]

export const receive = [
  'Complete digital PDF',
  'Instant access after successful payment',
  'Mobile-friendly reading',
  'Downloadable for personal study',
  'No physical delivery',
]

export const howItWorks = [
  'Enter your details',
  `Pay ${product.priceDisplay} securely through Razorpay`,
  'Payment is verified automatically',
  'Download your notes',
]

// Sample pages: typeset excerpts from real chapters. Only the top part of 3 of the
// 40 chapters is shown, so the paid PDF can't be reconstructed from previews.
export const samples = [
  { src: 'previews/sample-1.webp', alt: 'Sample page — Paper 1, इकाई 1: बाल्यावस्था को समझना (in-text MCQs with explanations)' },
  { src: 'previews/sample-2.webp', alt: 'Sample page — Paper 4, Unit 4: Word Recognition (Check Your Progress with model answers)' },
  { src: 'previews/sample-3.webp', alt: 'Sample page — Paper 6, इकाई 1: TWAU का स्वरूप तथा क्षेत्र (key points and tables)' },
]

// ---------------------------------------------------------------------------
// Legal / business details. Unknown values stay as visible placeholders — do NOT
// invent them. Fill these in before going live.
// ---------------------------------------------------------------------------

export const business = {
  sellerName: '[Seller / business name — to be filled in]',
  address: '[Business address — to be filled in]',
  gstin: '', // leave empty unless registered; never invent one
  grievanceOfficer: '[Name of person handling complaints — to be filled in]',
  lastUpdated: '25 September 2026',
}

// Refund text is configurable and deliberately NOT decided here. Replace
// `refundPolicy.body` with the policy you actually want to offer.
export const refundPolicy = {
  isPlaceholder: true,
  summary: '[Refund policy to be decided by the seller]',
  body: [
    '[Write your refund policy here. For example, state whether refunds are offered for digital products, within how many days, and how a customer should ask for one.]',
    'If your payment was deducted but you did not receive access, that is not a refund case — use “Check Payment Status” or contact support and we will give you access or, if the payment did not complete, it is reversed by your bank/Razorpay as per their timelines.',
  ],
}
